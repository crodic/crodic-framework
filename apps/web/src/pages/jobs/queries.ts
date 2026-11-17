import { useQuery } from '@tanstack/react-query'
import { parsePaginatedResponse } from '@/lib/api-pagination'
import http from '@/lib/http'
import type { RestQueryParams } from '@/lib/query-builder'
import {
  jobSchema,
  type Job,
  type JobFormValues,
  type JobStatus,
} from './schema'

export async function apiGetAdminJobs(params: RestQueryParams) {
  const response = await http.get('/admin/jobs', { params })
  return parsePaginatedResponse(jobSchema, response.data, params)
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
  status: JobStatus
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
