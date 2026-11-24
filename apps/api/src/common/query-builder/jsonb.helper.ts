export type JsonbCastType = 'text' | 'numeric' | 'boolean' | 'timestamptz';

const VALID_JSON_KEY_REGEX = /^[a-zA-Z0-9_-]+$/;
const VALID_CASTS: ReadonlySet<JsonbCastType> = new Set([
  'text',
  'numeric',
  'boolean',
  'timestamptz',
]);

/**
 * Parse and validate a JS dot-notation path or string array for PostgreSQL JSONB access.
 * Rejects empty paths or unsafe characters at registration time to prevent SQL injection.
 */
export function normalizeJsonbPath(path: string | string[]): string[] {
  const segments = Array.isArray(path) ? path : path.split('.');
  const cleaned = segments.map((s) => String(s).trim());

  if (cleaned.length === 0 || cleaned.some((s) => s === '')) {
    throw new Error(
      `Invalid JSONB path "${Array.isArray(path) ? path.join('.') : path}": path must be non-empty.`,
    );
  }

  for (const segment of cleaned) {
    if (!VALID_JSON_KEY_REGEX.test(segment)) {
      throw new Error(
        `Invalid JSONB key segment "${segment}": only alphanumeric characters, underscores, and hyphens are allowed.`,
      );
    }
  }

  return cleaned;
}

/**
 * Build a TypeORM-compatible PostgreSQL JSONB expression with spaced operators
 * (`alias.column -> 'a' ->> 'b'`) so TypeORM translates entity property names
 * (e.g. `user.userMeta`) into their actual quoted database column names (`"user"."user_meta"`).
 */
export function buildJsonbExpression(
  alias: string,
  column: string,
  pathSegments: string[],
  cast?: JsonbCastType,
): string {
  if (cast && !VALID_CASTS.has(cast)) {
    throw new Error(`Unsupported JSONB cast type "${cast}".`);
  }

  const baseCol = column.includes('.') ? column : `${alias}.${column}`;
  const chain = pathSegments
    .map((segment, idx) =>
      idx === pathSegments.length - 1 ? `->> '${segment}'` : `-> '${segment}'`,
    )
    .join(' ');

  const expr = `${baseCol} ${chain}`;

  if (cast && cast !== 'text') {
    return `(${expr})::${cast}`;
  }

  return expr;
}
