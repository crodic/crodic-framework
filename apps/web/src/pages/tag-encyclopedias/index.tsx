import { useCallback, useMemo } from 'react'
import { format } from 'date-fns'
import type { ColumnDef } from '@tanstack/react-table'
import { BookMarkedIcon, LockIcon, TagsIcon } from 'lucide-react'
import { parseAsString } from 'nuqs'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import {
  useRestResourceTable,
  type RestResourceQueryBuilderFn,
} from '@/hooks/use-rest-resource-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { DataTableSortList } from '@/components/data-table/data-table-sort-list'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-shell'
import { TagCategoryBadge } from '@/pages/tags/components/tag-badges'
import { useDataTagEncyclopediaOverview } from '@/pages/tags/queries'
import type { TagEncyclopedia } from '@/pages/tags/schema'

const wikiFilterParsers = {
  search: parseAsString,
  locale: parseAsString,
  isEditLocked: parseAsString,
} as const

export function PageTagEncyclopediaOverview() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  useBreadcrumb([
    {
      title: t('navigation.management.tagEncyclopedias', 'Tag Encyclopedia'),
    },
  ])

  const columns = useMemo<ColumnDef<TagEncyclopedia>[]>(
    () => [
      {
        id: 'search',
        accessorFn: (row) => row.tag.name,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label='Tag & Summary' />
        ),
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className='flex max-w-xl min-w-0 flex-col gap-1 py-0.5'>
              <div className='flex items-center gap-2'>
                <span className='truncate font-semibold'>#{item.tag.name}</span>
                <TagCategoryBadge category={item.tag.category} />
              </div>
              <p className='text-muted-foreground line-clamp-1 text-xs'>
                {item.summary}
              </p>
            </div>
          )
        },
        enableColumnFilter: true,
        enableSorting: false,
        meta: {
          label: 'Keyword',
          placeholder: 'Search wiki summary or tag...',
          variant: 'text',
        },
      },
      {
        id: 'locale',
        accessorFn: (row) => row.locale,
        header: () => <span className='text-xs font-medium'>Edition</span>,
        cell: ({ row }) => (
          <Badge variant='outline' className='font-mono text-xs uppercase'>
            {row.original.locale}
          </Badge>
        ),
        enableColumnFilter: true,
        enableSorting: false,
        meta: {
          label: 'Edition',
          variant: 'select',
          options: [
            { label: 'English (EN)', value: 'en' },
            { label: 'Tiếng Việt (VI)', value: 'vi' },
            { label: '日本語 (JP)', value: 'jp' },
          ],
        },
      },
      {
        id: 'currentRevision',
        accessorFn: (row) => row.currentRevision,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label='Revision' />
        ),
        cell: ({ row }) => (
          <Badge variant='secondary' className='font-mono text-xs tabular-nums'>
            v{row.original.currentRevision}
          </Badge>
        ),
      },
      {
        id: 'isEditLocked',
        accessorFn: (row) => String(row.isEditLocked),
        header: () => <span className='text-xs font-medium'>Edit Access</span>,
        cell: ({ row }) =>
          row.original.isEditLocked ? (
            <Badge variant='outline' className='gap-1 text-xs'>
              <LockIcon className='size-3' aria-hidden='true' />
              Admin Locked
            </Badge>
          ) : (
            <Badge variant='secondary' className='text-xs'>
              Community Open
            </Badge>
          ),
        enableColumnFilter: true,
        enableSorting: false,
        meta: {
          label: 'Edit Access',
          variant: 'select',
          options: [
            { label: 'Community Open', value: 'false' },
            { label: 'Admin Locked', value: 'true' },
          ],
        },
      },
      {
        id: 'viewCount',
        accessorFn: (row) => row.viewCount,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label='Views' />
        ),
        cell: ({ row }) => (
          <span className='font-mono text-xs tabular-nums'>
            {row.original.viewCount.toLocaleString()}
          </span>
        ),
      },
      {
        id: 'updatedAt',
        accessorFn: (row) => row.updatedAt,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label='Updated At' />
        ),
        cell: ({ row }) => (
          <span className='text-muted-foreground text-xs whitespace-nowrap tabular-nums'>
            {format(new Date(row.original.updatedAt), 'dd/MM/yyyy HH:mm')}
          </span>
        ),
      },
    ],
    []
  )

  const buildQuery: RestResourceQueryBuilderFn<typeof wikiFilterParsers> =
    useCallback((builder, filter) => {
      if (filter.search) {
        builder.filter('search', filter.search)
      }
      if (filter.locale) {
        builder.filter('locale', filter.locale)
      }
      if (filter.isEditLocked) {
        builder.filter('isEditLocked', filter.isEditLocked)
      }
    }, [])

  const { table, isFetching } = useRestResourceTable<
    TagEncyclopedia,
    typeof wikiFilterParsers
  >({
    columns,
    allowedSorts: ['currentRevision', 'viewCount', 'updatedAt'],
    filterParsers: wikiFilterParsers,
    queryHook: useDataTagEncyclopediaOverview,
    buildQuery,
    getRowId: (row) => row.id,
  })

  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <PageHeader
        title={t('tags.encyclopedia.overviewTitle', 'Tag Encyclopedia (dic)')}
        description={t(
          'tags.encyclopedia.overviewDesc',
          'Curate localized wiki articles, editorial summaries, edit locks, and revision rollbacks.'
        )}
        actions={
          <Button variant='outline' onClick={() => navigate('/tags')}>
            <TagsIcon className='size-4' aria-hidden='true' />
            {t('navigation.management.tags', 'Tags Governance')}
          </Button>
        }
      />

      <DataTable
        table={table}
        isFetching={isFetching}
        onClickRowAction={(row) => {
          const item = row
          navigate(
            `/tags/${item.tagId}/show?tab=encyclopedia&locale=${item.locale}`
          )
        }}
      >
        <DataTableToolbar table={table}>
          <div className='flex items-center gap-2'>
            <BookMarkedIcon
              className='text-muted-foreground size-4'
              aria-hidden='true'
            />
            <DataTableSortList table={table} />
          </div>
        </DataTableToolbar>
      </DataTable>
    </Main>
  )
}
