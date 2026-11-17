import { useQuery } from '@tanstack/react-query'
import { parsePaginatedResponse } from '@/lib/api-pagination'
import http from '@/lib/http'
import type { RestQueryParams } from '@/lib/query-builder'
import {
  contentReportSchema,
  type ContentReport,
  type ResolveReportFormValues,
} from './schema'

export async function apiGetContentReports(params: RestQueryParams) {
  const response = await http.get('/admin/content-reports', { params })
  return parsePaginatedResponse(contentReportSchema, response.data, params)
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
