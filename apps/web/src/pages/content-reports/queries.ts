import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { apiLinksSchema, apiMetaSchema } from '@/global'
import http from '@/lib/http'
import type { RestQueryParams } from '@/lib/query-builder'
import {
  contentReportSchema,
  type ContentReport,
  type ResolveReportFormValues,
} from './schema'

const paginatedMetaWrapper = z.object({
  meta: apiMetaSchema.passthrough(),
  links: apiLinksSchema.optional(),
})

export async function apiGetContentReports(params: RestQueryParams) {
  const response = await http.get('/admin/content-reports', { params })
  if (Array.isArray(response.data)) {
    const data = z.array(contentReportSchema).parse(response.data)
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
      data: z.array(contentReportSchema),
    })
    .parse(response.data)
}

export async function apiGetContentReportById(
  id: string
): Promise<ContentReport> {
  const response = await http.get(`/admin/content-reports/${id}`)
  return contentReportSchema.parse(response.data)
}

export async function apiResolveContentReport({
  id,
  data,
}: {
  id: string
  data: ResolveReportFormValues
}) {
  return await http.put(`/admin/content-reports/${id}/resolve`, data)
}

export const useDataContentReportsOverview = (params: RestQueryParams) =>
  useQuery({
    queryKey: ['admin-content-reports', params],
    queryFn: () => apiGetContentReports(params),
  })
