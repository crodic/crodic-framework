import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { apiLinksSchema, apiMetaSchema } from '@/global'
import http from '@/lib/http'
import type { RestQueryParams } from '@/lib/query-builder'
import { jobSchema, type Job, type JobFormValues } from './schema'

const paginatedMetaWrapper = z.object({
  meta: apiMetaSchema.passthrough(),
  links: apiLinksSchema.optional(),
})

export async function apiGetAdminJobs(params: RestQueryParams) {
  const response = await http.get('/admin/jobs', { params })
  if (Array.isArray(response.data)) {
    const data = z.array(jobSchema).parse(response.data)
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
      data: z.array(jobSchema),
    })
    .parse(response.data)
}

export async function apiGetAdminJobById(id: string): Promise<Job> {
  const response = await http.get(`/admin/jobs/${id}`)
  return jobSchema.parse(response.data)
}

export async function apiCreateAdminJob(data: JobFormValues) {
  return await http.post('/admin/jobs', data)
}

export async function apiUpdateAdminJob({
  id,
  data,
}: {
  id: string
  data: Partial<JobFormValues>
}) {
  return await http.put(`/admin/jobs/${id}`, data)
}

export async function apiUpdateAdminJobStatus({
  id,
  status,
  isFeatured,
}: {
  id: string
  status: string
  isFeatured?: boolean
}) {
  return await http.patch(`/admin/jobs/${id}/status`, { status, isFeatured })
}

export async function apiDeleteAdminJob(id: string) {
  return await http.delete(`/admin/jobs/${id}`)
}

export const useDataAdminJobsOverview = (params: RestQueryParams) =>
  useQuery({
    queryKey: ['admin-jobs', params],
    queryFn: () => apiGetAdminJobs(params),
  })
