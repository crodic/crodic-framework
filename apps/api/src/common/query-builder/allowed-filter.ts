import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
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
}

export type ComparisonOperator = '=' | '!=' | '<>' | '>' | '>=' | '<' | '<=';

export class AllowedFilter<T extends ObjectLiteral = any> {
  private _hasDefault = false;
  private _defaultValue: any = undefined;
  private _ignoredValues: Set<any> = new Set();
  private _nullable = false;
  private _arrayValueDelimiter?: string;

  private constructor(
    /** Name used in the query string: ?filter[name]=... */
    public readonly name: string,
    /** Actual database column/internal property name (can be 'column' or 'relation.column') */
    public readonly column: string,
    /** Filter operator type */
    public readonly operator: FilterOperator,
    /** Custom scope function (for CUSTOM / SCOPE) */
    public readonly scopeFn?: FilterApplyFn<T>,
    /** Comparison operator for OPERATOR type (e.g. '>=') */
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

  // ─── FLUENT MODIFIERS (Spatie Laravel QueryBuilder parity) ──────────

  /**
   * Specify a fallback value applied when the filter is absent from the request URL.
   * Matches Spatie's `->default($value)`.
   */
  default(value: any): this {
    this._hasDefault = true;
    this._defaultValue = value;
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
    if (this._ignoredValues.has(val)) return true;
    if (val === 'null' && this._ignoredValues.has(null)) return true;
    return false;
  }

  /**
   * Apply this filter to the query builder.
   * @internal Called by QueryBuilder — not intended for direct use.
   */
  apply(
    qb: SelectQueryBuilder<T>,
    alias: string,
    rawValue: any,
    paramIndex: number,
  ): void {
    let value = rawValue;

    // Optional delimiter splitting (e.g. "a,b" -> ["a", "b"])
    if (
      this._arrayValueDelimiter &&
      typeof value === 'string' &&
      value.includes(this._arrayValueDelimiter)
    ) {
      value = value.split(this._arrayValueDelimiter);
    }

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

    const target = this.column.includes('.')
      ? this.column
      : `${alias}.${this.column}`;

    const paramName = `qb_f_${this.column.replace(/\W/g, '_')}_${paramIndex}`;

    switch (this.operator) {
      case FilterOperator.EXACT: {
        if (normalizedNull) {
          qb.andWhere(`${target} IS NULL`);
        } else if (Array.isArray(value)) {
          qb.andWhere(`${target} IN (:...${paramName})`, {
            [paramName]: value,
          });
        } else {
          qb.andWhere(`${target} = :${paramName}`, {
            [paramName]: value,
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
          value.forEach((v: string, i: number) => {
            params[`${paramName}_${i}`] = `%${v}%`;
          });
          qb.andWhere(`(${conditions.join(' OR ')})`, params);
        } else {
          qb.andWhere(`${target} ILIKE :${paramName}`, {
            [paramName]: `%${value}%`,
          });
        }
        break;
      }

      case FilterOperator.STARTS_WITH: {
        if (normalizedNull) {
          qb.andWhere(`${target} IS NULL`);
        } else {
          qb.andWhere(`${target} ILIKE :${paramName}`, {
            [paramName]: `${value}%`,
          });
        }
        break;
      }

      case FilterOperator.ENDS_WITH: {
        if (normalizedNull) {
          qb.andWhere(`${target} IS NULL`);
        } else {
          qb.andWhere(`${target} ILIKE :${paramName}`, {
            [paramName]: `%${value}`,
          });
        }
        break;
      }

      case FilterOperator.OPERATOR: {
        const op = this.comparisonOp ?? '=';
        if (normalizedNull) {
          qb.andWhere(
            op === '!=' || op === '<>'
              ? `${target} IS NOT NULL`
              : `${target} IS NULL`,
          );
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
