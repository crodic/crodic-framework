import { z } from 'zod'

export const rankingSettingsSchema = z.object({
  likesWeight: z.number().min(0).max(100),
  followersWeight: z.number().min(0).max(100),
  enableCronJob: z.boolean(),
  enableFallbackRealtime: z.boolean(),
  cronSchedule: z.string().optional(),
  lastSnapshotAt: z.string().nullable().optional(),
  lastSnapshotStatus: z.enum(['idle', 'success', 'failed']).optional(),
})

export type RankingSettings = z.infer<typeof rankingSettingsSchema>

export const rankingSettingsFormSchema = z.object({
  likesWeight: z.number().min(0, 'Trọng số phải >= 0').max(100, 'Tối đa 100'),
  followersWeight: z
    .number()
    .min(0, 'Trọng số phải >= 0')
    .max(100, 'Tối đa 100'),
  enableCronJob: z.boolean(),
  enableFallbackRealtime: z.boolean(),
})

export type RankingSettingsFormValues = z.infer<
  typeof rankingSettingsFormSchema
>

export interface LeaderboardPreviewItem {
  id: string
  rank: number
  displayName: string
  handle: string
  avatarUrl: string
  isVerified: boolean
  likesCount: number
  followersCount: number
  score: number
  roleLabel: string
}
