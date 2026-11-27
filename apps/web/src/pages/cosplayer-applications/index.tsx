import { useCallback, useMemo } from 'react'
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
import { getCosplayerApplicationsColumns } from './columns'
import { useDataCosplayerApplications } from './queries'
import type { CosplayerApplicationSchema } from './schema'

const applicationFilterParsers = {
  stageName: parseAsString,
  status: parseAsString,
} as const

export function PageCosplayerApplicationsOverview() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  useBreadcrumb([
    { title: t('navigation.kosume.title', 'Kosume') },
    {
      title: t(
        'navigation.kosume.cosplayerApplications',
        'Duyệt đơn Cosplayer'
      ),
    },
  ])

  const handleReview = useCallback(
    (application: CosplayerApplicationSchema) => {
      navigate(`/cosplayer-applications/${application.id}/show`)
    },
    [navigate]
  )

  const columns = useMemo(
    () => getCosplayerApplicationsColumns({ onReview: handleReview }),
    [handleReview]
  )

  const buildQuery: RestResourceQueryBuilderFn<
    typeof applicationFilterParsers
  > = useCallback((builder, filter) => {
    builder
      .filter('stageName', filter.stageName)
      .filter('status', filter.status)
  }, [])

  const { table, isFetching } = useRestResourceTable<
    CosplayerApplicationSchema,
    typeof applicationFilterParsers
  >({
    columns,
    allowedSorts: ['id', 'stageName', 'createdAt', 'status'],
    filterParsers: applicationFilterParsers,
    queryHook: useDataCosplayerApplications,
    buildQuery,
    getRowId: (originalRow) => originalRow.id,
    clearOnDefault: true,
  })

  return (
    <Main className='flex-1'>
      <PageHeader
        title={t(
          'navigation.kosume.cosplayerApplications',
          'Duyệt đơn Cosplayer'
        )}
      />

      <DataTable
        table={table}
        onClickRowAction={handleReview}
        isFetching={isFetching}
      >
        <DataTableToolbar table={table}>
          <DataTableSortList table={table} align='end' />
        </DataTableToolbar>
      </DataTable>
    </Main>
  )
}
