import { z } from 'zod'

export const BookingColumnKey = {
  id: 'id',
  bookingType: 'bookingType',
  requester: 'requester',
  cosplayer: 'cosplayer',
  targetDateLabel: 'targetDateLabel',
  budgetLabel: 'budgetLabel',
  status: 'status',
  createdAt: 'createdAt',
} as const

export const bookingStatusEnum = z.enum([
  'pending',
  'accepted',
  'declined',
  'completed',
  'cancelled',
])
export type BookingStatus = z.infer<typeof bookingStatusEnum>

export const bookingUserSchema = z.object({
  id: z.string(),
  fullName: z.string().nullish(),
  email: z.string().nullish(),
  role: z.string().nullish(),
  avatarUrl: z.string().nullish(),
})

export const bookingSchema = z.object({
  id: z.string(),
  targetCosplayerId: z.string(),
  targetCosplayer: bookingUserSchema.nullish(),
  requesterUserId: z.string(),
  requesterUser: bookingUserSchema.nullish(),
  bookingType: z.string(),
  fullName: z.string(),
  contactInfo: z.string(),
  targetDateLabel: z.string(),
  budgetLabel: z.string(),
  details: z.string(),
  status: bookingStatusEnum,
  responseNote: z.string().nullable().optional(),
  respondedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
})

export type Booking = z.infer<typeof bookingSchema>

export const updateBookingStatusSchema = z.object({
  status: bookingStatusEnum,
  responseNote: z.string().max(500, 'Ghi chú tối đa 500 ký tự').optional(),
})

export type UpdateBookingStatusValues = z.infer<
  typeof updateBookingStatusSchema
>
