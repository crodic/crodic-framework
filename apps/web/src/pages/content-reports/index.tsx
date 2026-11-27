import { useCallback, useMemo } from 'react'
import { ShieldAlert } from 'lucide-react'
import { parseAsString } from 'nuqs'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import {
  useRestResourceTable,
  type RestResourceQueryBuilderFn,
} from '@/hooks/use-rest-resource-table'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableSortList } from '@/components/data-table/data-table-sort-list'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-shell'
import { getContentReportsTableColumns } from './columns'
import { useDataContentReportsOverview } from './queries'
import { ReportColumnKey, type ContentReport } from './schema'

const reportFilterParsers = {
  status: parseAsString,
  targetType: parseAsString,
  reason: parseAsString,
} as const

export function PageContentReportsOverview() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  useBreadcrumb([
    { title: t('navigation.kosume.title', 'Quản trị Kosume') },
    { title: t('navigation.kosume.reports', 'Duyệt bài vi phạm') },
  ])

  const handleOpenResolve = useCallback(
    (report: ContentReport) => {
      navigate(`/content-reports/${report.id}/show`)
    },
    [navigate]
  )

  const columns = useMemo(
    () => getContentReportsTableColumns({ onResolve: handleOpenResolve }),
    [handleOpenResolve]
  )

  const buildQuery: RestResourceQueryBuilderFn<typeof reportFilterParsers> =
    useCallback((builder, filter) => {
      if (filter.status) {
        builder.filter('status', filter.status)
      }
      if (filter.targetType) {
        builder.filter('targetType', filter.targetType)
      }
      if (filter.reason) {
        builder.filter('reason', filter.reason)
      }
    }, [])

  const { table, isFetching } = useRestResourceTable<
    ContentReport,
    typeof reportFilterParsers
  >({
    columns,
    allowedSorts: [ReportColumnKey.createdAt, 'updatedAt'],
    filterParsers: reportFilterParsers,
    queryHook: useDataContentReportsOverview,
    buildQuery,
    getRowId: (row) => row.id,
    clearOnDefault: true,
  })

  return (
    <Main className='flex-1'>
      <PageHeader
        title={
          <div className='flex items-center gap-2'>
            <ShieldAlert className='text-primary size-6' />
            <span>
              {t('navigation.kosume.reports', 'Duyệt bài vi phạm & Kiểm duyệt')}
            </span>
          </div>
        }
      />

      <DataTable table={table} isFetching={isFetching}>
        <DataTableToolbar table={table}>
          <DataTableSortList table={table} align='end' />
        </DataTableToolbar>
      </DataTable>
    </Main>
  )
}
