/**
 * Encodes and decodes opaque, URL-safe keyset pagination cursors.
 * Mirrors Laravel's `Illuminate\Pagination\Cursor`.
 */
export class Cursor {
  constructor(
    public readonly parameters: Record<string, any>,
    public readonly pointsToNextItems = true,
  ) {}

  /**
   * Encode cursor parameters and direction into a URL-safe base64 string.
   */
  encode(): string {
    const payload = {
      ...this.parameters,
      _pointsToNextItems: this.pointsToNextItems,
    };
    return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  }

  /**
   * Safely decode an encoded cursor string.
   * Returns `null` if the string is missing, malformed, or not a valid JSON object.
   */
  static fromEncoded(encoded?: string | null): Cursor | null {
    if (!encoded || typeof encoded !== 'string') {
      return null;
    }

    try {
      const json = Buffer.from(encoded, 'base64url').toString('utf8');
      const parsed = JSON.parse(json);

      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return null;
      }

      const { _pointsToNextItems, ...rest } = parsed;
      const parameters: Record<string, any> = {};
      const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

      for (const [key, val] of Object.entries(rest)) {
        if (!FORBIDDEN_KEYS.has(key)) {
          parameters[key] = val;
        }
      }

      if (Object.keys(parameters).length === 0) {
        return null;
      }

      return new Cursor(parameters, _pointsToNextItems !== false);
    } catch {
      return null;
    }
  }
}

export interface CursorPaginatedMeta {
  itemsPerPage: number;
  nextCursor: string | null;
  prevCursor: string | null;
  hasMore: boolean;
}

export interface CursorPaginatedLinks {
  next?: string;
  previous?: string;
}

export class CursorPaginated<T> {
  constructor(
    public readonly data: T[],
    public readonly meta: CursorPaginatedMeta,
    public readonly links: CursorPaginatedLinks,
  ) {}
}

export interface CursorPaginateOptions {
  /** Override default items per page for this query */
  defaultLimit?: number;
  /** Explicit base URL override (defaults to global `pathResolver`) */
  path?: string;
  /** Unique tie-breaker column appended automatically if missing from sort (defaults to `'id'`) */
  tieBreaker?: string;
}
