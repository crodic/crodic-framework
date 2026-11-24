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
import { getEmailTableColumns } from './columns'
import { useDataEmailLogs } from './queries'
import { ColumnKey, type EmailLogSchema } from './schema'

const emailLogFilterParsers = {
  subject: parseAsString.withDefault(''),
  to: parseAsString,
  status: parseAsArrayOf(parseAsString, ',').withDefault([]),
  source: parseAsArrayOf(parseAsString, ',').withDefault([]),
} as const

export function PageEmailLogOverview() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  useBreadcrumb([{ title: t('navigation.general.emailLogs', 'Email Logs') }])
  const columns = useMemo(() => getEmailTableColumns(), [])

  const buildQuery: RestResourceQueryBuilderFn<typeof emailLogFilterParsers> =
    useCallback((builder, filter, search) => {
      builder
        .filter('subject', filter.subject)
        .filter('to', filter.to)
        .filter('status', filter.status || [])
        .filter('source', filter.source || [])

      if (search) {
        builder.filter('search', search)
      }
    }, [])

  const { table, isFetching } = useRestResourceTable<
    EmailLogSchema,
    typeof emailLogFilterParsers
  >({
    columns,
    allowedSorts: [
      ColumnKey.createdAt,
      ColumnKey.scheduledAt,
      ColumnKey.sentAt,
      ColumnKey.status,
    ],
    filterParsers: emailLogFilterParsers,
    queryHook: useDataEmailLogs,
    buildQuery,
    initialState: {
      sorting: [{ id: ColumnKey.createdAt, desc: true }],
    },
    getRowId: (row) => row.id,
  })

  return (
    <>
      <Main fluid className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <PageHeader
          title='Email Logs'
          description='Audit email delivery, schedules, and failures.'
        />
        <DataTable
          table={table}
          onClickRowAction={(email) => navigate(`/email-logs/${email.id}/show`)}
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
