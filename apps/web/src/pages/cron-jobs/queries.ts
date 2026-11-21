import z from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  type ApiMetadata,
  apiMetadataSchema,
  type PaginateQueryParams,
} from '@/global'
import http from '@/lib/http'
import {
  cronJobSchema,
  cronJobLogSchema,
  triggerJobResponseSchema,
  type CronJobSchema,
  type CronJobLogSchema,
  type TriggerJobResponseSchema,
} from './schema'

export async function getCronJobs(): Promise<CronJobSchema[]> {
  const response = await http.get('/cron-jobs')
  return z.array(cronJobSchema).parse(response.data)
}

export async function getCronJobLogs(
  params: PaginateQueryParams
): Promise<ApiMetadata & { data: CronJobLogSchema[] }> {
  const response = await http.get('/cron-jobs/logs', { params })
  return apiMetadataSchema
    .extend({ data: z.array(cronJobLogSchema) })
    .parse(response.data)
}

export async function getCronJobLogDetail(
  id: string
): Promise<CronJobLogSchema> {
  const response = await http.get(`/cron-jobs/logs/${id}`)
  return cronJobLogSchema.parse(response.data)
}

export async function triggerCronJob(
  jobKey: string
): Promise<TriggerJobResponseSchema> {
  const response = await http.post(`/cron-jobs/${jobKey}/trigger`)
  return triggerJobResponseSchema.parse(response.data)
}

export const useDataCronJobs = () =>
  useQuery({
    queryKey: ['cron_jobs'],
    queryFn: getCronJobs,
    staleTime: 1000 * 30,
  })

export const useDataCronJobLogs = (params: PaginateQueryParams) =>
  useQuery({
    queryKey: ['cron_job_logs', params],
    queryFn: () => getCronJobLogs(params),
    refetchInterval: (query) => {
      const stateData = query.state.data as any
      const hasRunning = stateData?.data?.some(
        (log: any) => log.status === 'RUNNING'
      )
      return hasRunning ? 3000 : false
    },
  })

export const useDataCronJobLogDetail = (id: string | null) =>
  useQuery({
    queryKey: ['cron_job_log', id],
    queryFn: () => getCronJobLogDetail(id!),
    enabled: Boolean(id),
  })

export const useTriggerCronJobMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (jobKey: string) => triggerCronJob(jobKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cron_jobs'] })
      queryClient.invalidateQueries({ queryKey: ['cron_job_logs'] })
    },
  })
}
