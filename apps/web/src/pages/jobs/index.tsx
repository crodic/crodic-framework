import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Briefcase, PlusIcon } from 'lucide-react'
import { parseAsString } from 'nuqs'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import {
  useRestResourceTable,
  type RestResourceQueryBuilderFn,
} from '@/hooks/use-rest-resource-table'
import { Button } from '@/components/ui/button'
import { DeleteAlertDialog } from '@/components/common/delete-alert-dialog'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableSortList } from '@/components/data-table/data-table-sort-list'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-shell'
import { getJobsTableColumns } from './columns'
import { JobFormDialog } from './components/job-form-dialog'
import { JobStatusDialog } from './components/job-status-dialog'
import { apiDeleteAdminJob, useDataAdminJobsOverview } from './queries'
import { JobColumnKey, type Job } from './schema'

const jobFilterParsers = {
  status: parseAsString,
  categoryCode: parseAsString,
  title: parseAsString,
} as const

export function PageJobsOverview() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null)

  useBreadcrumb([
    { title: t('navigation.kosume.title', 'Quản trị Kosume') },
    { title: t('navigation.kosume.jobs', 'Quản lý tin tuyển dụng') },
  ])

  const deleteMutation = useMutation({
    mutationFn: apiDeleteAdminJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] })
      toast.success('Xóa tin tuyển dụng thành công')
      setJobToDelete(null)
    },
    onError: restApiErrorHandler,
  })

  const handleOpenStatus = useCallback((job: Job) => {
    setSelectedJob(job)
    setIsStatusOpen(true)
  }, [])

  const handleOpenDelete = useCallback((job: Job) => {
    setJobToDelete(job)
  }, [])

  const columns = useMemo(
    () =>
      getJobsTableColumns({
        onStatusChange: handleOpenStatus,
        onDelete: handleOpenDelete,
      }),
    [handleOpenStatus, handleOpenDelete]
  )

  const buildQuery: RestResourceQueryBuilderFn<typeof jobFilterParsers> =
    useCallback((builder, filter) => {
      if (filter.status) {
        builder.filter('status', filter.status)
      }
      if (filter.categoryCode) {
        builder.filter('categoryCode', filter.categoryCode)
      }
      if (filter.title) {
        builder.filter('title', filter.title)
      }
    }, [])

  const { table, isFetching } = useRestResourceTable<
    Job,
    typeof jobFilterParsers
  >({
    columns,
    allowedSorts: [
      JobColumnKey.createdAt,
      JobColumnKey.applicationsCount,
      'deadlineAt',
    ],
    filterParsers: jobFilterParsers,
    queryHook: useDataAdminJobsOverview,
    buildQuery,
    getRowId: (row) => row.id,
    clearOnDefault: true,
  })

  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <PageHeader
        title={
          <div className='flex items-center gap-2'>
            <Briefcase className='text-primary size-6' />
            <span>
              {t('navigation.kosume.jobs', 'Quản lý tin tuyển dụng & Casting')}
            </span>
          </div>
        }
        actions={
          <Button onClick={() => setIsCreateOpen(true)}>
            <PlusIcon className='mr-1.5 size-4' />
            Tạo tin tuyển dụng
          </Button>
        }
      />

      <DataTable table={table} isFetching={isFetching}>
        <DataTableToolbar table={table}>
          <DataTableSortList table={table} align='end' />
        </DataTableToolbar>
      </DataTable>

      <JobStatusDialog
        open={isStatusOpen}
        onOpenChange={setIsStatusOpen}
        job={selectedJob}
      />

      <JobFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      {jobToDelete && (
        <DeleteAlertDialog
          open={!!jobToDelete}
          onOpenChange={(open) => !open && setJobToDelete(null)}
          handleDelete={() => deleteMutation.mutate(jobToDelete.id)}
          isLoading={deleteMutation.isPending}
        />
      )}
    </Main>
  )
}
