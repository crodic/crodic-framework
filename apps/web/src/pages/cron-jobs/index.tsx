import { useCallback, useMemo, useState } from 'react'
import { Clock, ListOrdered } from 'lucide-react'
import { parseAsArrayOf, parseAsString } from 'nuqs'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import {
  useRestResourceTable,
  type RestResourceQueryBuilderFn,
} from '@/hooks/use-rest-resource-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableSortList } from '@/components/data-table/data-table-sort-list'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-shell'
import { getCronJobLogColumns } from './columns'
import { CronJobCards } from './components/cron-job-cards'
import { LogDetailDialog } from './components/log-detail-dialog'
import { TriggerConfirmDialog } from './components/trigger-confirm-dialog'
import {
  useDataCronJobs,
  useDataCronJobLogs,
  useTriggerCronJobMutation,
} from './queries'
import { ColumnKey, type CronJobLogSchema, type CronJobSchema } from './schema'

const cronJobLogFilterParsers = {
  jobKey: parseAsString.withDefault(''),
  status: parseAsArrayOf(parseAsString, ',').withDefault([]),
  triggerType: parseAsArrayOf(parseAsString, ',').withDefault([]),
} as const

export function PageCronJobsOverview() {
  const { t } = useTranslation()
  const [selectedJobToTrigger, setSelectedJobToTrigger] =
    useState<CronJobSchema | null>(null)
  const [selectedLogDetail, setSelectedLogDetail] =
    useState<CronJobLogSchema | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useBreadcrumb([{ title: t('navigation.general.cronJobs', 'Cron Jobs') }])

  const { data: jobs = [], refetch: refetchJobs } = useDataCronJobs()

  const triggerMutation = useTriggerCronJobMutation()

  const handleOpenDetail = useCallback((log: CronJobLogSchema) => {
    setSelectedLogDetail(log)
    setIsDetailOpen(true)
  }, [])

  const columns = useMemo(
    () => getCronJobLogColumns({ onViewDetails: handleOpenDetail }),
    [handleOpenDetail]
  )

  const buildQuery: RestResourceQueryBuilderFn<typeof cronJobLogFilterParsers> =
    useCallback((builder, filter, search) => {
      builder
        .filter('jobKey', filter.jobKey)
        .filter('status', filter.status || [])
        .filter('triggerType', filter.triggerType || [])

      if (search) {
        builder.filter('search', search)
      }
    }, [])

  const { table, isFetching: isLogsFetching } = useRestResourceTable<
    CronJobLogSchema,
    typeof cronJobLogFilterParsers
  >({
    columns,
    allowedSorts: [
      ColumnKey.startedAt,
      ColumnKey.durationMs,
      ColumnKey.status,
      ColumnKey.createdAt,
    ],
    filterParsers: cronJobLogFilterParsers,
    queryHook: useDataCronJobLogs,
    buildQuery,
    initialState: {
      sorting: [{ id: ColumnKey.startedAt, desc: true }],
    },
    getRowId: (row) => row.id,
  })

  const handleConfirmTrigger = () => {
    if (!selectedJobToTrigger) return
    triggerMutation.mutate(selectedJobToTrigger.key, {
      onSuccess: (res) => {
        if (res.status === 'FAILED' || res.success === false) {
          toast.error(`Job "${selectedJobToTrigger.name}" failed`, {
            description: res.summary || res.message || 'Job execution failed.',
          })
        } else {
          toast.success(
            `Job "${selectedJobToTrigger.name}" executed successfully!`,
            {
              description: res.summary || `Duration: ${res.durationMs}ms`,
            }
          )
        }
        setSelectedJobToTrigger(null)
      },
      onError: (err: any) => {
        toast.error(`Failed to execute "${selectedJobToTrigger.name}"`, {
          description:
            err?.response?.data?.message ||
            err.message ||
            'Unknown error occurred.',
        })
        setSelectedJobToTrigger(null)
      },
    })
  }

  return (
    <Main fluid className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <PageHeader
        title={t('cronJobs.overview.title', 'Cron Jobs Management')}
        description={t(
          'cronJobs.overview.description',
          'Monitor registered background tasks, trigger manual executions, and audit execution logs.'
        )}
      />

      <Tabs defaultValue='jobs' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='jobs' className='gap-2 text-xs'>
            <Clock className='h-4 w-4' />
            {t('cronJobs.tabs.jobs', 'Scheduled Tasks')} ({jobs.length})
          </TabsTrigger>
          <TabsTrigger value='logs' className='gap-2 text-xs'>
            <ListOrdered className='h-4 w-4' />
            {t('cronJobs.tabs.logs', 'Execution Logs')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='jobs' className='space-y-4'>
          <CronJobCards
            jobs={jobs}
            onTriggerJob={(job) => setSelectedJobToTrigger(job)}
            isTriggering={triggerMutation.isPending}
            onRefresh={() => refetchJobs()}
          />
        </TabsContent>

        <TabsContent value='logs' className='space-y-4'>
          <DataTable
            table={table}
            onClickRowAction={(log) => handleOpenDetail(log)}
            isFetching={isLogsFetching}
          >
            <DataTableToolbar table={table}>
              <DataTableSortList table={table} />
            </DataTableToolbar>
          </DataTable>
        </TabsContent>
      </Tabs>

      {/* Manual Run Confirm Dialog */}
      <TriggerConfirmDialog
        job={selectedJobToTrigger}
        open={Boolean(selectedJobToTrigger)}
        onOpenChange={(open) => !open && setSelectedJobToTrigger(null)}
        onConfirm={handleConfirmTrigger}
        isLoading={triggerMutation.isPending}
      />

      {/* Execution Log Detail Dialog */}
      <LogDetailDialog
        log={selectedLogDetail}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </Main>
  )
}
