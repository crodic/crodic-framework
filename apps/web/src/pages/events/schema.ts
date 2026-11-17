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
  locationFilterCode: z.string().nullish(),
  venue: z.string(),
  imageUrl: z.string(),
  bannerImageUrl: z.string().nullish(),
  description: z.string().optional(),
  ticketPriceLabel: z.string().nullish(),
  isRecruiting: z.boolean().default(false),
  isFeaturedFestival: z.boolean().default(false),
  registrationCta: z.string().nullish(),
  status: z.enum(['draft', 'upcoming', 'ongoing', 'completed', 'cancelled']),
  participantsCount: z.number().default(0),
  interestedCount: z.number().default(0),
  applicationsCount: z.number().default(0),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
})

export type Event = z.infer<typeof eventSchema>

export const eventFormSchema = z.object({
  title: z.string().min(3, 'Tên sự kiện phải từ 3 ký tự'),
  dayLabel: z.string().min(1, 'Ngày hiển thị là bắt buộc'),
  monthLabel: z.string().min(1, 'Tháng hiển thị là bắt buộc'),
  yearLabel: z.string().optional(),
  dateString: z.string().min(1, 'Chuỗi ngày diễn ra là bắt buộc'),
  startAt: z.string().min(1, 'Thời gian bắt đầu là bắt buộc'),
  locationLabel: z.string().min(1, 'Tỉnh / Thành phố là bắt buộc'),
  venue: z.string().min(2, 'Địa điểm tổ chức là bắt buộc'),
  imageUrl: z.string().min(1, 'Ảnh đại diện sự kiện là bắt buộc'),
  description: z.string().min(5, 'Mô tả sự kiện là bắt buộc'),
  ticketPriceLabel: z.string().optional(),
  status: z.enum(['draft', 'upcoming', 'ongoing', 'completed', 'cancelled']),
  isFeaturedFestival: z.boolean(),
  isRecruiting: z.boolean(),
})

export type EventFormValues = z.infer<typeof eventFormSchema>
