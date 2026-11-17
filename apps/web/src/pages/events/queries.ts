import { useQuery } from '@tanstack/react-query'
import { parsePaginatedResponse } from '@/lib/api-pagination'
import http from '@/lib/http'
import type { RestQueryParams } from '@/lib/query-builder'
import {
  eventSchema,
  type Event,
  type EventFormValues,
  type EventStatus,
} from './schema'

export async function apiGetAdminEvents(params: RestQueryParams) {
  const response = await http.get('/admin/events', { params })
  return parsePaginatedResponse(eventSchema, response.data, params)
}

export async function apiGetAdminEventById(id: string): Promise<Event> {
  const response = await http.get(`/admin/events/${id}`)
  return eventSchema.parse(response.data)
}

export async function apiCreateAdminEvent(data: EventFormValues) {
  return await http.post('/admin/events', data)
}

export async function apiUpdateAdminEvent({
  id,
  data,
}: {
  id: string
  data: Partial<EventFormValues>
}) {
  return await http.put(`/admin/events/${id}`, data)
}

export async function apiUpdateAdminEventStatus({
  id,
  status,
  isFeaturedFestival,
  isRecruiting,
}: {
  id: string
  status: EventStatus
  isFeaturedFestival?: boolean
  isRecruiting?: boolean
}) {
  return await http.patch(`/admin/events/${id}/status`, {
    status,
    isFeaturedFestival,
    isRecruiting,
  })
}

export async function apiDeleteAdminEvent(id: string) {
  return await http.delete(`/admin/events/${id}`)
}

export const useDataAdminEventsOverview = (params: RestQueryParams) =>
  useQuery({
    queryKey: ['admin-events', params],
    queryFn: () => apiGetAdminEvents(params),
  })
