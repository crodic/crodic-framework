import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

export class CursorPaginatedMeta {
  @ApiProperty({ example: 20, description: 'Number of items per page' })
  itemsPerPage!: number;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'eyJpZCI6IjEwMCIsIl9wb2ludHNUb05leHRJdGVtcyI6dHJ1ZX0',
    description: 'Opaque cursor for fetching the next page (null on last page)',
  })
  nextCursor!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    example: null,
    description:
      'Opaque cursor for fetching the previous page (null on first page)',
  })
  prevCursor!: string | null;

  @ApiProperty({
    example: true,
    description: 'Whether more items exist after the current page',
  })
  hasMore!: boolean;
}

export class CursorPaginatedLinks {
  @ApiPropertyOptional({
    example:
      'https://api.example.com/v1/posts?limit=20&cursor=eyJpZCI6IjEwMCIsIl9wb2ludHNUb05leHRJdGVtcyI6dHJ1ZX0',
    description: 'URL for the next page',
  })
  next?: string;

  @ApiPropertyOptional({
    example:
      'https://api.example.com/v1/posts?limit=20&cursor=eyJpZCI6IjEyMCIsIl9wb2ludHNUb05leHRJdGVtcyI6ZmFsc2V9',
    description: 'URL for the previous page',
  })
  previous?: string;
}

export class CursorPaginated<T> {
  @ApiProperty({ isArray: true })
  public readonly data: T[];

  @ApiProperty({ type: () => CursorPaginatedMeta })
  public readonly meta: CursorPaginatedMeta;

  @ApiProperty({ type: () => CursorPaginatedLinks })
  public readonly links: CursorPaginatedLinks;

  constructor(
    data: T[],
    meta: CursorPaginatedMeta,
    links: CursorPaginatedLinks,
  ) {
    this.data = data;
    this.meta = meta;
    this.links = links;
  }
}

export interface CursorPaginateOptions {
  /** Override default items per page for this query */
  defaultLimit?: number;
  /** Explicit base URL override (defaults to global `pathResolver`) */
  path?: string;
  /** Unique tie-breaker column appended automatically if missing from sort (defaults to `'id'`) */
  tieBreaker?: string;
}
