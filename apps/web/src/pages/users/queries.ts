import z from 'zod'
import { useQuery } from '@tanstack/react-query'
import {
  type ApiMetadata,
  apiMetadataSchema,
  type PaginateQueryParams,
} from '@/global'
import http from '@/lib/http'
import { userSchema, type UserSchema } from './schema'

async function getUserListing(
  params: PaginateQueryParams
): Promise<ApiMetadata & { data: UserSchema[] }> {
  const response = await http.get('/users', { params })

  return apiMetadataSchema
    .extend({ data: z.array(userSchema) })
    .parse(response.data)
}

export async function apiDeleteUser(id: string) {
  return await http.delete(`/users/${id}`)
}

export async function apiHardDeleteUser(id: string) {
  return await http.delete(`/users/${id}/permanent`)
}

export async function apiRestoreUser(id: string) {
  return await http.post(`/users/${id}/restore`)
}

export async function apiToggleVerifyUser(id: string) {
  return await http.patch(`/users/${id}/verify`)
}

export async function apiToggleCosplayerVerify(id: string) {
  return await http.patch(`/users/${id}/cosplayer-verify`)
}

export async function apiHandleCosplayerRequest({
  id,
  approved,
}: {
  id: string
  approved: boolean
}) {
  return await http.patch(`/users/${id}/cosplayer-request`, { approved })
}

export async function apiCreateUser(data: Record<string, unknown>) {
  return await http.post('/users', data)
}

export async function apiGetUserById(id: string): Promise<UserSchema> {
  const response = await http.get(`/users/${id}`)

  return userSchema.parse(response.data)
}

export async function apiEditUser({
  id,
  data,
}: {
  id: string
  data: Record<string, unknown>
}) {
  return await http.put(`/users/${id}`, data)
}

export const useDataUserOverview = (params: PaginateQueryParams) =>
  useQuery({
    queryKey: ['users', params],
    queryFn: () => getUserListing(params),
  })

export const useDataGetUserEdit = (id: string) =>
  useQuery<UserSchema>({
    queryKey: ['user', id],
    queryFn: () => apiGetUserById(id),
  })

export const useDataGetUserDetail = (id: string) =>
  useQuery<UserSchema>({
    queryKey: ['user', id],
    queryFn: () => apiGetUserById(id),
  })
