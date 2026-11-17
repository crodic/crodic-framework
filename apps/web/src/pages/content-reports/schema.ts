import { z } from 'zod'

export const ReportColumnKey = {
  id: 'id',
  reporterUserId: 'reporterUserId',
  targetType: 'targetType',
  targetId: 'targetId',
  reason: 'reason',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
} as const

export const reportStatusEnum = z.enum([
  'pending',
  'reviewing',
  'resolved',
  'dismissed',
])
export type ReportStatus = z.infer<typeof reportStatusEnum>

export const contentReportSchema = z.object({
  id: z.string(),
  reporterUserId: z.string(),
  reporterName: z.string().nullish(),
  reporterEmail: z.string().nullish(),
  reporterAvatar: z.string().nullish(),
  targetType: z.enum(['post', 'user', 'comment', 'job']),
  targetId: z.string(),
  reason: z.string(),
  description: z.string().nullish(),
  status: z.enum(['pending', 'reviewing', 'resolved', 'dismissed']),
  resolvedByAdminId: z.string().nullish(),
  resolvedByAdminName: z.string().nullish(),
  resolutionNote: z.string().nullish(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
})

export type ContentReport = z.infer<typeof contentReportSchema>

export const resolveReportSchema = z.object({
  status: z.enum(['resolved', 'dismissed']),
  resolutionNote: z.string().optional(),
})

export type ResolveReportFormValues = z.infer<typeof resolveReportSchema>
