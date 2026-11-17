import { useQuery } from '@tanstack/react-query'
import { parsePaginatedResponse } from '@/lib/api-pagination'
import http from '@/lib/http'
import type { RestQueryParams } from '@/lib/query-builder'
import { bookingSchema, type Booking, type BookingStatus } from './schema'

export async function apiGetAdminBookings(params: RestQueryParams) {
  const response = await http.get('/admin/bookings', { params })
  return parsePaginatedResponse(bookingSchema, response.data, params)
}

export async function apiGetAdminBookingById(id: string): Promise<Booking> {
  const response = await http.get(`/admin/bookings/${id}`)
  return bookingSchema.parse(response.data)
}

export async function apiUpdateAdminBookingStatus({
  id,
  status,
  responseNote,
}: {
  id: string
  status: BookingStatus
  responseNote?: string
}) {
  return await http.patch(`/admin/bookings/${id}/status`, {
    status,
    responseNote,
  })
}

export async function apiDeleteAdminBooking(id: string) {
  return await http.delete(`/admin/bookings/${id}`)
}

export const useDataAdminBookingsOverview = (params: RestQueryParams) =>
  useQuery({
    queryKey: ['admin-bookings', params],
    queryFn: () => apiGetAdminBookings(params),
  })
