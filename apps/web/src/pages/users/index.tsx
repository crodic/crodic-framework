import { useCallback, useMemo } from 'react'
import { PlusIcon } from 'lucide-react'
import { parseAsArrayOf, parseAsInteger, parseAsString } from 'nuqs'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { normalizeDate } from '@/lib/utils'
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
import { useDataUserOverview } from '../users/queries'
import { ColumnKey, type UserSchema } from '../users/schema'
import { getUsersTableColumns } from './columns'
import { UsersTableActionBar } from './users-table-action-bar'

const userFilterParsers = {
  [ColumnKey.email]: parseAsString,
  [ColumnKey.createdAt]: parseAsArrayOf(parseAsInteger, ','),
  [ColumnKey.fullName]: parseAsString,
  [ColumnKey.id]: parseAsString,
  [ColumnKey.status]: parseAsString,
  [ColumnKey.verifiedAt]: parseAsString,
} as const

export function PageUserOverview() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  useBreadcrumb([{ title: t('navigation.management.users', 'Users') }])

  const handleRowClick = useCallback(
    (row: UserSchema) => {
      navigate(`/users/${row.id}/show`)
    },
    [navigate]
  )

  const columns = useMemo(() => getUsersTableColumns(), [])

  const buildQuery: RestResourceQueryBuilderFn<typeof userFilterParsers> =
    useCallback((builder, filter, search) => {
      const createdFrom = normalizeDate(filter.createdAt?.[0])
      const createdTo = normalizeDate(filter.createdAt?.[1])

      builder
        .filter('email', filter.email)
        .filter('fullName', filter.fullName)
        .filter('id', filter.id)

      if (createdFrom && createdTo) {
        builder.filter('createdAt', `${createdFrom},${createdTo}`)
      } else if (createdFrom) {
        builder.filter('createdAt', createdFrom)
      } else if (createdTo) {
        builder.filter('createdAt', createdTo)
      }

      if (filter.verifiedAt) {
        builder.filter('verifiedAt', filter.verifiedAt)
      }

      if (filter.status === 'deleted') {
        builder.filterTrashed('only')
      } else if (filter.status === 'active') {
        builder.filterTrashed('without')
      }

      if (search) {
        builder.filter('search', search)
      }
    }, [])

  const { table, isFetching } = useRestResourceTable<
    UserSchema,
    typeof userFilterParsers
  >({
    columns,
    allowedSorts: [
      ColumnKey.id,
      ColumnKey.email,
      ColumnKey.username,
      ColumnKey.createdAt,
      ColumnKey.updatedAt,
    ],
    filterParsers: userFilterParsers,
    queryHook: useDataUserOverview,
    buildQuery,
    initialState: {
      columnFilters: [{ id: ColumnKey.status, value: 'active' }],
    },
    getRowId: (originalRow) => originalRow.id,
    clearOnDefault: true,
  })

  return (
    <Main className='flex-1'>
      <PageHeader
        title={t('users.overview.title')}
        actions={
          <Button onClick={() => navigate('create')}>
            <PlusIcon className='size-4' aria-hidden='true' />
            {t('buttons.create')}
          </Button>
        }
      />

      <DataTable
        table={table}
        actionBar={<UsersTableActionBar table={table} />}
        onClickRowAction={handleRowClick}
        isFetching={isFetching}
      >
        <DataTableToolbar table={table}>
          <DataTableSortList table={table} align='end' />
        </DataTableToolbar>
      </DataTable>
    </Main>
  )
}
