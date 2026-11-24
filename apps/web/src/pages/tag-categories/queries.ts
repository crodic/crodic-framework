import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type ApiMetadata, apiMetadataSchema } from '@/global'
import type { RestQueryParams } from '@repo/query-builder'
import http from '@/lib/http'
import {
  tagCategorySchema,
  type TagCategoryFormValues,
  type TagCategorySchema,
} from './schema'

export async function getTagCategories(
  params: RestQueryParams
): Promise<ApiMetadata & { data: TagCategorySchema[] }> {
  const response = await http.get('/tag-categories', { params })
  return apiMetadataSchema
    .extend({ data: z.array(tagCategorySchema) })
    .parse(response.data)
}

export function useDataTagCategories(params: RestQueryParams) {
  return useQuery({
    queryKey: ['admin-tag-categories', params],
    queryFn: () => getTagCategories(params),
  })
}

export function useCreateTagCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: TagCategoryFormValues) => {
      const payload: Record<string, any> = {
        name: data.name.trim(),
        color: data.color.trim(),
        icon: data.icon.trim(),
        sortOrder: Number(data.sortOrder),
        isActive: data.isActive,
      }
      if (data.slug?.trim()) {
        payload.slug = data.slug.trim()
      }
      if (data.description?.trim()) {
        payload.description = data.description.trim()
      }
      return http.post('/tag-categories', payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tag-categories'] })
    },
  })
}

export function useUpdateTagCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: TagCategoryFormValues
    }) => {
      const payload: Record<string, any> = {
        name: data.name.trim(),
        color: data.color.trim(),
        icon: data.icon.trim(),
        sortOrder: Number(data.sortOrder),
        isActive: data.isActive,
      }
      if (data.slug?.trim()) {
        payload.slug = data.slug.trim()
      }
      if (data.description !== undefined) {
        payload.description = data.description.trim() || null
      }
      return http.patch(`/tag-categories/${id}`, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tag-categories'] })
    },
  })
}

export function useDeleteTagCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      return http.delete(`/tag-categories/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tag-categories'] })
    },
  })
}
