import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { apiLinksSchema, apiMetaSchema } from '@/global'
import http from '@/lib/http'
import type { RestQueryParams } from '@/lib/query-builder'
import { spotlightBannerSchema, type SpotlightBannerFormValues } from './schema'

const paginatedMetaWrapper = z.object({
  meta: apiMetaSchema.passthrough(),
  links: apiLinksSchema.optional(),
})

export async function apiGetAdminSpotlightBanners(params: RestQueryParams) {
  const response = await http.get('/admin/spotlight-banners', { params })
  if (Array.isArray(response.data)) {
    const data = z.array(spotlightBannerSchema).parse(response.data)
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
      data: z.array(spotlightBannerSchema),
    })
    .parse(response.data)
}

export async function apiCreateAdminSpotlightBanner(
  data: SpotlightBannerFormValues
) {
  return await http.post('/admin/spotlight-banners', data)
}

export async function apiUpdateAdminSpotlightBanner({
  id,
  data,
}: {
  id: string
  data: Partial<SpotlightBannerFormValues>
}) {
  return await http.put(`/admin/spotlight-banners/${id}`, data)
}

export async function apiToggleAdminSpotlightBanner(id: string) {
  return await http.patch(`/admin/spotlight-banners/${id}/toggle`)
}

export async function apiDeleteAdminSpotlightBanner(id: string) {
  return await http.delete(`/admin/spotlight-banners/${id}`)
}

export const useDataAdminSpotlightBannersOverview = (params: RestQueryParams) =>
  useQuery({
    queryKey: ['admin-spotlight-banners', params],
    queryFn: () => apiGetAdminSpotlightBanners(params),
  })
