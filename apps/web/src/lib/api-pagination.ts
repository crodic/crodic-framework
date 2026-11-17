import { z } from 'zod'
import { apiLinksSchema, apiMetaSchema } from '@/global'
import type { RestQueryParams } from '@/lib/query-builder'

export const paginatedMetaWrapper = z.object({
  meta: apiMetaSchema.passthrough(),
  links: apiLinksSchema.optional(),
})

export interface PaginatedResult<T> {
  data: T[]
  meta?: {
    page?: number
    perPage?: number
    currentPage?: number
    itemsPerPage?: number
    totalItems?: number
    totalPages: number
    [key: string]: any
  }
  links?: any
}

export function parsePaginatedResponse<T extends z.ZodTypeAny>(
  schema: T,
  raw: any,
  params: RestQueryParams = {}
): PaginatedResult<z.infer<T>> {
  if (Array.isArray(raw)) {
    const data = z.array(schema).parse(raw)
    return {
      data,
      meta: {
        page: Number(params.page ?? 1),
        perPage: Number(params.limit ?? data.length),
        totalItems: data.length,
        totalPages: 1,
      },
    }
  }

  return paginatedMetaWrapper
    .extend({
      data: z.array(schema),
    })
    .parse(raw) as unknown as PaginatedResult<z.infer<T>>
}
