import { useCallback, useMemo } from 'react'
import { parseAsArrayOf, parseAsString } from 'nuqs'
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
import { getActivitiesTableColumns } from './columns'
import { useDataLogOverview } from './queries'
import { activityLogActions, type ActivityLogSchema, ColumnKey } from './schema'

const activitiesFilterParsers = {
  entityId: parseAsString.withDefault(''),
  entity: parseAsString.withDefault(''),
  description: parseAsString.withDefault(''),
  action: parseAsArrayOf(parseAsString, ',').withDefault([]),
  userId: parseAsString.withDefault(''),
} as const

export function PageActivityLogOverview() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  useBreadcrumb([
    { title: t('navigation.general.activityLogs', 'Activity Logs') },
  ])

  const columns = useMemo(
    () =>
      getActivitiesTableColumns({
        actions: activityLogActions,
      }),
    []
  )

  const buildQuery: RestResourceQueryBuilderFn<typeof activitiesFilterParsers> =
    useCallback((builder, filter, search) => {
      builder
        .filter('subjectId', filter.entityId)
        .filter('subjectType', filter.entity)
        .filter('description', filter.description)
        .filter('causerId', filter.userId)
        .filter('event', filter.action || [])

      if (search) {
        builder.filter('search', search)
      }
    }, [])

  const { table, isFetching } = useRestResourceTable<
    ActivityLogSchema,
    typeof activitiesFilterParsers
  >({
    columns,
    allowedSorts: [ColumnKey.entityId, ColumnKey.timestamp],
    filterParsers: activitiesFilterParsers,
    queryHook: useDataLogOverview,
    buildQuery,
    initialColumnPinning: { right: ['actions'] },
    getRowId: (row) => row.id,
  })

  const handleRowClick = useCallback(
    (log: ActivityLogSchema) => {
      navigate(`/logs/${log.id}/show`)
    },
    [navigate]
  )

  return (
    <>
      <Main fluid className='flex flex-1 flex-col'>
        <PageHeader
          title={t('activityLogs.overview.title')}
          description={t('activityLogs.overview.description')}
        />
        <DataTable
          table={table}
          onClickRowAction={handleRowClick}
          isFetching={isFetching}
        >
          <DataTableToolbar table={table}>
            <DataTableSortList table={table} />
          </DataTableToolbar>
        </DataTable>
      </Main>
    </>
  )
}
