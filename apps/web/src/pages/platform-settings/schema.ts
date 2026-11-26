import { z } from 'zod'

export const kosumeSettingsSchema = z.object({
  max_photos_per_album: z.number().min(1).max(200),
  max_file_size_mb: z.number().min(1).max(100),
  auto_approve_posts: z.boolean(),
  commission_platform_rate_percent: z.number().min(0).max(100),
  cosplay_confidence_threshold_percent: z.number().min(0).max(100),
  banned_keywords: z.string(),
  support_email: z.string().email('Email không hợp lệ'),
  support_hotline: z.string().min(5),
})

export type KosumeSettings = z.infer<typeof kosumeSettingsSchema>

export const kosumeSettingsFormSchema = z.object({
  max_photos_per_album: z.number().min(1).max(200),
  max_file_size_mb: z.number().min(1).max(100),
  auto_approve_posts: z.boolean(),
  commission_platform_rate_percent: z.number().min(0).max(100),
  cosplay_confidence_threshold_percent: z.number().min(0).max(100),
  banned_keywords: z.string(),
  support_email: z.string().email('Email không hợp lệ'),
  support_hotline: z.string().min(5),
})

export type KosumeSettingsFormValues = z.infer<typeof kosumeSettingsFormSchema>
