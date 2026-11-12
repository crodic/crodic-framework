import { useCallback, useMemo } from 'react'
import { PlusIcon } from 'lucide-react'
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryState,
} from 'nuqs'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { normalizeDate } from '@/lib/utils'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import {
  useResourceTable,
  type ResourceQueryBuilderFn,
} from '@/hooks/use-resource-table'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  trashed: parseAsString.withDefault('active'),
} as const

export function PageUserOverview() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [trashed, setTrashed] = useQueryState(
    'trashed',
    parseAsString.withDefault('active')
  )

  useBreadcrumb([{ title: t('navigation.management.users', 'Users') }])

  const handleRowClick = useCallback(
    (row: UserSchema) => {
      navigate(`/users/${row.id}/show`)
    },
    [navigate]
  )

  const columns = useMemo(() => getUsersTableColumns(), [])

  const buildQuery: ResourceQueryBuilderFn<typeof userFilterParsers> =
    useCallback((builder, filter) => {
      const createdFrom = normalizeDate(filter.createdAt?.[0])
      const createdTo = normalizeDate(filter.createdAt?.[1])
      builder
        .btw('createdAt', createdFrom, createdTo)
        .ilike('email', filter.email)
        .ilike('fullName', filter.fullName)
        .eq('id', filter.id)

      if (filter.trashed === 'trashed') {
        builder.eq('trashed', 'only')
      }
    }, [])

  const { table, isFetching } = useResourceTable<
    UserSchema,
    typeof userFilterParsers
  >({
    columns,
    allowedSorts: [ColumnKey.createdAt],
    filterParsers: userFilterParsers,
    queryHook: useDataUserOverview,
    buildQuery,
    getRowId: (originalRow) => originalRow.id,
    clearOnDefault: true,
  })

  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <PageHeader
        title={t('users.overview.title')}
        actions={
          <Button onClick={() => navigate('create')}>
            <PlusIcon className='size-4' aria-hidden='true' />
            {t('buttons.create')}
          </Button>
        }
      />

      <div className='flex items-center justify-between'>
        <Tabs
          value={trashed}
          onValueChange={(val) => setTrashed(val)}
          className='w-auto'
        >
          <TabsList className='bg-muted/60 h-9 p-1'>
            <TabsTrigger value='active' className='px-3 text-xs'>
              {t('common.status.active', 'Active')}
            </TabsTrigger>
            <TabsTrigger value='trashed' className='px-3 text-xs'>
              {t('common.status.trashed', 'Deleted')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

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
