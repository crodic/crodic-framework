import z from 'zod'
import { useQuery } from '@tanstack/react-query'
import {
  type ApiMetadata,
  apiMetadataSchema,
  type RestQueryParams,
} from '@/global'
import http from '@/lib/http'
import {
  type AdminCreateSchema,
  type AdminEditSchema,
  adminSchema,
  type AdminSchema,
} from './schema'

async function getAdminListing(
  params: RestQueryParams
): Promise<ApiMetadata & { data: AdminSchema[] }> {
  const response = await http.get('/admin-users', { params })

  return apiMetadataSchema
    .extend({ data: z.array(adminSchema) })
    .parse(response.data)
}

export async function apiCreateAdmin(data: AdminCreateSchema) {
  const { confirmPassword: _confirmPassword, ...payload } = data

  return await http.post('/admin-users', payload)
}

export async function apiGetAdminById(id: string): Promise<AdminSchema> {
  const response = await http.get(`/admin-users/${id}`)

  return adminSchema.parse(response.data)
}

export async function apiEditAdmin({
  id,
  data,
}: {
  id: string
  data: AdminEditSchema
}) {
  return await http.put(`/admin-users/${id}`, data)
}

export async function deleteAdmin(id: string) {
  return await http.delete(`/admin-users/${id}`)
}

export async function restoreAdmin(id: string) {
  return await http.post(`/admin-users/${id}/restore`)
}

export async function apiResendAdminVerification(id: string) {
  const response = await http.post<{ message: string }>(
    `/admin-users/${id}/resend-verification`
  )
  return response.data
}

export const useDataAdminOverview = (params: RestQueryParams) =>
  useQuery({
    queryKey: ['admins', params],
    queryFn: () => getAdminListing(params),
  })

export const useDataGetAdminEdit = (id: string) =>
  useQuery<AdminSchema>({
    queryKey: ['admin', id],
    queryFn: () => apiGetAdminById(id),
  })

export const useDataGetAdminDetail = (id: string) =>
  useQuery<AdminSchema>({
    queryKey: ['admin', id],
    queryFn: () => apiGetAdminById(id),
  })
