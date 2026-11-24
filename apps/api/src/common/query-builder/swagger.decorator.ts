import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiQuery,
  getSchemaPath,
} from '@nestjs/swagger';
import { OffsetPaginationDto } from '../dto/offset-pagination/offset-pagination.dto';
import {
  Paginated,
  PaginatedLinks,
  PaginatedMeta,
} from '../dto/offset-pagination/paginated.dto';
import { AllowedFilter } from './allowed-filter';
import { AllowedInclude } from './allowed-include';
import { AllowedSort } from './allowed-sort';
import { getGlobalConfig } from './config';
import {
  CursorPaginated,
  CursorPaginatedLinks,
  CursorPaginatedMeta,
} from './cursor';

export interface ApiQueryBuilderFilterConfig {
  name: string;
  type?: any;
  enum?: any[] | Record<string, any>;
  description?: string;
  example?: any;
  isArray?: boolean;
}

export interface ApiQueryBuilderDocsOptions<T extends Type<any> = any> {
  /**
   * The DTO or Entity class returned in the data array.
   */
  entity: T;

  /**
   * Pagination strategy documented in Swagger.
   * - `'offset'` (default): `Paginated<T>` response + `page` & `limit` query params
   * - `'cursor'`: `CursorPaginated<T>` response + `cursor` & `limit` query params
   */
  paginationType?: 'offset' | 'cursor';

  /**
   * Whitelisted filter definitions or filter names.
   * Can accept plain strings, AllowedFilter instances (including json, dynamic, groupOr/groupAnd, trashed),
   * or detailed config objects.
   *
   * @example
   * filters: [
   *   'name',
   *   AllowedFilter.exact('status'),
   *   AllowedFilter.json('score', 'meta', 'stats.score', { operator: 'dynamic', cast: 'numeric' }),
   *   AllowedFilter.groupOr('search', [AllowedFilter.partial('name'), AllowedFilter.partial('email')]),
   *   AllowedFilter.trashed(),
   * ]
   */
  filters?: (string | AllowedFilter<any> | ApiQueryBuilderFilterConfig)[];

  /**
   * Whitelisted sort columns or AllowedSort instances (including AllowedSort.json()).
   *
   * @example
   * sorts: ['createdAt', 'name', AllowedSort.field('role', 'roles.name'), AllowedSort.json('score', 'meta', 'stats.score', { cast: 'numeric' })]
   */
  sorts?: (string | AllowedSort<any>)[];

  /**
   * Default sort column (e.g. '-createdAt').
   */
  defaultSort?: string;

  /**
   * Whitelisted relation includes or AllowedInclude instances.
   *
   * @example
   * includes: ['roles', 'profile', AllowedInclude.count('comments')]
   */
  includes?: (string | AllowedInclude<any>)[];

  /**
   * Whitelisted fields (sparse fieldsets).
   *
   * @example
   * fields: ['id', 'name', 'email', 'roles.id', 'roles.title']
   */
  fields?: string[];

  /**
   * Default pagination limit (overrides global default).
   */
  defaultLimit?: number;

  /**
   * Maximum pagination limit (overrides global maxLimit).
   */
  maxLimit?: number;

  /**
   * Description for the 200 OK response.
   */
  description?: string;
}

/**
 * Swagger documentation decorator for Spatie-style QueryBuilder endpoints.
 * Automatically documents:
 * - 200 OK `Paginated` (offset) or `CursorPaginated` (cursor) response schema
 * - Filter query parameters (`filter[name]`, JSONB, dynamic operators, groupOr/groupAnd, trashed)
 * - Sort query parameter with allowed sort options (including JSONB sorts)
 * - Include query parameter with allowed relations
 * - Sparse fieldsets parameter (`fields`)
 * - Pagination parameters (`page` + `limit` or `cursor` + `limit`)
 */
export function ApiQueryBuilderDocs<T extends Type<any>>(
  options: ApiQueryBuilderDocsOptions<T>,
): MethodDecorator {
  const config = getGlobalConfig();
  const decorators: MethodDecorator[] = [];
  const isCursor = options.paginationType === 'cursor';

  // 1. Extra models and Paginated / CursorPaginated Response Schema
  if (isCursor) {
    decorators.push(
      ApiExtraModels(
        CursorPaginated,
        CursorPaginatedMeta,
        CursorPaginatedLinks,
        options.entity,
      ),
      ApiOkResponse({
        description: options.description ?? 'Cursor-paginated list of results',
        schema: {
          allOf: [
            { $ref: getSchemaPath(CursorPaginated) },
            {
              properties: {
                data: {
                  type: 'array',
                  items: { $ref: getSchemaPath(options.entity) },
                },
              },
            },
          ],
        },
      }),
    );
  } else {
    decorators.push(
      ApiExtraModels(
        Paginated,
        PaginatedMeta,
        PaginatedLinks,
        OffsetPaginationDto,
        options.entity,
      ),
      ApiOkResponse({
        description: options.description ?? 'Paginated list of results',
        schema: {
          allOf: [
            { $ref: getSchemaPath(Paginated) },
            {
              properties: {
                data: {
                  type: 'array',
                  items: { $ref: getSchemaPath(options.entity) },
                },
              },
            },
          ],
        },
      }),
    );
  }

  // 2. Filters
  const filterKey = config.parameters.filter;
  if (options.filters && options.filters.length > 0) {
    for (const filter of options.filters) {
      if (typeof filter === 'string') {
        decorators.push(
          ApiQuery({
            name: `${filterKey}[${filter}]`,
            required: false,
            type: String,
            description: `Filter by ${filter} (partial or exact match)`,
          }),
        );
      } else if (filter instanceof AllowedFilter) {
        const meta = filter.getSwaggerMetadata();
        decorators.push(
          ApiQuery({
            name: `${filterKey}[${filter.name}]`,
            required: false,
            enum: meta.enum,
            type: meta.enum ? undefined : String,
            description: meta.description,
            example: meta.example,
          }),
        );
      } else if (typeof filter === 'object' && 'name' in filter) {
        decorators.push(
          ApiQuery({
            name: `${filterKey}[${filter.name}]`,
            required: false,
            enum: filter.enum,
            type: filter.type ?? (filter.enum ? undefined : String),
            description: filter.description ?? `Filter by ${filter.name}`,
            example: filter.example,
            isArray: filter.isArray,
          }),
        );
      }
    }
  }

  // 3. Sorts
  const sortKey = config.parameters.sort;
  if (options.sorts && options.sorts.length > 0) {
    const sortNames = options.sorts.map((s) =>
      typeof s === 'string' ? s : s.name,
    );
    const sortLabels = options.sorts.map((s) =>
      typeof s === 'string' ? s : s.getSwaggerLabel(),
    );
    decorators.push(
      ApiQuery({
        name: sortKey,
        required: false,
        type: String,
        description: `Sort criteria (comma-separated). Prefix with '-' for descending order. Allowed: [${sortLabels.join(', ')}]`,
        example:
          options.defaultSort ??
          (sortNames.length > 0 ? `-${sortNames[0]}` : undefined),
      }),
    );
  }

  // 4. Includes
  const includeKey = config.parameters.include;
  if (options.includes && options.includes.length > 0) {
    const includeNames = options.includes.map((i) =>
      typeof i === 'string' ? i : i.name,
    );
    decorators.push(
      ApiQuery({
        name: includeKey,
        required: false,
        type: String,
        description: `Relations to include (comma-separated). Allowed: [${includeNames.join(', ')}]`,
        example:
          includeNames.length > 0
            ? includeNames.slice(0, 2).join(',')
            : undefined,
      }),
    );
  }

  // 5. Fields (Sparse Fieldsets)
  const fieldsKey = config.parameters.fields;
  if (options.fields && options.fields.length > 0) {
    decorators.push(
      ApiQuery({
        name: fieldsKey,
        required: false,
        type: String,
        description: `Sparse fieldsets: select specific columns (comma-separated or fields[entity]=col1,col2). Allowed: [${options.fields.join(', ')}]`,
        example: options.fields.slice(0, 3).join(','),
      }),
    );
  }

  // 6. Pagination (Offset: page + limit | Cursor: cursor + limit)
  const limitKey = config.parameters.limit;
  const defaultLimit = options.defaultLimit ?? config.defaultLimit;
  const maxLimit = options.maxLimit ?? config.maxLimit;

  if (isCursor) {
    decorators.push(
      ApiQuery({
        name: config.parameters.cursor,
        required: false,
        type: String,
        description:
          'Opaque base64url cursor token from meta.nextCursor or meta.prevCursor',
      }),
    );
  } else {
    decorators.push(
      ApiQuery({
        name: config.parameters.page,
        required: false,
        type: Number,
        description: 'Page number (1-based index)',
        example: 1,
        schema: {
          type: 'integer',
          minimum: 1,
          default: 1,
        },
      }),
    );
  }

  decorators.push(
    ApiQuery({
      name: limitKey,
      required: false,
      type: Number,
      description: `Number of items per page (maximum: ${maxLimit})`,
      example: defaultLimit,
      schema: {
        type: 'integer',
        minimum: 1,
        maximum: maxLimit,
        default: defaultLimit,
      },
    }),
  );

  return applyDecorators(...decorators);
}
