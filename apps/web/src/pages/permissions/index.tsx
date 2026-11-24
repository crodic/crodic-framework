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
import { getPermissionsTableColumns } from './columns'
import { useDataPermissionOverview } from './queries'
import { ColumnKey, type PermissionSchema } from './schema'

const permissionFilterParsers = {
  name: parseAsString,
  group: parseAsString,
} as const

export function PagePermissionOverview() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  useBreadcrumb([
    { title: t('navigation.management.permissions', 'Permissions') },
  ])
  const columns = useMemo(() => getPermissionsTableColumns(), [])

  const buildQuery: RestResourceQueryBuilderFn<typeof permissionFilterParsers> =
    useCallback((builder, filter, search) => {
      builder.filter('name', filter.name).filter('group', filter.group)
      if (search) {
        builder.filter('search', search)
      }
    }, [])

  const { table, isFetching } = useRestResourceTable<
    PermissionSchema,
    typeof permissionFilterParsers
  >({
    columns,
    allowedSorts: [ColumnKey.name, ColumnKey.group, ColumnKey.updatedAt],
    filterParsers: permissionFilterParsers,
    queryHook: useDataPermissionOverview,
    buildQuery,
    initialColumnPinning: { right: ['actions'] },
    getRowId: (row) => row.id,
  })

  const handleRowClick = useCallback(
    (permission: PermissionSchema) => {
      navigate(`/permissions/${permission.id}/show`)
    },
    [navigate]
  )

  return (
    <>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <PageHeader
          title='Permissions'
          description='Review permission keys and maintain display metadata.'
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
