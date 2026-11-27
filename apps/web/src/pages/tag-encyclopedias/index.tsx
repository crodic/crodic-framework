import { useCallback, useMemo } from 'react'
import { format } from 'date-fns'
import type { ColumnDef } from '@tanstack/react-table'
import {
  BookMarkedIcon,
  EyeIcon,
  FolderTreeIcon,
  ImageIcon,
  LockIcon,
  TagsIcon,
  UnlockIcon,
} from 'lucide-react'
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
          <DataTableColumnHeader
            column={column}
            label={t(
              'tags.encyclopedia.colTagSummary',
              'Tag & Editorial Summary'
            )}
          />
        ),
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className='flex max-w-xl min-w-0 items-start gap-3 py-1'>
              {/* Featured Image Thumbnail or Category Fallback */}
              <div className='border-border/70 bg-muted/40 relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border'>
                {item.featuredImageUrl ? (
                  <img
                    src={item.featuredImageUrl}
                    alt={item.tag.name}
                    className='size-full object-cover'
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <ImageIcon
                    className='text-muted-foreground/40 size-5'
                    aria-hidden='true'
                  />
                )}
              </div>

              <div className='min-w-0 flex-1 space-y-1'>
                <div className='flex flex-wrap items-center gap-2'>
                  <span className='text-foreground font-semibold tracking-tight'>
                    <span className='text-primary mr-0.5 font-bold opacity-80'>
                      #
                    </span>
                    {item.tag.name}
                  </span>
                  <TagCategoryBadge
                    category={item.tag.category}
                    className='py-0 text-[10px]'
                  />
                </div>
                <p className='text-muted-foreground line-clamp-2 text-xs leading-relaxed'>
                  {item.summary || (
                    <span className='italic opacity-60'>
                      {t('tags.show.noSummary', 'No hover summary provided.')}
                    </span>
                  )}
                </p>
              </div>
            </div>
          )
        },
        enableColumnFilter: true,
        enableSorting: false,
        meta: {
          label: t('tags.table.name', 'Canonical Tag'),
          placeholder: t(
            'tags.encyclopedia.searchPlaceholder',
            'Search wiki summary or tag...'
          ),
          variant: 'text',
        },
      },
      {
        id: 'locale',
        accessorFn: (row) => row.locale,
        header: () => (
          <span className='text-xs font-medium'>
            {t('tags.encyclopedia.colEdition', 'Edition')}
          </span>
        ),
        cell: ({ row }) => {
          const loc = row.original.locale
          const label =
            loc === 'en'
              ? 'English'
              : loc === 'vi'
                ? 'Tiếng Việt'
                : loc === 'jp'
                  ? '日本語'
                  : loc
          return (
            <Badge
              variant='outline'
              className='bg-muted/40 font-mono text-[11px] font-semibold uppercase'
            >
              {loc} • {label}
            </Badge>
          )
        },
        enableColumnFilter: true,
        enableSorting: false,
        meta: {
          label: t('tags.encyclopedia.colEdition', 'Edition'),
          variant: 'select',
          options: [
            { label: 'English', value: 'en' },
            { label: 'Tiếng Việt', value: 'vi' },
            { label: '日本語', value: 'jp' },
          ],
        },
      },
      {
        id: 'currentRevision',
        accessorFn: (row) => row.currentRevision,
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            label={t('tags.encyclopedia.colRevision', 'Revision')}
          />
        ),
        cell: ({ row }) => (
          <Badge
            variant='secondary'
            className='font-mono text-xs font-semibold tabular-nums'
          >
            v{row.original.currentRevision}
          </Badge>
        ),
      },
      {
        id: 'isEditLocked',
        accessorFn: (row) => String(row.isEditLocked),
        header: () => (
          <span className='text-xs font-medium'>
            {t('tags.encyclopedia.colEditAccess', 'Edit Access')}
          </span>
        ),
        cell: ({ row }) =>
          row.original.isEditLocked ? (
            <Badge
              variant='outline'
              className='border-primary/30 bg-primary/10 text-primary dark:text-primary gap-1 text-xs font-medium'
            >
              <LockIcon className='size-3' aria-hidden='true' />
              <span>{t('tags.encyclopedia.accessLocked', 'Admin Locked')}</span>
            </Badge>
          ) : (
            <Badge
              variant='outline'
              className='border-primary/30 bg-primary/10 text-primary dark:text-primary gap-1 text-xs font-medium'
            >
              <UnlockIcon className='size-3' aria-hidden='true' />
              <span>{t('tags.encyclopedia.accessOpen', 'Community Open')}</span>
            </Badge>
          ),
        enableColumnFilter: true,
        enableSorting: false,
        meta: {
          label: t('tags.encyclopedia.colEditAccess', 'Edit Access'),
          variant: 'select',
          options: [
            {
              label: t('tags.encyclopedia.accessOpen', 'Community Open'),
              value: 'false',
            },
            {
              label: t('tags.encyclopedia.accessLocked', 'Admin Locked'),
              value: 'true',
            },
          ],
        },
      },
      {
        id: 'viewCount',
        accessorFn: (row) => row.viewCount,
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            label={t('tags.encyclopedia.colViews', 'Views')}
          />
        ),
        cell: ({ row }) => (
          <div className='inline-flex items-center gap-1.5 font-mono text-xs tabular-nums'>
            <EyeIcon
              className='text-muted-foreground size-3.5'
              aria-hidden='true'
            />
            <span className='text-foreground font-semibold'>
              {row.original.viewCount.toLocaleString()}
            </span>
          </div>
        ),
      },
      {
        id: 'updatedAt',
        accessorFn: (row) => row.updatedAt,
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            label={t('tags.encyclopedia.colUpdatedAt', 'Updated At')}
          />
        ),
        cell: ({ row }) => (
          <span className='text-muted-foreground text-xs whitespace-nowrap tabular-nums'>
            {format(new Date(row.original.updatedAt), 'dd/MM/yyyy HH:mm')}
          </span>
        ),
      },
    ],
    [t]
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

  const { table, meta, isFetching } = useRestResourceTable<
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
    <Main className='flex-1'>
      <PageHeader
        title={t('tags.encyclopedia.overviewTitle', 'Tag Encyclopedia (dic)')}
        description={t(
          'tags.encyclopedia.overviewDesc',
          'Curate localized wiki articles, editorial summaries, edit locks, and revision rollbacks.'
        )}
        badges={
          meta?.totalItems !== undefined ? (
            <Badge
              variant='secondary'
              className='font-mono text-xs tabular-nums'
            >
              {meta.totalItems.toLocaleString()}{' '}
              {t('tags.encyclopedia.articlesUnit', 'entries')}
            </Badge>
          ) : undefined
        }
        actions={
          <div className='flex flex-wrap items-center gap-2'>
            <Button
              variant='outline'
              onClick={() => navigate('/tags')}
              className='cursor-pointer gap-2'
            >
              <TagsIcon className='size-4' aria-hidden='true' />
              <span>{t('navigation.management.tags', 'Tags Governance')}</span>
            </Button>
            <Button
              variant='outline'
              onClick={() => navigate('/tag-categories')}
              className='cursor-pointer gap-2'
            >
              <FolderTreeIcon className='size-4' aria-hidden='true' />
              <span>
                {t('navigation.management.tagCategories', 'Tag Categories')}
              </span>
            </Button>
          </div>
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
