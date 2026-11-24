import {
  Brackets,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import qs from 'qs';
import {
  Paginated,
  PaginatedLinks,
  PaginatedMeta,
} from '../dto/offset-pagination/paginated.dto';
import { AllowedFilter } from './allowed-filter';
import { AllowedInclude } from './allowed-include';
import { AllowedSort } from './allowed-sort';
import {
  getGlobalConfig,
  QueryBuilderConfig,
  QueryBuilderUserConfig,
  setGlobalConfig,
} from './config';
import {
  Cursor,
  CursorPaginated,
  CursorPaginatedLinks,
  CursorPaginatedMeta,
  CursorPaginateOptions,
} from './cursor';
import {
  InvalidFieldQueryException,
  InvalidFilterQueryException,
  InvalidIncludeQueryException,
  InvalidSortQueryException,
} from './exceptions';
import { QueryParams } from './types';

/**
 * A fluent, feature-complete query builder for TypeORM.
 *
 * Provides a clean, secure, whitelist-based API for filtering, sorting,
 * including relations, sparse fieldsets, and paginating TypeORM queries.
 *
 * @example
 * ```ts
 * // Configure globally (optional, e.g. in main.ts)
 * QueryBuilder.configure({
 *   strictMode: true,
 *   defaultLimit: 20,
 * });
 *
 * // In your service
 * async findAll(query: QueryParams) {
 *   return QueryBuilder.for(this.userRepo, query)
 *     .allowedFilters([
 *       'name',                                      // partial (ILIKE)
 *       AllowedFilter.exact('status'),               // exact (=)
 *       AllowedFilter.startsWith('code'),            // prefix (INV%)
 *       AllowedFilter.operator('minAge', '>=', 'age'), // comparison
 *       AllowedFilter.trashed(),                     // soft deletes (with/only/without)
 *       AllowedFilter.scope('search', (qb, val, a) => ...),
 *     ])
 *     .allowedSorts(['id', 'name', 'createdAt'])
 *     .defaultSort('-createdAt')
 *     .allowedIncludes(['roles', 'profile', AllowedInclude.count('comments')])
 *     .allowedFields(['id', 'name', 'email', 'roles.id', 'roles.name'])
 *     .strict(true)
 *     .paginate();
 * }
 * ```
 */
export class QueryBuilder<T extends ObjectLiteral> {
  private readonly qb: SelectQueryBuilder<T>;
  private readonly alias: string;
  private readonly query: QueryParams;
  private readonly config: QueryBuilderConfig;

  private _filters: AllowedFilter<T>[] = [];
  private _sorts: AllowedSort<T>[] = [];
  private _includes: AllowedInclude<T>[] = [];
  private _fields: string[] = [];
  private _defaultSortStr?: string;
  private _defaultLimit: number;
  private _maxLimit: number;
  private _strictMode: boolean;
  private _joinedAliases = new Set<string>();
  private _built = false;
  private _filterIndex = 0;

  private constructor(qb: SelectQueryBuilder<T>, query: QueryParams) {
    this.qb = qb;
    this.alias = qb.alias;
    this.query = this.normalizeQuery(query);
    this.config = getGlobalConfig();

    this._defaultLimit = this.config.defaultLimit;
    this._maxLimit = this.config.maxLimit;
    this._strictMode = this.config.strictMode;

    // Seed already-joined aliases from the base SelectQueryBuilder to prevent duplicate JOIN SQL errors
    const existingJoins = (qb as any).expressionMap?.joinAttributes;
    if (Array.isArray(existingJoins)) {
      for (const join of existingJoins) {
        if (join?.alias?.name) {
          this._joinedAliases.add(join.alias.name);
        }
      }
    }
  }

  /**
   * Normalizes incoming query params by deserializing bracket notation (e.g. filter[name]=foo -> filter.name = foo)
   * while preserving raw primitive types (numbers, booleans, objects) from programmatic calls,
   * matching standard Laravel / Spatie QueryBuilder specification.
   * Blocks prototype-polluting keys (__proto__, constructor, prototype).
   */
  private normalizeQuery(raw: QueryParams | Record<string, any>): QueryParams {
    if (!raw || typeof raw !== 'object') return {} as QueryParams;

    const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
    const result: Record<string, any> = {};

    for (const [key, val] of Object.entries(raw)) {
      if (FORBIDDEN_KEYS.has(key)) continue;

      const match = key.match(/^([^[]+)\[([^\]]+)\]$/);
      if (match) {
        const [, rootKey, nestedKey] = match;
        if (FORBIDDEN_KEYS.has(rootKey) || FORBIDDEN_KEYS.has(nestedKey)) {
          continue;
        }
        if (
          !Object.prototype.hasOwnProperty.call(result, rootKey) ||
          !result[rootKey] ||
          typeof result[rootKey] !== 'object' ||
          Array.isArray(result[rootKey])
        ) {
          result[rootKey] = {};
        }
        result[rootKey][nestedKey] = val;
      } else if (val && typeof val === 'object' && !Array.isArray(val)) {
        const sanitizedNested: Record<string, any> = {};
        for (const [nKey, nVal] of Object.entries(val)) {
          if (!FORBIDDEN_KEYS.has(nKey)) {
            sanitizedNested[nKey] = nVal;
          }
        }
        result[key] =
          Object.prototype.hasOwnProperty.call(result, key) &&
          result[key] &&
          typeof result[key] === 'object' &&
          !Array.isArray(result[key])
            ? { ...sanitizedNested, ...result[key] }
            : sanitizedNested;
      } else {
        result[key] = val;
      }
    }

    return result as QueryParams;
  }

  /**
   * Globally configure QueryBuilder defaults.
   */
  static configure(config: QueryBuilderUserConfig): QueryBuilderConfig {
    return setGlobalConfig(config);
  }

  /**
   * Create a new QueryBuilder from a Repository or existing SelectQueryBuilder.
   *
   * @param source - TypeORM Repository or SelectQueryBuilder
   * @param query - Parsed query parameters from the request
   */
  static for<T extends ObjectLiteral>(
    source: Repository<T> | SelectQueryBuilder<T>,
    query: QueryParams | Record<string, any> = {},
  ): QueryBuilder<T> {
    let qb: SelectQueryBuilder<T>;

    if (isRepository(source)) {
      const entityName = source.metadata.targetName;
      const alias = entityName
        .replace(/Entity$/i, '')
        .replace(/^./, (c) => c.toLowerCase());
      qb = source.createQueryBuilder(alias);
    } else {
      qb = source;
    }

    return new QueryBuilder<T>(qb, query as QueryParams);
  }

  // ─── CONFIGURATION (Fluent API) ─────────────────────────

  /**
   * Enable or disable strict mode for this query.
   * In strict mode, an exception is thrown when the client requests
   * an unallowed filter, sort, include, or field.
   */
  strict(enabled = true): this {
    this._strictMode = enabled;
    return this;
  }

  /**
   * Define the allowed filters for this query.
   * Strings default to **partial** (ILIKE) filters.
   */
  allowedFilters(filters: (string | AllowedFilter<T>)[]): this {
    this._filters = filters.map((f) =>
      typeof f === 'string' ? AllowedFilter.partial<T>(f) : f,
    );
    return this;
  }

  /**
   * Define the allowed sorts for this query.
   * Strings default to column sorts. Use `-` prefix for descending order.
   */
  allowedSorts(sorts: (string | AllowedSort<T>)[]): this {
    this._sorts = sorts.map((s) =>
      typeof s === 'string' ? AllowedSort.field<T>(s) : s,
    );
    return this;
  }

  /**
   * Set the default sort when no sort parameter is provided.
   */
  defaultSort(sort: string): this {
    this._defaultSortStr = sort;
    return this;
  }

  /**
   * Define the allowed includes (relations) for this query.
   * Strings default to `leftJoinAndSelect`.
   */
  allowedIncludes(includes: (string | AllowedInclude<T>)[]): this {
    this._includes = includes.map((i) =>
      typeof i === 'string' ? AllowedInclude.relationship<T>(i) : i,
    );
    return this;
  }

  /**
   * Define the allowed fields (sparse fieldsets) for this query.
   * Frontend: ?fields=id,name or ?fields[user]=id,name&fields[roles]=id,title
   *
   * @example
   * .allowedFields(['id', 'name', 'email', 'roles.id', 'roles.title'])
   */
  allowedFields(fields: string[]): this {
    this._fields = fields;
    return this;
  }

  /**
   * Override default and maximum limit for pagination.
   */
  setLimit(defaultLimit: number, maxLimit?: number): this {
    this._defaultLimit = defaultLimit;
    if (maxLimit !== undefined) this._maxLimit = maxLimit;
    return this;
  }

  /**
   * Add a direct WHERE clause that is always applied, regardless of query params.
   */
  where(condition: string, parameters?: Record<string, any>): this {
    this.qb.andWhere(condition, parameters);
    return this;
  }

  // ─── TERMINAL METHODS (Execute) ─────────────────────────

  /**
   * Execute the query with offset pagination adhering to the nestjs-paginate standard.
   *
   * Returns a response matching `{ data: T[], meta: PaginatedMeta, links: PaginatedLinks }`.
   *
   * @param options - Default limit or pagination options { defaultLimit?: number; path?: string }
   */
  async paginate(
    options?: number | { defaultLimit?: number; path?: string },
  ): Promise<Paginated<T>> {
    this.build();

    const overrideDefault =
      typeof options === 'number' ? options : options?.defaultLimit;
    const limit = this.resolveLimit(overrideDefault);
    const page = this.resolvePage();
    const offset = (page - 1) * limit;

    this.qb.skip(offset).take(limit);

    const [entities, totalRecords] = await this.qb.getManyAndCount();

    const totalPages = limit > 0 ? Math.ceil(totalRecords / limit) : 1;
    const currentPage = Math.max(1, Math.min(page, totalPages || 1));
    const sortBy = this.resolveSortBy();
    const search =
      typeof this.query.search === 'string' && this.query.search.trim()
        ? this.query.search.trim()
        : undefined;
    const select = this.resolveSelectFields();
    const rawFilter = this.query[this.config.parameters.filter];
    const filter =
      typeof rawFilter === 'object' &&
      rawFilter !== null &&
      !Array.isArray(rawFilter)
        ? (rawFilter as Record<string, string | string[]>)
        : undefined;

    const meta: PaginatedMeta<T> = {
      itemsPerPage: limit,
      totalItems: totalRecords,
      currentPage,
      totalPages,
      sortBy,
      search,
      select,
      filter,
    };

    const basePath = this.resolveBasePath(options);

    const buildLink = (targetPage: number): string => {
      const q: Record<string, any> = { ...this.query };
      delete q.path;
      q[this.config.parameters.page] = targetPage;
      q[this.config.parameters.limit] = limit;

      const queryString = qs.stringify(q, {
        encode: true,
        encoder: (str, _defaultEncoder, _charset, type) =>
          type === 'key' ? str : encodeURIComponent(str).replace(/%2C/g, ','),
        arrayFormat: 'brackets',
        filter: (_prefix, value) => (value === undefined ? undefined : value),
      });

      return basePath ? `${basePath}?${queryString}` : `?${queryString}`;
    };

    const links: PaginatedLinks = {
      first: currentPage === 1 ? undefined : buildLink(1),
      previous: currentPage - 1 < 1 ? undefined : buildLink(currentPage - 1),
      current: buildLink(currentPage),
      next:
        currentPage + 1 > totalPages ? undefined : buildLink(currentPage + 1),
      last:
        currentPage === totalPages || totalRecords === 0
          ? undefined
          : buildLink(totalPages),
    };

    return new Paginated<T>(entities, meta, links);
  }

  /**
   * Execute the query with keyset cursor pagination matching Laravel's `cursorPaginate()`.
   *
   * Uses `WHERE` keyset conditions + `LIMIT (n + 1)` lookahead (no `OFFSET` scan),
   * supports bidirectional navigation (`next` / `previous`) with URL-safe base64 cursors,
   * and automatically builds full `links.next` / `links.previous` via `pathResolver`.
   */
  async cursorPaginate(
    options?: number | CursorPaginateOptions,
  ): Promise<CursorPaginated<T>> {
    this.build(true);

    const opts: CursorPaginateOptions =
      typeof options === 'number' ? { defaultLimit: options } : (options ?? {});
    const limit = this.resolveLimit(opts.defaultLimit);
    const tieBreaker = opts.tieBreaker ?? 'id';
    const orders = this.resolveCursorOrders(tieBreaker);

    const cursorKey = this.config.parameters.cursor;
    const rawCursor = this.query[cursorKey];
    const parsedCursor =
      typeof rawCursor === 'string' ? Cursor.fromEncoded(rawCursor) : null;

    // Only apply cursor if all active sort columns exist in the decoded cursor parameters
    const hasAllCursorKeys =
      parsedCursor !== null &&
      orders.every((o) => {
        const key = o.sort.getCursorKey();
        return (
          Object.prototype.hasOwnProperty.call(parsedCursor.parameters, key) &&
          parsedCursor.parameters[key] !== undefined
        );
      });
    const activeCursor = hasAllCursorKeys ? parsedCursor : null;
    const isReverse = activeCursor !== null && !activeCursor.pointsToNextItems;

    // Apply ORDER BY (inverted when navigating backwards, matching Laravel's paginateUsingCursor)
    orders.forEach((order, idx) => {
      const target = order.sort.getTargetExpression(this.alias);
      const effectiveDir: 'ASC' | 'DESC' = isReverse
        ? order.direction === 'ASC'
          ? 'DESC'
          : 'ASC'
        : order.direction;

      if (idx === 0) {
        this.qb.orderBy(target, effectiveDir);
      } else {
        this.qb.addOrderBy(target, effectiveDir);
      }
    });

    // Apply keyset WHERE clause when navigating from a cursor
    if (activeCursor) {
      this.applyCursorWhere(orders, activeCursor.parameters, isReverse);
    }

    // Fetch limit + 1 rows to determine if more items exist without running COUNT(*)
    this.qb.take(limit + 1);
    const rows = await this.qb.getMany();
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;

    if (isReverse) {
      items.reverse();
    }

    const hasNext =
      activeCursor === null
        ? hasMore
        : activeCursor.pointsToNextItems
          ? hasMore
          : items.length > 0;

    const hasPrevious =
      activeCursor === null
        ? false
        : activeCursor.pointsToNextItems
          ? items.length > 0
          : hasMore;

    const nextCursor =
      hasNext && items.length > 0
        ? new Cursor(
            this.extractCursorParams(items[items.length - 1], orders),
            true,
          ).encode()
        : null;

    const prevCursor =
      hasPrevious && items.length > 0
        ? new Cursor(this.extractCursorParams(items[0], orders), false).encode()
        : null;

    const basePath = this.resolveBasePath(opts);

    const buildCursorLink = (targetCursor: string): string => {
      const q: Record<string, any> = { ...this.query };
      delete q.path;
      delete q[this.config.parameters.page];
      q[cursorKey] = targetCursor;
      q[this.config.parameters.limit] = limit;

      const queryString = qs.stringify(q, {
        encode: true,
        encoder: (str, _defaultEncoder, _charset, type) =>
          type === 'key' ? str : encodeURIComponent(str).replace(/%2C/g, ','),
        arrayFormat: 'brackets',
        filter: (_prefix, value) => (value === undefined ? undefined : value),
      });

      return basePath ? `${basePath}?${queryString}` : `?${queryString}`;
    };

    const meta: CursorPaginatedMeta = {
      itemsPerPage: limit,
      nextCursor,
      prevCursor,
      hasMore: Boolean(nextCursor),
    };

    const links: CursorPaginatedLinks = {
      next: nextCursor ? buildCursorLink(nextCursor) : undefined,
      previous: prevCursor ? buildCursorLink(prevCursor) : undefined,
    };

    return new CursorPaginated<T>(items, meta, links);
  }

  /** Execute the query and return all matching entities. */
  async getMany(): Promise<T[]> {
    this.build();
    return this.qb.getMany();
  }

  /** Execute the query and return entities with total count. */
  async getManyAndCount(): Promise<[T[], number]> {
    this.build();
    return this.qb.getManyAndCount();
  }

  /** Execute the query and return the first matching entity or null. */
  async getOne(): Promise<T | null> {
    this.build();
    return this.qb.getOne();
  }

  /**
   * Get the underlying TypeORM SelectQueryBuilder after applying all configurations.
   */
  getQueryBuilder(): SelectQueryBuilder<T> {
    this.build();
    return this.qb;
  }

  // ─── INTERNAL BUILD PROCESS ─────────────────────────────

  private build(skipSorts = false): void {
    if (this._built) return;
    this._built = true;

    // Apply includes before fields so sparse fieldsets on relations are not overwritten by leftJoinAndSelect
    this.applyIncludes();
    this.applyFields();
    this.applyFilters();
    if (!skipSorts) {
      this.applySorts();
    }
  }

  private resolveCursorOrders(
    tieBreaker: string,
  ): Array<{ sort: AllowedSort<T>; direction: 'ASC' | 'DESC' }> {
    const sortParam = this.query[this.config.parameters.sort];
    const sortMap = new Map(this._sorts.map((s) => [s.name, s]));
    const allowedNames = Array.from(sortMap.keys());
    const parts = this.toParameterArray(sortParam);

    const orders: Array<{ sort: AllowedSort<T>; direction: 'ASC' | 'DESC' }> =
      [];
    const seenKeys = new Set<string>();

    if (parts.length > 0) {
      const invalid: string[] = [];
      for (const trimmed of parts) {
        const isDesc = trimmed.startsWith('-');
        const name = isDesc ? trimmed.slice(1) : trimmed;
        const direction: 'ASC' | 'DESC' = isDesc ? 'DESC' : 'ASC';

        const sort = sortMap.get(name);
        if (!sort) {
          invalid.push(name);
          continue;
        }
        if (!sort.customFn) {
          const cursorKey = sort.getCursorKey();
          if (!seenKeys.has(cursorKey)) {
            seenKeys.add(cursorKey);
            orders.push({ sort, direction });
          }
        }
      }

      if (this._strictMode && invalid.length > 0) {
        throw new InvalidSortQueryException(invalid, allowedNames);
      }
    }

    if (orders.length === 0 && this._defaultSortStr) {
      for (const part of this._defaultSortStr.split(',').filter(Boolean)) {
        const trimmed = part.trim();
        const isDesc = trimmed.startsWith('-');
        const name = isDesc ? trimmed.slice(1) : trimmed;
        const direction: 'ASC' | 'DESC' = isDesc ? 'DESC' : 'ASC';
        const sort = sortMap.get(name);
        const resolved =
          sort && !sort.customFn ? sort : AllowedSort.field<T>(name);
        const cursorKey = resolved.getCursorKey();
        if (!seenKeys.has(cursorKey)) {
          seenKeys.add(cursorKey);
          orders.push({ sort: resolved, direction });
        }
      }
    }

    if (orders.length === 0) {
      orders.push({
        sort: AllowedSort.field<T>(tieBreaker),
        direction: 'DESC',
      });
    } else if (!orders.some((o) => o.sort.getCursorKey() === tieBreaker)) {
      orders.push({
        sort: AllowedSort.field<T>(tieBreaker),
        direction: orders[orders.length - 1].direction,
      });
    }

    return orders;
  }

  private applyCursorWhere(
    orders: Array<{ sort: AllowedSort<T>; direction: 'ASC' | 'DESC' }>,
    cursorParams: Record<string, any>,
    isReverse: boolean,
  ): void {
    if (orders.length === 1) {
      const order = orders[0];
      const effectiveDir = isReverse
        ? order.direction === 'ASC'
          ? 'DESC'
          : 'ASC'
        : order.direction;
      const target = order.sort.getTargetExpression(this.alias);
      const val = cursorParams[order.sort.getCursorKey()];
      if (val === null) {
        if (effectiveDir === 'DESC') {
          this.qb.andWhere(`${target} IS NOT NULL`);
        } else {
          this.qb.andWhere('1 = 0');
        }
        return;
      }
      const op = effectiveDir === 'ASC' ? '>' : '<';
      this.qb.andWhere(`${target} ${op} :qb_c_0`, {
        qb_c_0: val,
      });
      return;
    }

    // Multi-column lexicographic keyset comparison:
    // (c0 < :v0) OR (c0 = :v0 AND c1 < :v1) OR ...
    // Handles PostgreSQL NULL ordering (DESC = NULLS FIRST, ASC = NULLS LAST)
    const branches: Array<{ expr: string; params: Record<string, any> }> = [];

    orders.forEach((order, i) => {
      const effectiveDir = isReverse
        ? order.direction === 'ASC'
          ? 'DESC'
          : 'ASC'
        : order.direction;
      const curVal = cursorParams[order.sort.getCursorKey()];

      // In PostgreSQL ASC (NULLS LAST), no value comes strictly after NULL
      if (curVal === null && effectiveDir === 'ASC') {
        return;
      }

      const clauses: string[] = [];
      const params: Record<string, any> = {};

      for (let j = 0; j < i; j++) {
        const prevTarget = orders[j].sort.getTargetExpression(this.alias);
        const prevVal = cursorParams[orders[j].sort.getCursorKey()];
        if (prevVal === null) {
          clauses.push(`${prevTarget} IS NULL`);
        } else {
          const eqParam = `qb_c_${i}_${j}`;
          clauses.push(`${prevTarget} = :${eqParam}`);
          params[eqParam] = prevVal;
        }
      }

      const curTarget = order.sort.getTargetExpression(this.alias);
      if (curVal === null) {
        // DESC (NULLS FIRST): all non-null values come after NULL
        clauses.push(`${curTarget} IS NOT NULL`);
      } else {
        const op = effectiveDir === 'ASC' ? '>' : '<';
        const cmpParam = `qb_c_${i}_${i}`;
        clauses.push(`${curTarget} ${op} :${cmpParam}`);
        params[cmpParam] = curVal;
      }

      branches.push({ expr: `(${clauses.join(' AND ')})`, params });
    });

    if (branches.length === 0) {
      this.qb.andWhere('1 = 0');
      return;
    }

    this.qb.andWhere(
      new Brackets((subQb) => {
        branches.forEach((branch, idx) => {
          if (idx === 0) {
            subQb.where(branch.expr, branch.params);
          } else {
            subQb.orWhere(branch.expr, branch.params);
          }
        });
      }),
    );
  }

  private extractCursorParams(
    entity: T,
    orders: Array<{ sort: AllowedSort<T>; direction: 'ASC' | 'DESC' }>,
  ): Record<string, any> {
    const params: Record<string, any> = {};
    for (const order of orders) {
      params[order.sort.getCursorKey()] = order.sort.extractCursorValue(entity);
    }
    return params;
  }

  private resolveBasePath(
    options?: number | { defaultLimit?: number; path?: string },
  ): string {
    if (typeof options === 'object' && typeof options?.path === 'string') {
      return options.path;
    }
    if (typeof this.config.pathResolver === 'function') {
      const resolved = this.config.pathResolver();
      if (typeof resolved === 'string' && resolved.length > 0) {
        return resolved;
      }
    }
    return '';
  }

  private parseScopedFieldValues(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.map(String);
    }
    if (typeof value === 'string') {
      return value.split(',');
    }
    return [];
  }

  private applyFields(): void {
    const fieldsParam = this.query[this.config.parameters.fields];
    if (!fieldsParam) return;

    const requestedFields: string[] = [];

    if (typeof fieldsParam === 'string') {
      requestedFields.push(
        ...fieldsParam
          .split(',')
          .map((f) => f.trim())
          .filter(Boolean),
      );
    } else if (Array.isArray(fieldsParam)) {
      for (const raw of fieldsParam) {
        if (typeof raw !== 'string') continue;
        requestedFields.push(
          ...raw
            .split(',')
            .map((f) => f.trim())
            .filter(Boolean),
        );
      }
    } else if (typeof fieldsParam === 'object' && fieldsParam !== null) {
      for (const [scope, value] of Object.entries(fieldsParam)) {
        const valArr = this.parseScopedFieldValues(value);
        for (const rawField of valArr) {
          const field = rawField.trim();
          if (!field) continue;
          if (scope === this.alias || scope === `${this.alias}s`) {
            requestedFields.push(field);
          } else {
            requestedFields.push(
              field.includes('.') ? field : `${scope}.${field}`,
            );
          }
        }
      }
    }

    if (requestedFields.length === 0) return;

    if (this._fields.length === 0) {
      if (this._strictMode) {
        throw new InvalidFieldQueryException(requestedFields, []);
      }
      return;
    }

    // Strict mode validation
    if (this._strictMode) {
      const allowedSet = new Set(this._fields);
      const invalid = requestedFields.filter((f) => !allowedSet.has(f));
      if (invalid.length > 0) {
        throw new InvalidFieldQueryException(invalid, this._fields);
      }
    }

    const validFields = requestedFields.filter((f) => this._fields.includes(f));

    if (validFields.length === 0) return;

    const rootFields: string[] = [];
    const relationFields: string[] = [];
    const joinAttrs = (this.qb as any).expressionMap?.joinAttributes;
    const hasJoinMetadata = Array.isArray(joinAttrs);
    const activeJoinAliases = hasJoinMetadata
      ? new Set<string>([
          ...this._joinedAliases,
          ...joinAttrs
            .map((j: any) => j?.alias?.name)
            .filter((n: any): n is string => typeof n === 'string'),
        ])
      : this._joinedAliases;

    for (const f of validFields) {
      if (f.includes('.')) {
        const relAlias = f.split('.')[0];
        if (!hasJoinMetadata || activeJoinAliases.has(relAlias)) {
          relationFields.push(f);
        }
      } else {
        rootFields.push(`${this.alias}.${f}`);
      }
    }

    if (rootFields.length > 0) {
      // Ensure primary key columns are always selected on real TypeORM queries so entity hydration and take() distinct subqueries never fail
      const primaryCols = (this.qb as any).expressionMap?.mainAlias?.metadata
        ?.primaryColumns;
      if (Array.isArray(primaryCols)) {
        for (const col of primaryCols) {
          const pkField = `${this.alias}.${col.propertyName}`;
          if (!rootFields.includes(pkField)) {
            rootFields.unshift(pkField);
          }
        }
      }
      this.qb.select(rootFields);
    }
    if (relationFields.length > 0) {
      if (rootFields.length > 0) {
        this.qb.addSelect(relationFields);
      } else {
        // Preserve root entity columns when only relation sparse fields are requested
        this.qb.select(this.alias).addSelect(relationFields);
      }
    }
  }

  private applyFilters(): void {
    const rawFilterParams = this.query[this.config.parameters.filter];
    const filterParams: Record<string, any> =
      rawFilterParams &&
      typeof rawFilterParams === 'object' &&
      !Array.isArray(rawFilterParams)
        ? rawFilterParams
        : {};

    const allowedMap = new Map(this._filters.map((f) => [f.name, f]));
    const allowedNames = Array.from(allowedMap.keys());

    // Strict mode validation for explicitly requested filter keys
    if (this._strictMode && Object.keys(filterParams).length > 0) {
      const invalid = Object.keys(filterParams).filter(
        (k) => !allowedMap.has(k),
      );
      if (invalid.length > 0) {
        throw new InvalidFilterQueryException(invalid, allowedNames);
      }
    }

    for (const filter of this._filters) {
      const isProvided = Object.prototype.hasOwnProperty.call(
        filterParams,
        filter.name,
      );

      if (isProvided) {
        filter.apply(
          this.qb,
          this.alias,
          filterParams[filter.name],
          this._filterIndex++,
        );
      } else if (filter.hasDefault()) {
        filter.apply(
          this.qb,
          this.alias,
          filter.getDefault(),
          this._filterIndex++,
        );
      }
    }
  }

  private toParameterArray(param: unknown): string[] {
    if (Array.isArray(param)) {
      return param
        .filter(
          (p) =>
            typeof p === 'string' ||
            typeof p === 'number' ||
            typeof p === 'boolean',
        )
        .map((p) => String(p).trim())
        .filter(Boolean);
    }
    if (typeof param === 'string') {
      return param
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
    }
    return [];
  }

  private applySorts(): void {
    const sortParam = this.query[this.config.parameters.sort];
    const sortMap = new Map(this._sorts.map((s) => [s.name, s]));
    const allowedNames = Array.from(sortMap.keys());
    const parts = this.toParameterArray(sortParam);

    if (parts.length > 0) {
      const invalid: string[] = [];
      const seenSorts = new Set<string>();
      let isFirst = true;

      for (const trimmed of parts) {
        const isDesc = trimmed.startsWith('-');
        const name = isDesc ? trimmed.slice(1) : trimmed;
        const direction: 'ASC' | 'DESC' = isDesc ? 'DESC' : 'ASC';

        const sort = sortMap.get(name);
        if (!sort) {
          invalid.push(name);
          continue;
        }
        if (seenSorts.has(name)) continue;
        seenSorts.add(name);

        sort.apply(this.qb, this.alias, direction, isFirst);
        isFirst = false;
      }

      if (this._strictMode && invalid.length > 0) {
        throw new InvalidSortQueryException(invalid, allowedNames);
      }

      if (!isFirst) return; // at least one sort was applied
    }

    // fallback to default sort
    if (this._defaultSortStr) {
      this.applyDefaultSort(sortMap);
    }
  }

  private applyDefaultSort(sortMap: Map<string, AllowedSort<T>>): void {
    const parts = this._defaultSortStr!.split(',').filter(Boolean);
    let isFirst = true;

    for (const part of parts) {
      const trimmed = part.trim();
      const isDesc = trimmed.startsWith('-');
      const name = isDesc ? trimmed.slice(1) : trimmed;
      const direction: 'ASC' | 'DESC' = isDesc ? 'DESC' : 'ASC';

      const sort = sortMap.get(name);
      if (sort) {
        sort.apply(this.qb, this.alias, direction, isFirst);
      } else {
        const target = name.includes('.') ? name : `${this.alias}.${name}`;
        if (isFirst) {
          this.qb.orderBy(target, direction);
        } else {
          this.qb.addOrderBy(target, direction);
        }
      }
      isFirst = false;
    }
  }

  private applyIncludes(): void {
    const includeParam = this.query[this.config.parameters.include];
    const parts = this.toParameterArray(includeParam);
    if (parts.length === 0) return;

    const allowedMap = new Map(this._includes.map((i) => [i.name, i]));
    const allowedNames = Array.from(allowedMap.keys());

    if (this._strictMode) {
      const invalid = parts.filter((p) => !allowedMap.has(p));
      if (invalid.length > 0) {
        throw new InvalidIncludeQueryException(invalid, allowedNames);
      }
    }

    for (const name of parts) {
      const include = allowedMap.get(name);
      if (!include) continue;

      include.apply(
        this.qb,
        this.alias,
        this._joinedAliases,
        this.config.countSuffix,
      );
    }
  }

  private resolveSortBy(): [string, 'ASC' | 'DESC'][] {
    const sortParam = this.query[this.config.parameters.sort];
    const parts = this.toParameterArray(sortParam);
    if (parts.length > 0) {
      const allowedNames =
        this._sorts.length > 0 ? new Set(this._sorts.map((s) => s.name)) : null;
      const resolved = parts
        .map((part): [string, 'ASC' | 'DESC'] => {
          const isDesc = part.startsWith('-');
          const col = isDesc ? part.slice(1) : part;
          return [col, isDesc ? 'DESC' : 'ASC'];
        })
        .filter(([col]) => !allowedNames || allowedNames.has(col));

      if (resolved.length > 0) {
        return resolved;
      }
    }

    if (this._defaultSortStr) {
      return this._defaultSortStr
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
        .map((part) => {
          const isDesc = part.startsWith('-');
          const col = isDesc ? part.slice(1) : part;
          return [col, isDesc ? 'DESC' : 'ASC'];
        });
    }

    return [];
  }

  private resolveSelectFields(): string[] | undefined {
    const fieldsParam = this.query[this.config.parameters.fields];
    if (typeof fieldsParam === 'string') {
      return fieldsParam
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean);
    }
    if (Array.isArray(fieldsParam)) {
      return fieldsParam.map(String).filter(Boolean);
    }
    return undefined;
  }

  private resolveLimit(overrideDefault?: number): number {
    const limitKey = this.config.parameters.limit;
    const raw = Math.floor(Number(this.query[limitKey]));
    const limit =
      Number.isFinite(raw) && raw >= 1
        ? raw
        : (overrideDefault ?? this._defaultLimit);

    return Math.max(1, Math.min(limit, this._maxLimit));
  }

  private resolvePage(): number {
    const pageKey = this.config.parameters.page;
    const raw = Math.floor(Number(this.query[pageKey]));
    const page = Number.isFinite(raw) && raw >= 1 ? raw : 1;
    return Math.min(page, this.config.maxPage);
  }
}

// ─── HELPERS ────────────────────────────────────────────

function isRepository<T extends ObjectLiteral>(
  source: Repository<T> | SelectQueryBuilder<T>,
): source is Repository<T> {
  return (
    'target' in source && 'metadata' in source && 'createQueryBuilder' in source
  );
}
