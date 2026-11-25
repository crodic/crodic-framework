import { z } from 'zod'

export const EventColumnKey = {
  id: 'id',
  title: 'title',
  venue: 'venue',
  locationLabel: 'locationLabel',
  dateString: 'dateString',
  startAt: 'startAt',
  status: 'status',
  isFeaturedFestival: 'isFeaturedFestival',
  isRecruiting: 'isRecruiting',
  participantsCount: 'participantsCount',
  interestedCount: 'interestedCount',
  createdAt: 'createdAt',
} as const

export const eventStatusEnum = z.enum([
  'draft',
  'upcoming',
  'ongoing',
  'completed',
  'cancelled',
])
export type EventStatus = z.infer<typeof eventStatusEnum>

export const eventScheduleItemSchema = z.object({
  time: z.string().min(1, 'Vui lòng nhập thời gian'),
  activity: z.string().min(1, 'Vui lòng nhập nội dung hoạt động'),
})
export type EventScheduleItem = z.infer<typeof eventScheduleItemSchema>

export const eventParticipantSchema = z.object({
  id: z.string(),
  eventId: z.string().optional(),
  userId: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullish(),
  isVerified: z.boolean().default(false),
  roleLabel: z.string().nullish(),
  sortOrder: z.number().default(0),
})
export type EventParticipant = z.infer<typeof eventParticipantSchema>

export const eventSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  dayLabel: z.string(),
  monthLabel: z.string(),
  yearLabel: z.string().nullish(),
  dateString: z.string(),
  startAt: z.string(),
  endAt: z.string().nullish(),
  locationLabel: z.string(),
  organizerName: z.string().nullish(),
  venue: z.string(),
  imageUrl: z.string(),
  bannerImageUrl: z.string().nullish(),
  description: z.string().optional(),
  ticketPriceLabel: z.string().nullish(),
  ticketPriceAmount: z.number().nullish(),
  isRecruiting: z.boolean().default(false),
  isFeaturedFestival: z.boolean().default(false),
  status: eventStatusEnum,
  categories: z.array(z.string()).default([]),
  schedule: z.array(eventScheduleItemSchema).default([]),
  participants: z.array(eventParticipantSchema).default([]),
  participantsCount: z.number().default(0),
  interestedCount: z.number().default(0),
  applicationsCount: z.number().default(0),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type Event = z.infer<typeof eventSchema>

export const eventFormSchema = z.object({
  title: z.string().min(3, 'Tên sự kiện phải từ 3 ký tự'),
  startAt: z.string().min(1, 'Thời gian bắt đầu là bắt buộc'),
  endAt: z.string().optional(),
  locationLabel: z.string().min(1, 'Tỉnh / Thành phố là bắt buộc'),
  organizerName: z.string().optional(),
  venue: z.string().min(2, 'Địa điểm tổ chức là bắt buộc'),
  imageUrl: z
    .string()
    .url('Ảnh đại diện sự kiện phải là URL hợp lệ (bắt đầu bằng https://...)'),
  bannerImageUrl: z
    .string()
    .url('Ảnh bìa banner phải là URL hợp lệ (bắt đầu bằng https://...)')
    .optional()
    .or(z.literal('')),
  description: z.string().min(5, 'Mô tả sự kiện là bắt buộc'),
  ticketPriceAmount: z.number().min(0).optional(),
  status: eventStatusEnum,
  isFeaturedFestival: z.boolean(),
  isRecruiting: z.boolean(),
  categories: z.array(z.string()),
  schedule: z.array(eventScheduleItemSchema),
})

export type EventFormValues = z.infer<typeof eventFormSchema>
