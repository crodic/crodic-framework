import { useQuery } from '@tanstack/react-query'
import { parsePaginatedResponse } from '@/lib/api-pagination'
import http from '@/lib/http'
import type { RestQueryParams } from '@/lib/query-builder'
import {
  eventSchema,
  eventParticipantSchema,
  type Event,
  type EventFormValues,
  type EventStatus,
} from './schema'

function normalizeEventPayload(data: Partial<EventFormValues>) {
  return {
    ...data,
    organizerName: data.organizerName?.trim() || undefined,
    bannerImageUrl: data.bannerImageUrl?.trim() || undefined,
    endAt: data.endAt?.trim() || undefined,
  }
}

export async function apiGetAdminEvents(params: RestQueryParams) {
  const response = await http.get('/admin/events', { params })
  return parsePaginatedResponse(eventSchema, response.data, params)
}

export async function apiGetAdminEventById(id: string): Promise<Event> {
  const response = await http.get(`/admin/events/${id}`)
  return eventSchema.parse(response.data)
}

export async function apiGetAdminEventParticipants({
  id,
  page,
}: {
  id: string
  page: number
}) {
  const params = { page, limit: 20 }
  const response = await http.get(`/admin/events/${id}/participants`, {
    params,
  })
  return parsePaginatedResponse(eventParticipantSchema, response.data, params)
}

export async function apiCreateAdminEvent(
  data: EventFormValues
): Promise<Event> {
  const response = await http.post('/admin/events', normalizeEventPayload(data))
  return eventSchema.parse(response.data)
}

export async function apiUpdateAdminEvent({
  id,
  data,
}: {
  id: string
  data: Partial<EventFormValues>
}): Promise<Event> {
  const response = await http.put(
    `/admin/events/${id}`,
    normalizeEventPayload(data)
  )
  return eventSchema.parse(response.data)
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

export const useDataAdminEventById = (id: string) =>
  useQuery({
    queryKey: ['admin-event', id],
    queryFn: () => apiGetAdminEventById(id),
    enabled: Boolean(id),
  })

export const useDataAdminEventParticipants = (id: string, page: number) =>
  useQuery({
    queryKey: ['admin-event-participants', id, page],
    queryFn: () => apiGetAdminEventParticipants({ id, page }),
    enabled: Boolean(id),
  })
