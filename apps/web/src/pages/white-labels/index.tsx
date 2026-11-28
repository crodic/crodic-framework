import { useCallback, useMemo } from 'react'
import { PlusIcon } from 'lucide-react'
import { parseAsString } from 'nuqs'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { useAuthStore } from '@/stores/auth-store'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import {
  useRestResourceTable,
  type RestResourceQueryBuilderFn,
} from '@/hooks/use-rest-resource-table'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableSortList } from '@/components/data-table/data-table-sort-list'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-shell'
import { columns as defaultColumns } from './columns'
import { useDataWhiteLabelOverview } from './queries'
import { ColumnKey, type WhiteLabelSchema } from './schema'

const whiteLabelFilterParsers = {
  name: parseAsString,
  slug: parseAsString,
  target: parseAsString,
  isActive: parseAsString,
} as const

export function PageWhiteLabelOverview() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  useBreadcrumb([
    { title: t('navigation.management.whiteLabels', 'White Labels') },
  ])
  const ability = useAuthStore((state) => state.ability)

  const columns = useMemo(() => defaultColumns, [])

  const buildQuery: RestResourceQueryBuilderFn<typeof whiteLabelFilterParsers> =
    useCallback((builder, filter) => {
      let isActiveValue: boolean | undefined
      if (typeof filter.isActive === 'boolean') {
        isActiveValue = filter.isActive
      } else if (filter.isActive === 'true') {
        isActiveValue = true
      } else if (filter.isActive === 'false') {
        isActiveValue = false
      }

      builder
        .filter('name', filter.name)
        .filter('slug', filter.slug)
        .filter('target', filter.target)
        .filter('isActive', isActiveValue)
    }, [])

  const { table, isFetching } = useRestResourceTable<
    WhiteLabelSchema,
    typeof whiteLabelFilterParsers
  >({
    allowedSorts: [
      ColumnKey.name,
      ColumnKey.target,
      ColumnKey.isActive,
      ColumnKey.updatedAt,
    ],
    filterParsers: whiteLabelFilterParsers,
    queryHook: useDataWhiteLabelOverview,
    buildQuery,
    columns,
    initialColumnPinning: { right: ['actions'] },
    getRowId: (row) => row.id,
  })

  return (
    <>
      <Main className='flex flex-1 flex-col'>
        <PageHeader
          title={t('whiteLabels.overview.title')}
          description={t('whiteLabels.overview.description')}
          actions={
            ability.can('create', 'WHITE_LABEL') ? (
              <Button onClick={() => navigate('/white-labels/create')}>
                <PlusIcon className='size-4' aria-hidden='true' />
                {t('whiteLabels.actions.create')}
              </Button>
            ) : undefined
          }
        />

        <DataTable
          table={table}
          onClickRowAction={(row) => navigate(`/white-labels/${row.id}/show`)}
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
