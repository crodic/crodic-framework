import { Brackets, ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { getGlobalConfig } from './config';
import {
  buildJsonbExpression,
  JsonbCastType,
  normalizeJsonbPath,
} from './jsonb.helper';
import { FilterApplyFn, FilterCallbackFn, FilterInterface } from './types';

export enum FilterOperator {
  EXACT = 'exact',
  PARTIAL = 'partial',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  OPERATOR = 'operator',
  SCOPE = 'scope',
  CUSTOM = 'custom',
  CALLBACK = 'callback',
  TRASHED = 'trashed',
  GROUP = 'group',
}

export type ComparisonOperator =
  '=' | '!=' | '<>' | '>' | '>=' | '<' | '<=' | 'dynamic';

export interface JsonFilterOptions {
  /** Filter operator: 'exact' (default), 'partial', 'starts_with', 'ends_with', or comparison operator */
  operator?:
    'exact' | 'partial' | 'starts_with' | 'ends_with' | ComparisonOperator;
  /** Optional PostgreSQL type cast (e.g. 'numeric', 'boolean', 'timestamptz') */
  cast?: JsonbCastType;
}

const DYNAMIC_OPERATORS: readonly Exclude<ComparisonOperator, 'dynamic'>[] = [
  '>=',
  '<=',
  '!=',
  '<>',
  '>',
  '<',
  '=',
];

function isScalar(value: unknown): value is string | number | boolean {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

/**
 * Escapes SQL LIKE/ILIKE wildcard characters (\\, _, %) matching Spatie FiltersPartial::escapeLike.
 */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (match) => `\\${match}`);
}

export class AllowedFilter<T extends ObjectLiteral = any> {
  private _hasDefault = false;
  private _defaultValue: any = undefined;
  private _ignoredValues: Set<any> = new Set();
  private _nullable = false;
  private _arrayValueDelimiter?: string | null = undefined;
  private _groupConjunction?: 'and' | 'or';
  private _groupMembers?: AllowedFilter<T>[];
  private _jsonPathSegments?: string[];
  private _jsonCast?: JsonbCastType;

  private constructor(
    /** Name used in the query string: ?filter[name]=... */
    public readonly name: string,
    /** Actual database column/internal property name (can be 'column' or 'relation.column') */
    public readonly column: string,
    /** Filter operator type */
    public readonly operator: FilterOperator,
    /** Custom scope function (for CUSTOM / SCOPE) */
    public readonly scopeFn?: FilterApplyFn<T>,
    /** Comparison operator for OPERATOR type (e.g. '>=', 'dynamic') */
    public readonly comparisonOp?: ComparisonOperator,
    /** Callback closure (for CALLBACK matching Spatie Laravel QueryBuilder) */
    public readonly callbackFn?: FilterCallbackFn<T>,
  ) {}

  /**
   * Create an exact match filter (WHERE col = value).
   * Automatically handles arrays as IN queries.
   *
   * @param name - Filter name in query string
   * @param column - Database column name (defaults to name)
   *
   * @example
   * AllowedFilter.exact('status')             // ?filter[status]=active
   * AllowedFilter.exact('role', 'roleId')     // ?filter[role]=1 → WHERE roleId = 1
   * AllowedFilter.exact('roleName', 'role.name') // ?filter[roleName]=admin → WHERE role.name = 'admin'
   */
  static exact<T extends ObjectLiteral = any>(
    name: string,
    column?: string,
  ): AllowedFilter<T> {
    return new AllowedFilter(name, column ?? name, FilterOperator.EXACT);
  }

  /**
   * Create a partial match filter (WHERE col ILIKE %value%).
   * This is the default when passing a plain string to allowedFilters().
   *
   * @param name - Filter name in query string
   * @param column - Database column name (defaults to name)
   *
   * @example
   * AllowedFilter.partial('name')             // ?filter[name]=john → ILIKE '%john%'
   * AllowedFilter.partial('search', 'title')  // ?filter[search]=hello → title ILIKE '%hello%'
   */
  static partial<T extends ObjectLiteral = any>(
    name: string,
    column?: string,
  ): AllowedFilter<T> {
    return new AllowedFilter(name, column ?? name, FilterOperator.PARTIAL);
  }

  /**
   * Create a prefix match filter (WHERE col ILIKE value%).
   *
   * @param name - Filter name in query string
   * @param column - Database column name (defaults to name)
   *
   * @example
   * AllowedFilter.startsWith('code')          // ?filter[code]=INV → ILIKE 'INV%'
   */
  static startsWith<T extends ObjectLiteral = any>(
    name: string,
    column?: string,
  ): AllowedFilter<T> {
    return new AllowedFilter(name, column ?? name, FilterOperator.STARTS_WITH);
  }

  /**
   * Create a suffix match filter (WHERE col ILIKE %value).
   *
   * @param name - Filter name in query string
   * @param column - Database column name (defaults to name)
   *
   * @example
   * AllowedFilter.endsWith('domain')          // ?filter[domain]=.com → ILIKE '%.com'
   */
  static endsWith<T extends ObjectLiteral = any>(
    name: string,
    column?: string,
  ): AllowedFilter<T> {
    return new AllowedFilter(name, column ?? name, FilterOperator.ENDS_WITH);
  }

  /**
   * Create a comparison operator filter (WHERE col > value, etc.).
   *
   * @param name - Filter name in query string
   * @param op - Comparison operator ('=', '!=', '<>', '>', '>=', '<', '<=')
   * @param column - Database column name (defaults to name)
   *
   * @example
   * AllowedFilter.operator('minAge', '>=', 'age') // ?filter[minAge]=18 → age >= 18
   * AllowedFilter.operator('maxPrice', '<=', 'price')
   */
  static operator<T extends ObjectLiteral = any>(
    name: string,
    op: ComparisonOperator,
    column?: string,
  ): AllowedFilter<T> {
    return new AllowedFilter(
      name,
      column ?? name,
      FilterOperator.OPERATOR,
      undefined,
      op,
    );
  }

  /**
   * Create an inline callback filter matching Spatie Laravel QueryBuilder's `AllowedFilter::callback()`.
   * Supports fluent `.default()`, `.ignore()`, and `.nullable()` modifiers.
   *
   * @param name - Filter name in query string (`?filter[name]=value`)
   * @param callback - Closure invoked as `(qb, value, property, alias)`
   * @param internalName - Optional internal column/property name passed as `property` (defaults to `name`)
   * @param arrayValueDelimiter - Optional delimiter to split string values into arrays (e.g. `,`)
   *
   * @example
   * AllowedFilter.callback('search', (qb, value) => {
   *   qb.andWhere('(user.name ILIKE :q OR user.email ILIKE :q)', { q: `%${value}%` });
   * })
   *
   * AllowedFilter.callback('status', (qb, value, property, alias) => {
   *   qb.andWhere(`${alias}.${property} = :status`, { status: value });
   * }, 'accountStatus').default('active').ignore('all', null, '')
   */
  static callback<T extends ObjectLiteral = any>(
    name: string,
    callback: FilterCallbackFn<T>,
    internalName?: string,
    arrayValueDelimiter?: string,
  ): AllowedFilter<T> {
    const filter = new AllowedFilter<T>(
      name,
      internalName ?? name,
      FilterOperator.CALLBACK,
      undefined,
      undefined,
      callback,
    );
    if (arrayValueDelimiter !== undefined) {
      filter._arrayValueDelimiter = arrayValueDelimiter;
    }
    return filter;
  }

  /**
   * Create a custom filter using a callback function or a class implementing FilterInterface.
   * Matches Spatie's `AllowedFilter::custom(...)`.
   *
   * @param name - Filter name in query string
   * @param filterClassOrFn - Function callback or FilterInterface instance
   * @param column - Optional database column/property name (defaults to name)
   *
   * @example
   * // Function callback:
   * AllowedFilter.custom('search', (qb, value, alias) => {
   *   qb.andWhere(`(${alias}.name ILIKE :s OR ${alias}.email ILIKE :s)`, { s: `%${value}%` });
   * })
   *
   * // Class-based (Spatie style):
   * class FullNameFilter implements FilterInterface {
   *   apply(qb, value, alias) {
   *     qb.andWhere(`CONCAT(${alias}.firstName, ' ', ${alias}.lastName) ILIKE :val`, { val: `%${value}%` });
   *   }
   * }
   * AllowedFilter.custom('name', new FullNameFilter())
   */
  static custom<T extends ObjectLiteral = any>(
    name: string,
    filterClassOrFn: FilterApplyFn<T> | FilterInterface<T>,
    column?: string,
  ): AllowedFilter<T> {
    const fn: FilterApplyFn<T> =
      typeof filterClassOrFn === 'function'
        ? (filterClassOrFn as FilterApplyFn<T>)
        : (qb, val, alias) =>
            filterClassOrFn.apply(qb, val, alias, column ?? name);

    return new AllowedFilter(name, column ?? name, FilterOperator.CUSTOM, fn);
  }

  /**
   * Create a custom scope filter with full control over the query.
   * Alias for custom() matching named scope semantics.
   *
   * @param name - Filter name in query string
   * @param fn - Custom filter function
   */
  static scope<T extends ObjectLiteral = any>(
    name: string,
    fn: FilterApplyFn<T>,
  ): AllowedFilter<T> {
    return AllowedFilter.custom(name, fn);
  }

  /**
   * Filter soft-deleted entities.
   * - ?filter[trashed]=with     -> includes deleted records (withDeleted())
   * - ?filter[trashed]=only     -> only deleted records (withDeleted() AND deletedAt IS NOT NULL)
   * - ?filter[trashed]=without  -> normal records (default TypeORM behavior)
   *
   * @param name - Filter name in query string (defaults to 'trashed')
   * @param column - Column name for deleted timestamp (defaults to 'deletedAt')
   *
   * @example
   * AllowedFilter.trashed()                   // ?filter[trashed]=only
   */
  static trashed<T extends ObjectLiteral = any>(
    name = 'trashed',
    column = 'deletedAt',
  ): AllowedFilter<T> {
    return new AllowedFilter(name, column, FilterOperator.TRASHED);
  }

  /**
   * Create a PostgreSQL JSONB filter using JS dot-notation or path array.
   * Supports exact (default), partial, starts_with, ends_with, and comparison/dynamic operators,
   * with optional PostgreSQL type casting (`'text' | 'numeric' | 'boolean' | 'timestamptz'`).
   *
   * @param name - Filter name in query string (`?filter[emailNotify]=true`)
   * @param column - Entity JSONB column property name (e.g. `'notifications'` or `'profile.meta'`)
   * @param path - Dot-notation path or string array (e.g. `'author.name'` or `['author', 'name']`)
   * @param options - Optional operator and PostgreSQL type cast
   *
   * @example
   * AllowedFilter.json('emailNotify', 'notifications', 'email')
   * AllowedFilter.json('authorName', 'meta', 'author.name', { operator: 'partial' })
   * AllowedFilter.json('minScore', 'meta', 'stats.score', { operator: '>=', cast: 'numeric' })
   */
  static json<T extends ObjectLiteral = any>(
    name: string,
    column: string,
    path: string | string[],
    options?: JsonFilterOptions,
  ): AllowedFilter<T> {
    const segments = normalizeJsonbPath(path);
    const opOpt = options?.operator ?? 'exact';

    let filterOp: FilterOperator;
    let comparisonOp: ComparisonOperator | undefined;

    if (opOpt === 'exact') {
      filterOp = FilterOperator.EXACT;
    } else if (opOpt === 'partial') {
      filterOp = FilterOperator.PARTIAL;
    } else if (opOpt === 'starts_with') {
      filterOp = FilterOperator.STARTS_WITH;
    } else if (opOpt === 'ends_with') {
      filterOp = FilterOperator.ENDS_WITH;
    } else {
      filterOp = FilterOperator.OPERATOR;
      comparisonOp = opOpt;
    }

    const filter = new AllowedFilter<T>(
      name,
      column,
      filterOp,
      undefined,
      comparisonOp,
    );
    filter._jsonPathSegments = segments;
    filter._jsonCast = options?.cast;
    return filter;
  }

  /**
   * Group multiple filters under a single URL parameter joined with OR.
   * Matches Spatie v7 `AllowedFilter::groupOr()`.
   *
   * @example
   * AllowedFilter.groupOr('q', [
   *   AllowedFilter.partial('name'),
   *   AllowedFilter.partial('email'),
   * ])
   */
  static groupOr<T extends ObjectLiteral = any>(
    name: string,
    members: AllowedFilter<T>[],
  ): AllowedFilter<T> {
    return AllowedFilter.createGroup(name, 'or', members);
  }

  /**
   * Group multiple filters under a single URL parameter joined with AND.
   * Matches Spatie v7 `AllowedFilter::groupAnd()`.
   */
  static groupAnd<T extends ObjectLiteral = any>(
    name: string,
    members: AllowedFilter<T>[],
  ): AllowedFilter<T> {
    return AllowedFilter.createGroup(name, 'and', members);
  }

  private static createGroup<T extends ObjectLiteral = any>(
    name: string,
    conjunction: 'and' | 'or',
    members: AllowedFilter<T>[],
  ): AllowedFilter<T> {
    if (!Array.isArray(members) || members.length === 0) {
      throw new Error('FiltersGroup requires at least one member.');
    }
    for (const member of members) {
      if (!(member instanceof AllowedFilter)) {
        throw new Error(
          'FiltersGroup members must be AllowedFilter instances.',
        );
      }
    }
    const filter = new AllowedFilter<T>(name, name, FilterOperator.GROUP);
    filter._groupConjunction = conjunction;
    filter._groupMembers = members;
    return filter;
  }

  // ─── FLUENT MODIFIERS (Spatie Laravel QueryBuilder parity) ──────────

  /**
   * Specify a fallback value applied when the filter is absent from the request URL.
   * Matches Spatie's `->default($value)`.
   */
  default(value: any): this {
    this._hasDefault = true;
    this._defaultValue = value;
    if (value === null) {
      this.nullable(true);
    }
    return this;
  }

  /**
   * Specify one or more values (or arrays of values) that should be ignored
   * so the filter is skipped when the incoming value matches.
   * Matches Spatie's `->ignore(...$values)`.
   */
  ignore(...values: any[]): this {
    for (const val of values) {
      if (Array.isArray(val)) {
        for (const nested of val) {
          this._ignoredValues.add(nested);
        }
      } else {
        this._ignoredValues.add(val);
      }
    }
    return this;
  }

  /**
   * Set custom delimiter for splitting comma-separated filter values into arrays (e.g. `,`).
   * Matches Spatie's delimiter support. Pass `null` or `''` to disable delimiter splitting.
   */
  delimiter(delimiter: string | null): this {
    this._arrayValueDelimiter = delimiter;
    return this;
  }

  /**
   * Resolve the effective array delimiter for this filter, falling back to global config.
   * Matches Spatie's `AllowedFilter::getDelimiter()` & `filterValueSplittingDisabled()`.
   */
  getDelimiter(): string | null {
    if (this._arrayValueDelimiter !== undefined) {
      return this._arrayValueDelimiter || null;
    }

    const config = getGlobalConfig();
    if (!config.filterValueSplittingEnabled) {
      return null;
    }

    return config.arrayDelimiter || null;
  }

  /**
   * Allow `null` (or empty string / `"null"` marker) to pass through or match `IS NULL`.
   * Matches Spatie's `->nullable()`.
   */
  nullable(isNullable = true): this {
    this._nullable = isNullable;
    return this;
  }

  /** @internal */
  hasDefault(): boolean {
    return this._hasDefault;
  }

  /** @internal */
  getDefault(): any {
    return this._defaultValue;
  }

  private isIgnoredScalar(val: any): boolean {
    if (typeof val === 'boolean') {
      return (
        this._ignoredValues.has(val) ||
        this._ignoredValues.has(val ? 'true' : 'false')
      );
    }
    if (this._ignoredValues.has(val)) return true;
    if (val === 'null' && this._ignoredValues.has(null)) return true;
    return false;
  }

  private splitFilterValue(rawValue: any, delimiter: string | null): any {
    if (!delimiter) return rawValue;

    if (Array.isArray(rawValue)) {
      return rawValue.flatMap((v) =>
        typeof v === 'string' && v.includes(delimiter)
          ? v
              .split(delimiter)
              .map((s) => s.trim())
              .filter((s) => s !== '')
          : [v],
      );
    }

    if (typeof rawValue === 'string' && rawValue.includes(delimiter)) {
      return rawValue
        .split(delimiter)
        .map((s) => s.trim())
        .filter((s) => s !== '');
    }

    return rawValue;
  }

  private castBooleanScalar(val: any): any {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  }

  private parseDynamicOperator(raw: any): {
    op: Exclude<ComparisonOperator, 'dynamic'>;
    val: any;
  } {
    if (typeof raw === 'string') {
      for (const candidate of DYNAMIC_OPERATORS) {
        if (raw.startsWith(candidate)) {
          const stripped = raw.slice(candidate.length).trim();
          return { op: candidate, val: stripped === '' ? null : stripped };
        }
      }
    }
    return { op: '=', val: raw };
  }

  /**
   * Apply this filter to the query builder.
   * @internal Called by QueryBuilder — not intended for direct use.
   */
  apply(
    qb: SelectQueryBuilder<T>,
    alias: string,
    rawValue: any,
    paramIndex: number | string,
  ): void {
    // Delegate GROUP filters directly so each member handles its own delimiter/ignore/nullable rules
    if (this.operator === FilterOperator.GROUP) {
      if (
        rawValue === undefined ||
        rawValue === null ||
        rawValue === '' ||
        !this._groupMembers?.length
      ) {
        return;
      }

      const members = this._groupMembers;
      const conjunction = this._groupConjunction ?? 'or';

      const recordedMembers: Array<
        Array<{ method: 'where' | 'andWhere' | 'orWhere'; args: any[] }>
      > = [];

      members.forEach((member, idx) => {
        const calls: Array<{
          method: 'where' | 'andWhere' | 'orWhere';
          args: any[];
        }> = [];
        const recorder: any = {
          alias,
          expressionMap: (qb as any).expressionMap,
          where: (...args: any[]) => {
            calls.push({ method: 'where', args });
            return recorder;
          },
          andWhere: (...args: any[]) => {
            calls.push({ method: 'andWhere', args });
            return recorder;
          },
          orWhere: (...args: any[]) => {
            calls.push({ method: 'orWhere', args });
            return recorder;
          },
          withDeleted: () => {
            if (typeof (qb as any).withDeleted === 'function') {
              qb.withDeleted();
            }
            return recorder;
          },
        };

        member.apply(recorder, alias, rawValue, `${paramIndex}_g${idx}`);
        if (calls.length > 0) {
          recordedMembers.push(calls);
        }
      });

      if (recordedMembers.length === 0) {
        return;
      }

      qb.andWhere(
        new Brackets((subQb) => {
          recordedMembers.forEach((calls, idx) => {
            const inner = new Brackets((innerQb) => {
              for (const call of calls) {
                (innerQb as any)[call.method](...call.args);
              }
            });
            if (conjunction === 'or' && idx > 0) {
              subQb.orWhere(inner);
            } else {
              subQb.andWhere(inner);
            }
          });
        }),
      );
      return;
    }

    // Delimiter splitting for multi-select comma-separated values (e.g. "a,b" -> ["a", "b"])
    const delimiter = this.getDelimiter();
    let value = this.splitFilterValue(rawValue, delimiter);

    // Apply Spatie ignore(...) filtering before executing
    if (this._ignoredValues.size > 0) {
      if (Array.isArray(value)) {
        value = value.filter((item) => !this.isIgnoredScalar(item));
        if (value.length === 0) return;
      } else if (this.isIgnoredScalar(value)) {
        return;
      }
    }

    const isNullishOrEmpty =
      value === undefined ||
      value === null ||
      value === '' ||
      (this._nullable && value === 'null');

    if (isNullishOrEmpty && !this._nullable) {
      return;
    }

    if (value === undefined) {
      return;
    }

    const normalizedNull =
      this._nullable && (value === null || value === '' || value === 'null');

    // Sanitize non-custom operators: drop nested objects/arrays and empty arrays to prevent SQL 500 crashes (IN ())
    const isBuiltInOperator =
      this.operator !== FilterOperator.CALLBACK &&
      this.operator !== FilterOperator.CUSTOM &&
      this.operator !== FilterOperator.SCOPE;

    if (isBuiltInOperator && !normalizedNull) {
      if (Array.isArray(value)) {
        value = value.filter((item) => isScalar(item) && item !== '');
        if (value.length === 0) {
          return;
        }
      } else if (!isScalar(value)) {
        return;
      }
    }

    const target = this._jsonPathSegments
      ? buildJsonbExpression(
          alias,
          this.column,
          this._jsonPathSegments,
          this._jsonCast,
        )
      : this.column.includes('.')
        ? this.column
        : `${alias}.${this.column}`;

    const paramName = `qb_f_${this.column.replace(/\W/g, '_')}_${paramIndex}`;

    // PostgreSQL `->>` returns text; only cast 'true'/'false' to boolean when not comparing against uncasted JSONB text
    const isJsonbText =
      Boolean(this._jsonPathSegments) &&
      (!this._jsonCast || this._jsonCast === 'text');
    const normalizeExactScalar = (v: any) =>
      isJsonbText ? String(v) : this.castBooleanScalar(v);

    switch (this.operator) {
      case FilterOperator.EXACT: {
        if (normalizedNull) {
          qb.andWhere(`${target} IS NULL`);
        } else if (Array.isArray(value)) {
          qb.andWhere(`${target} IN (:...${paramName})`, {
            [paramName]: value.map(normalizeExactScalar),
          });
        } else {
          qb.andWhere(`${target} = :${paramName}`, {
            [paramName]: normalizeExactScalar(value),
          });
        }
        break;
      }

      case FilterOperator.PARTIAL: {
        if (normalizedNull) {
          qb.andWhere(`${target} IS NULL`);
        } else if (Array.isArray(value)) {
          const conditions = value.map(
            (_: any, i: number) => `${target} ILIKE :${paramName}_${i}`,
          );
          const params: Record<string, string> = {};
          value.forEach((v: string | number | boolean, i: number) => {
            params[`${paramName}_${i}`] = `%${escapeLike(String(v))}%`;
          });
          qb.andWhere(`(${conditions.join(' OR ')})`, params);
        } else {
          qb.andWhere(`${target} ILIKE :${paramName}`, {
            [paramName]: `%${escapeLike(String(value))}%`,
          });
        }
        break;
      }

      case FilterOperator.STARTS_WITH: {
        if (normalizedNull) {
          qb.andWhere(`${target} IS NULL`);
        } else if (Array.isArray(value)) {
          const conditions = value.map(
            (_: any, i: number) => `${target} ILIKE :${paramName}_${i}`,
          );
          const params: Record<string, string> = {};
          value.forEach((v: string | number | boolean, i: number) => {
            params[`${paramName}_${i}`] = `${escapeLike(String(v))}%`;
          });
          qb.andWhere(`(${conditions.join(' OR ')})`, params);
        } else {
          qb.andWhere(`${target} ILIKE :${paramName}`, {
            [paramName]: `${escapeLike(String(value))}%`,
          });
        }
        break;
      }

      case FilterOperator.ENDS_WITH: {
        if (normalizedNull) {
          qb.andWhere(`${target} IS NULL`);
        } else if (Array.isArray(value)) {
          const conditions = value.map(
            (_: any, i: number) => `${target} ILIKE :${paramName}_${i}`,
          );
          const params: Record<string, string> = {};
          value.forEach((v: string | number | boolean, i: number) => {
            params[`${paramName}_${i}`] = `%${escapeLike(String(v))}`;
          });
          qb.andWhere(`(${conditions.join(' OR ')})`, params);
        } else {
          qb.andWhere(`${target} ILIKE :${paramName}`, {
            [paramName]: `%${escapeLike(String(value))}`,
          });
        }
        break;
      }

      case FilterOperator.OPERATOR: {
        const op = this.comparisonOp ?? '=';
        if (op === 'dynamic') {
          if (normalizedNull) {
            qb.andWhere(`${target} IS NULL`);
          } else if (Array.isArray(value)) {
            value.forEach((item: any, i: number) => {
              const parsed = this.parseDynamicOperator(item);
              if (parsed.val === null) {
                qb.andWhere(
                  parsed.op === '!=' || parsed.op === '<>'
                    ? `${target} IS NOT NULL`
                    : `${target} IS NULL`,
                );
              } else {
                qb.andWhere(`${target} ${parsed.op} :${paramName}_${i}`, {
                  [`${paramName}_${i}`]: parsed.val,
                });
              }
            });
          } else {
            const parsed = this.parseDynamicOperator(value);
            if (parsed.val === null) {
              qb.andWhere(
                parsed.op === '!=' || parsed.op === '<>'
                  ? `${target} IS NOT NULL`
                  : `${target} IS NULL`,
              );
            } else {
              qb.andWhere(`${target} ${parsed.op} :${paramName}`, {
                [paramName]: parsed.val,
              });
            }
          }
          break;
        }

        if (normalizedNull) {
          qb.andWhere(
            op === '!=' || op === '<>'
              ? `${target} IS NOT NULL`
              : `${target} IS NULL`,
          );
        } else if (Array.isArray(value)) {
          if (op === '!=' || op === '<>') {
            qb.andWhere(`${target} NOT IN (:...${paramName})`, {
              [paramName]: value,
            });
          } else if (op === '=') {
            qb.andWhere(`${target} IN (:...${paramName})`, {
              [paramName]: value,
            });
          } else {
            const conditions = value.map(
              (_: any, i: number) => `${target} ${op} :${paramName}_${i}`,
            );
            const params: Record<string, any> = {};
            value.forEach((v: any, i: number) => {
              params[`${paramName}_${i}`] = v;
            });
            qb.andWhere(`(${conditions.join(' OR ')})`, params);
          }
        } else {
          qb.andWhere(`${target} ${op} :${paramName}`, {
            [paramName]: value,
          });
        }
        break;
      }

      case FilterOperator.CALLBACK: {
        this.callbackFn?.(
          qb,
          normalizedNull ? null : value,
          this.column,
          alias,
        );
        break;
      }

      case FilterOperator.CUSTOM:
      case FilterOperator.SCOPE: {
        this.scopeFn?.(qb, normalizedNull ? null : value, alias);
        break;
      }

      case FilterOperator.TRASHED: {
        const strVal = String(value).toLowerCase();
        if (strVal === 'with') {
          if (typeof (qb as any).withDeleted === 'function') {
            qb.withDeleted();
          }
        } else if (strVal === 'only' || strVal === 'true') {
          if (typeof (qb as any).withDeleted === 'function') {
            qb.withDeleted();
          }
          qb.andWhere(`${target} IS NOT NULL`);
        } else if (
          strVal === 'without' ||
          strVal === 'none' ||
          strVal === 'false'
        ) {
          if ((qb as any).expressionMap) {
            (qb as any).expressionMap.withDeleted = false;
          }
          qb.andWhere(`${target} IS NULL`);
        }
        break;
      }
    }
  }
}
