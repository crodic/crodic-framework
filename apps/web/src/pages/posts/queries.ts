import { useQuery } from '@tanstack/react-query'
import { parsePaginatedResponse } from '@/lib/api-pagination'
import http from '@/lib/http'
import type { RestQueryParams } from '@/lib/query-builder'
import { postSchema, type Post, type PostStatus } from './schema'

export async function apiGetAdminPosts(params: RestQueryParams) {
  const response = await http.get('/admin/posts', { params })
  return parsePaginatedResponse(postSchema, response.data, params)
}

export async function apiGetAdminPostById(id: string): Promise<Post> {
  const response = await http.get(`/admin/posts/${id}`)
  return postSchema.parse(response.data)
}

export async function apiToggleAdminPostFeature({
  id,
  isFeatured,
}: {
  id: string
  isFeatured?: boolean
}) {
  return await http.patch(`/admin/posts/${id}/feature`, { isFeatured })
}

export async function apiUpdateAdminPostStatus({
  id,
  status,
  isPublic,
  reason,
}: {
  id: string
  status: PostStatus
  isPublic?: boolean
  reason?: string
}) {
  return await http.patch(`/admin/posts/${id}/status`, {
    status,
    isPublic,
    reason,
  })
}

export async function apiDeleteAdminPost(id: string) {
  return await http.delete(`/admin/posts/${id}`)
}

export const useDataAdminPostsOverview = (params: RestQueryParams) =>
  useQuery({
    queryKey: ['admin-posts', params],
    queryFn: () => apiGetAdminPosts(params),
  })
