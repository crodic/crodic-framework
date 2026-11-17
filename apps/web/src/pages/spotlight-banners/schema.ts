import { z } from 'zod'

export const SpotlightColumnKey = {
  id: 'id',
  name: 'name',
  badge: 'badge',
  tagline: 'tagline',
  bannerImageUrl: 'bannerImageUrl',
  portfolioHref: 'portfolioHref',
  sortOrder: 'sortOrder',
  isActive: 'isActive',
  createdAt: 'createdAt',
} as const

export const spotlightBannerSchema = z.object({
  id: z.string(),
  name: z.string(),
  badge: z.string(),
  tagline: z.string(),
  bannerImageUrl: z.string(),
  bannerFileId: z.string().nullish(),
  portfolioHref: z.string(),
  bookingHref: z.string().nullish(),
  sortOrder: z.number().default(0),
  isVerified: z.boolean().default(true),
  isActive: z.boolean().default(true),
  cosplayerUserId: z.string().nullish(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
})

export type SpotlightBanner = z.infer<typeof spotlightBannerSchema>

export const spotlightBannerFormSchema = z.object({
  cosplayerUserId: z.string().optional().nullable(),
  name: z.string().min(2, 'Tên người/nhân vật là bắt buộc'),
  badge: z.string().min(2, 'Huy hiệu là bắt buộc (Ví dụ: Cosplayer Tiêu Điểm)'),
  tagline: z.string().min(5, 'Slogan/mô tả là bắt buộc'),
  bannerImageUrl: z
    .string()
    .url(
      'Đường dẫn hình ảnh banner phải là URL hợp lệ (bắt đầu bằng https://...)'
    ),
  portfolioHref: z
    .string()
    .min(1, 'Liên kết hồ sơ là bắt buộc (VD: /cosplayer/kiriko)'),
  bookingHref: z.string().optional().nullable(),
  sortOrder: z.number(),
  isVerified: z.boolean(),
  isActive: z.boolean(),
})

export type SpotlightBannerFormValues = z.infer<
  typeof spotlightBannerFormSchema
>
