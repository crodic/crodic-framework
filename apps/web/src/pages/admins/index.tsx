import { useCallback, useMemo } from 'react'
import { PlusIcon } from 'lucide-react'
import { parseAsArrayOf, parseAsString } from 'nuqs'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
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
import { useDataRoleFormOptions } from '../roles/queries'
import { getAdminsTableColumns } from './columns'
import { useDataAdminOverview } from './queries'
import { type AdminSchema, ColumnKey } from './schema'

const adminsFilterParsers = {
  email: parseAsString,
  fullName: parseAsString,
  role: parseAsArrayOf(parseAsString, ','),
  status: parseAsString,
} as const

export function PageAdminOverview() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  useBreadcrumb([{ title: t('navigation.management.admins', 'Admins') }])
  const { data: rolesData } = useDataRoleFormOptions()

  const columns = useMemo(
    () => getAdminsTableColumns({ roles: rolesData }),
    [rolesData]
  )

  const buildQuery: RestResourceQueryBuilderFn<typeof adminsFilterParsers> =
    useCallback((builder, filter, search) => {
      builder
        .filter('email', filter.email)
        .filter('fullName', filter.fullName)
        .filter('roles.id', filter.role || [])

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
    AdminSchema,
    typeof adminsFilterParsers
  >({
    columns,
    allowedSorts: [
      ColumnKey.id,
      ColumnKey.email,
      ColumnKey.fullName,
      ColumnKey.createdAt,
    ],
    filterParsers: adminsFilterParsers,
    queryHook: useDataAdminOverview,
    buildQuery,
    initialState: {
      columnFilters: [{ id: 'status', value: 'active' }],
    },
    getRowId: (row) => row.id,
  })

  const handleRowClick = useCallback(
    (admin: AdminSchema) => {
      navigate(`/admins/${admin.id}/show`)
    },
    [navigate]
  )

  return (
    <Main className='flex-1'>
      <PageHeader
        title={t('adminUsers.overview.title')}
        description={t('adminUsers.overview.description')}
        actions={
          <Button onClick={() => navigate('create')}>
            <PlusIcon className='size-4' aria-hidden='true' />
            {t('buttons.create')}
          </Button>
        }
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
  )
}
