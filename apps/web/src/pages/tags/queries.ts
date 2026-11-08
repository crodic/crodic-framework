import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { apiLinksSchema, apiMetaSchema } from '@/global'
import http from '@/lib/http'
import type { RestQueryParams } from '@/lib/query-builder'
import {
  entityTagListSchema,
  entityTagLogSchema,
  mergeTagPreviewSchema,
  tagAutocompleteItemSchema,
  tagDetailSchema,
  tagEncyclopediaSchema,
  tagSummarySchema,
  type EntityTagList,
  type EntityTagLog,
  type MergeTagPreview,
  type TagAutocompleteItem,
  type TagDetail,
  type TagEncyclopedia,
  type TagEncyclopediaFormValues,
  type TagFormValues,
  type TaggableEntityType,
  type TagRelationType,
  type TagSummary,
} from './schema'

const paginatedMetaWrapper = z.object({
  meta: apiMetaSchema.passthrough(),
  links: apiLinksSchema.optional(),
})

export async function apiGetTagsListing(params: RestQueryParams) {
  const response = await http.get('/tags', { params })
  if (Array.isArray(response.data)) {
    const data = z.array(tagSummarySchema).parse(response.data)
    return {
      data,
      meta: {
        page: params.page ?? 1,
        perPage: params.limit ?? data.length,
        totalItems: data.length,
        totalPages: 1,
      },
    }
  }
  return paginatedMetaWrapper
    .extend({
      data: z.array(tagSummarySchema),
    })
    .parse(response.data)
}

export async function apiGetTagById(
  id: string,
  locale = 'en'
): Promise<TagDetail> {
  const response = await http.get(`/tags/${id}`, { params: { locale } })
  return tagDetailSchema.parse(response.data)
}

export async function apiCreateTag(payload: TagFormValues): Promise<TagDetail> {
  const cleanedPayload = {
    ...payload,
    slug: payload.slug?.trim() || undefined,
    translations: payload.translations
      .filter((tr) => tr.translatedName.trim().length > 0)
      .map((tr) => ({
        locale: tr.locale,
        translatedName: tr.translatedName.trim(),
        shortSummary: tr.shortSummary?.trim() || undefined,
      })),
    aliases: payload.aliases
      .filter((al) => al.aliasName.trim().length > 0)
      .map((al) => ({
        aliasName: al.aliasName.trim(),
        aliasType: al.aliasType,
        locale: al.locale?.trim() || undefined,
      })),
  }
  const response = await http.post('/tags', cleanedPayload)
  return tagDetailSchema.parse(response.data)
}

export async function apiUpdateTag({
  id,
  data,
}: {
  id: string
  data: TagFormValues
}): Promise<TagDetail> {
  const cleanedPayload = {
    ...data,
    slug: data.slug?.trim() || undefined,
    translations: data.translations
      .filter((tr) => tr.translatedName.trim().length > 0)
      .map((tr) => ({
        locale: tr.locale,
        translatedName: tr.translatedName.trim(),
        shortSummary: tr.shortSummary?.trim() || undefined,
      })),
    aliases: data.aliases
      .filter((al) => al.aliasName.trim().length > 0)
      .map((al) => ({
        aliasName: al.aliasName.trim(),
        aliasType: al.aliasType,
        locale: al.locale?.trim() || undefined,
      })),
  }
  const response = await http.put(`/tags/${id}`, cleanedPayload)
  return tagDetailSchema.parse(response.data)
}

export async function apiDeleteTag(id: string) {
  return http.delete(`/tags/${id}`)
}

export async function apiAddTagRelation({
  sourceTagId,
  targetTagId,
  relationType,
  sortOrder = 0,
}: {
  sourceTagId: string
  targetTagId: string
  relationType: TagRelationType
  sortOrder?: number
}): Promise<TagDetail> {
  const response = await http.post(`/tags/${sourceTagId}/relations`, {
    targetTagId,
    relationType,
    sortOrder,
  })
  return tagDetailSchema.parse(response.data)
}

export async function apiRemoveTagRelation({
  sourceTagId,
  targetTagId,
  relationType,
}: {
  sourceTagId: string
  targetTagId: string
  relationType: TagRelationType
}): Promise<TagDetail> {
  const response = await http.delete(
    `/tags/${sourceTagId}/relations/${targetTagId}`,
    {
      params: { relationType },
    }
  )
  return tagDetailSchema.parse(response.data)
}

export async function apiGetMergeTagPreview(
  sourceTagId: string,
  targetTagId: string,
  locale = 'en'
): Promise<MergeTagPreview> {
  const response = await http.get(
    `/tags/${sourceTagId}/merge-preview/${targetTagId}`,
    { params: { locale } }
  )
  return mergeTagPreviewSchema.parse(response.data)
}

export async function apiMergeTag({
  sourceTagId,
  targetTagId,
}: {
  sourceTagId: string
  targetTagId: string
}) {
  const response = await http.post(`/tags/${sourceTagId}/merge`, {
    targetTagId,
  })
  return response.data
}

export async function apiGetTagAuditLogs(params?: RestQueryParams) {
  const response = await http.get('/tags/audit-logs', { params })
  if (Array.isArray(response.data)) {
    const data = z.array(entityTagLogSchema).parse(response.data)
    return {
      data,
      meta: {
        page: params?.page ?? 1,
        perPage: params?.limit ?? data.length,
        totalItems: data.length,
        totalPages: 1,
      },
    }
  }
  return paginatedMetaWrapper
    .extend({
      data: z.array(entityTagLogSchema),
    })
    .parse(response.data)
}

export async function apiSearchTagsAutocomplete(
  q: string,
  locale = 'en',
  limit = 12
): Promise<TagAutocompleteItem[]> {
  const response = await http.get('/public/tags/autocomplete', {
    params: { q, locale, limit },
  })
  return z.array(tagAutocompleteItemSchema).parse(response.data)
}

export async function apiGetTagEncyclopediaListing(params: RestQueryParams) {
  const response = await http.get('/tag-encyclopedias', { params })
  return paginatedMetaWrapper
    .extend({
      data: z.array(tagEncyclopediaSchema),
    })
    .parse(response.data)
}

export async function apiGetTagEncyclopediaByTag(
  tagId: string,
  locale = 'en'
): Promise<TagEncyclopedia | null> {
  const response = await http.get(`/tag-encyclopedias/by-tag/${tagId}`, {
    params: { locale },
  })
  if (!response.data) return null
  return tagEncyclopediaSchema.parse(response.data)
}

export async function apiUpsertTagEncyclopedia({
  tagId,
  data,
}: {
  tagId: string
  data: TagEncyclopediaFormValues
}): Promise<TagEncyclopedia> {
  const response = await http.put(`/tag-encyclopedias/by-tag/${tagId}`, {
    locale: data.locale,
    summary: data.summary.trim(),
    body: data.body,
    featuredImageUrl: data.featuredImageUrl?.trim() || null,
    featuredFileId: data.featuredFileId ?? null,
    changeNote: data.changeNote?.trim() || undefined,
    isEditLocked: data.isEditLocked,
  })
  return tagEncyclopediaSchema.parse(response.data)
}

export async function apiRollbackEncyclopediaRevision({
  encyclopediaId,
  revisionNumber,
}: {
  encyclopediaId: string
  revisionNumber: number
}): Promise<TagEncyclopedia> {
  const response = await http.post(
    `/tag-encyclopedias/${encyclopediaId}/revisions/${revisionNumber}/rollback`
  )
  return tagEncyclopediaSchema.parse(response.data)
}

export async function apiGetEntityTags(
  entityType: TaggableEntityType,
  entityId: string,
  locale = 'en'
): Promise<EntityTagList> {
  const response = await http.get(`/entity-tags/${entityType}/${entityId}`, {
    params: { locale },
  })
  return entityTagListSchema.parse(response.data)
}

export async function apiSyncEntityTagsAdmin({
  entityType,
  entityId,
  tags,
  tagEditLocked,
}: {
  entityType: TaggableEntityType
  entityId: string
  tags: string[]
  tagEditLocked?: boolean
}): Promise<EntityTagList> {
  const response = await http.put(
    `/tags/entity-sync/${entityType}/${entityId}`,
    {
      tagNames: tags,
      tagEditLocked,
    }
  )
  return entityTagListSchema.parse(response.data)
}

export const useDataTagsOverview = (params: RestQueryParams) =>
  useQuery({
    queryKey: ['tags', params],
    queryFn: () => apiGetTagsListing(params),
  })

export const useDataTagById = (id: string, locale = 'en') =>
  useQuery({
    queryKey: ['tag', id, locale],
    queryFn: () => apiGetTagById(id, locale),
    enabled: Boolean(id),
  })

export const useDataSearchTagsPaginated = ({
  search,
  page = 1,
  limit = 8,
  locale = 'en',
  enabled = true,
}: {
  search: string
  page: number
  limit?: number
  locale?: string
  enabled?: boolean
}) =>
  useQuery({
    queryKey: ['tags-paginated-search', search, page, limit, locale],
    queryFn: async () => {
      const trimmed = search?.trim()
      const params: Record<string, any> = {
        page,
        limit,
        sort: '-usageCount',
        locale,
      }
      if (trimmed) {
        params['filter[search]'] = trimmed
      }
      return apiGetTagsListing(params as RestQueryParams)
    },
    enabled,
    placeholderData: (previousData) => previousData,
  })

export const useDataTagAuditLogs = (params: RestQueryParams) =>
  useQuery({
    queryKey: ['tag-audit-logs', params],
    queryFn: () => apiGetTagAuditLogs(params),
  })

export const useDataMergeTagPreview = (
  sourceTagId: string,
  targetTagId: string
) =>
  useQuery({
    queryKey: ['tag-merge-preview', sourceTagId, targetTagId],
    queryFn: () => apiGetMergeTagPreview(sourceTagId, targetTagId),
    enabled:
      Boolean(sourceTagId) &&
      Boolean(targetTagId) &&
      sourceTagId !== targetTagId,
  })

export const useDataTagAutocomplete = (q: string, locale = 'en') =>
  useQuery({
    queryKey: ['tag-autocomplete', q, locale],
    queryFn: () => apiSearchTagsAutocomplete(q, locale),
  })

export const useDataTagEncyclopediaOverview = (params: RestQueryParams) =>
  useQuery({
    queryKey: ['tag-encyclopedias', params],
    queryFn: () => apiGetTagEncyclopediaListing(params),
  })

export const useDataTagEncyclopediaByTag = (tagId: string, locale: string) =>
  useQuery({
    queryKey: ['tag-encyclopedia', tagId, locale],
    queryFn: () => apiGetTagEncyclopediaByTag(tagId, locale),
    enabled: Boolean(tagId) && Boolean(locale),
  })

export const useDataEntityTags = (
  entityType: TaggableEntityType,
  entityId: string,
  locale = 'en'
) =>
  useQuery({
    queryKey: ['entity-tags', entityType, entityId, locale],
    queryFn: () => apiGetEntityTags(entityType, entityId, locale),
    enabled: Boolean(entityId),
  })

export type PaginatedTagSummary = {
  data: TagSummary[]
  meta: z.infer<typeof apiMetaSchema>
}

export type PaginatedEntityTagLog = {
  data: EntityTagLog[]
  meta: z.infer<typeof apiMetaSchema>
}
