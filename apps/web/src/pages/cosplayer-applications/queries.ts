import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { type ApiMetadata, apiMetadataSchema } from '@/global'
import type { RestQueryParams } from '@repo/query-builder'
import http from '@/lib/http'
import {
  cosplayerApplicationSchema,
  type CosplayerApplicationSchema,
} from './schema'

export async function getCosplayerApplications(
  params: RestQueryParams
): Promise<ApiMetadata & { data: CosplayerApplicationSchema[] }> {
  const response = await http.get('/admin/cosplayer-applications', { params })
  return apiMetadataSchema
    .extend({ data: z.array(cosplayerApplicationSchema) })
    .parse(response.data)
}

export function useDataCosplayerApplications(params: RestQueryParams) {
  return useQuery({
    queryKey: ['admin-cosplayer-applications', params],
    queryFn: () => getCosplayerApplications(params),
  })
}

export async function apiReviewCosplayerApplication({
  id,
  status,
  rejectionReason,
  adminNotes,
}: {
  id: string
  status: 'APPROVED' | 'REJECTED'
  rejectionReason?: string
  adminNotes?: string
}) {
  return await http.patch(`/admin/cosplayer-applications/${id}/review`, {
    status,
    rejectionReason,
    adminNotes,
  })
}
