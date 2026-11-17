import { z } from 'zod'

export const JobColumnKey = {
  id: 'id',
  title: 'title',
  brandName: 'brandName',
  categoryCode: 'categoryCode',
  budgetLabel: 'budgetLabel',
  locationLabel: 'locationLabel',
  status: 'status',
  isFeatured: 'isFeatured',
  applicationsCount: 'applicationsCount',
  deadlineLabel: 'deadlineLabel',
  createdAt: 'createdAt',
} as const

export const jobStatusEnum = z.enum([
  'draft',
  'pending_approval',
  'open',
  'closed',
  'expired',
])
export type JobStatus = z.infer<typeof jobStatusEnum>

export const jobSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  brandId: z.string().nullish(),
  brandName: z.string(),
  brandLogoUrl: z.string().nullish(),
  brandInitials: z.string().nullish(),
  brandColor: z.string().nullish(),
  isVerified: z.boolean().default(false),
  categoryCode: z.enum(['lookbook', 'event', 'crafting', 'game_ads']),
  categoryLabel: z.string(),
  budgetLabel: z.string(),
  budgetMin: z.number().nullish(),
  budgetMax: z.number().nullish(),
  locationLabel: z.string(),
  locationFilterCode: z.string().nullish(),
  deadlineLabel: z.string(),
  status: z.enum(['draft', 'pending_approval', 'open', 'closed', 'expired']),
  isFeatured: z.boolean().default(false),
  applicationsCount: z.number().default(0),
  requirements: z.string().optional(),
  description: z.string().optional(),
  contactEmail: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
})

export type Job = z.infer<typeof jobSchema>

export const jobFormSchema = z.object({
  title: z.string().min(3, 'Tiêu đề tuyển dụng phải từ 3 ký tự'),
  brandName: z.string().min(2, 'Tên thương hiệu là bắt buộc'),
  categoryCode: z.enum(['lookbook', 'event', 'crafting', 'game_ads']),
  categoryLabel: z.string().min(1, 'Nhãn phân loại là bắt buộc'),
  budgetLabel: z.string().min(1, 'Mức thù lao là bắt buộc'),
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
  locationLabel: z.string().min(1, 'Địa điểm là bắt buộc'),
  locationFilterCode: z.string().optional(),
  deadlineLabel: z.string().min(1, 'Hạn ứng tuyển là bắt buộc'),
  deadlineAt: z.string().optional(),
  requirements: z.string().min(5, 'Yêu cầu ứng viên là bắt buộc'),
  description: z.string().min(5, 'Mô tả công việc là bắt buộc'),
  contactEmail: z.string().email('Email liên hệ không hợp lệ'),
  status: z.enum(['draft', 'pending_approval', 'open', 'closed', 'expired']),
  isFeatured: z.boolean(),
})

export type JobFormValues = z.infer<typeof jobFormSchema>
