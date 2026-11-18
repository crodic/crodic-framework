import { useQuery } from '@tanstack/react-query'
import { parsePaginatedResponse } from '@/lib/api-pagination'
import http from '@/lib/http'
import type { RestQueryParams } from '@/lib/query-builder'
import { spotlightBannerSchema, type SpotlightBannerFormValues } from './schema'

export async function apiGetAdminSpotlightBanners(params: RestQueryParams) {
  const response = await http.get('/admin/spotlight-banners', { params })
  return parsePaginatedResponse(spotlightBannerSchema, response.data, params)
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
