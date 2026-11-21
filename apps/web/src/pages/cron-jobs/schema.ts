import z from 'zod'

export const cronJobStatusSchema = z.enum(['RUNNING', 'SUCCESS', 'FAILED'])
export type CronJobStatus = z.infer<typeof cronJobStatusSchema>

export const cronJobTriggerTypeSchema = z.enum(['SCHEDULED', 'MANUAL'])
export type CronJobTriggerType = z.infer<typeof cronJobTriggerTypeSchema>

export const cronJobSchema = z.object({
  key: z.string(),
  name: z.string(),
  schedule: z.string(),
  description: z.string(),
  category: z.string(),
  lastStatus: cronJobStatusSchema.nullish(),
  lastRunAt: z.string().nullish(),
  lastDurationMs: z.number().nullish(),
  lastSummary: z.string().nullish(),
  nextRunAt: z.string().nullish(),
})
export type CronJobSchema = z.infer<typeof cronJobSchema>

export const cronJobLogSchema = z.object({
  id: z.string(),
  jobKey: z.string(),
  jobName: z.string(),
  status: cronJobStatusSchema,
  triggerType: cronJobTriggerTypeSchema,
  triggeredByAdminId: z.string().nullish(),
  startedAt: z.string(),
  finishedAt: z.string().nullish(),
  durationMs: z.number().nullish(),
  summary: z.string().nullish(),
  errorMessage: z.string().nullish(),
  errorStack: z.string().nullish(),
  createdAt: z.string(),
})
export type CronJobLogSchema = z.infer<typeof cronJobLogSchema>

export const triggerJobResponseSchema = z.object({
  success: z.boolean(),
  jobKey: z.string(),
  status: cronJobStatusSchema,
  message: z.string(),
  durationMs: z.number(),
  summary: z.string().nullish(),
})
export type TriggerJobResponseSchema = z.infer<typeof triggerJobResponseSchema>

export const ColumnKey = {
  id: 'id',
  jobKey: 'jobKey',
  jobName: 'jobName',
  status: 'status',
  triggerType: 'triggerType',
  startedAt: 'startedAt',
  durationMs: 'durationMs',
  summary: 'summary',
  createdAt: 'createdAt',
} as const
