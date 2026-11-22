import { useCallback, useMemo } from 'react'
import { format } from 'date-fns'
import type { ColumnDef } from '@tanstack/react-table'
import {
  BookMarkedIcon,
  EyeIcon,
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
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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
              <div className='border-border/70 bg-muted/40 relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border shadow-2xs'>
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
              className='gap-1 border-amber-500/30 bg-amber-500/10 text-xs font-medium text-amber-600 dark:text-amber-400'
            >
              <LockIcon className='size-3' aria-hidden='true' />
              <span>{t('tags.encyclopedia.accessLocked', 'Admin Locked')}</span>
            </Badge>
          ) : (
            <Badge
              variant='outline'
              className='gap-1 border-emerald-500/30 bg-emerald-500/10 text-xs font-medium text-emerald-600 dark:text-emerald-400'
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

  const {
    table,
    data = [],
    meta,
    isFetching,
  } = useRestResourceTable<TagEncyclopedia, typeof wikiFilterParsers>({
    columns,
    allowedSorts: ['currentRevision', 'viewCount', 'updatedAt'],
    filterParsers: wikiFilterParsers,
    queryHook: useDataTagEncyclopediaOverview,
    buildQuery,
    getRowId: (row) => row.id,
  })

  const stats = useMemo(() => {
    const totalArticles = meta?.totalItems ?? data.length
    const lockedArticles = data.filter((item) => item.isEditLocked).length
    const openArticles = totalArticles - lockedArticles
    const totalViews = data.reduce(
      (acc, item) => acc + (item.viewCount || 0),
      0
    )
    return { totalArticles, lockedArticles, openArticles, totalViews }
  }, [meta?.totalItems, data])

  return (
    <Main className='flex flex-1 flex-col gap-6'>
      <PageHeader
        title={t('tags.encyclopedia.overviewTitle', 'Tag Encyclopedia (dic)')}
        description={t(
          'tags.encyclopedia.overviewDesc',
          'Curate localized wiki articles, editorial summaries, edit locks, and revision rollbacks.'
        )}
        badges={
          <Badge variant='outline' className='font-mono text-xs'>
            Community Folksonomy Studio
          </Badge>
        }
        actions={
          <Button
            variant='outline'
            onClick={() => navigate('/tags')}
            className='hover:border-primary/50 w-full cursor-pointer gap-2 shadow-2xs sm:w-auto'
          >
            <TagsIcon className='text-primary size-4' aria-hidden='true' />
            <span>{t('navigation.management.tags', 'Tags Governance')}</span>
          </Button>
        }
      />

      {/* KPI Executive Summary Grid */}
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4'>
        {/* Total Articles */}
        <Card className='group border-border/70 bg-card hover:border-primary/40 relative overflow-hidden shadow-xs transition-all hover:shadow-sm'>
          <CardContent className='flex items-center gap-4 p-4 sm:p-5'>
            <div className='bg-primary/10 text-primary border-primary/20 shrink-0 rounded-xl border p-2.5 shadow-2xs'>
              <BookMarkedIcon className='size-5' aria-hidden='true' />
            </div>
            <div className='min-w-0 flex-1 space-y-1'>
              <p className='text-muted-foreground truncate text-xs font-medium'>
                {t('tags.encyclopedia.kpiTotalArticles', 'Total Wiki Articles')}
              </p>
              {isFetching && !data.length ? (
                <Skeleton className='h-7 w-20' />
              ) : (
                <p className='text-foreground font-mono text-2xl font-bold tracking-tight tabular-nums'>
                  {stats.totalArticles.toLocaleString()}
                </p>
              )}
              <p className='text-muted-foreground truncate text-[11px]'>
                {t(
                  'tags.encyclopedia.kpiTotalArticlesDesc',
                  'Localized encyclopedia entries'
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Locked Curated */}
        <Card className='group border-border/70 bg-card relative overflow-hidden shadow-xs transition-all hover:border-amber-500/40 hover:shadow-sm'>
          <CardContent className='flex items-center gap-4 p-4 sm:p-5'>
            <div className='shrink-0 rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5 text-amber-600 shadow-2xs dark:text-amber-400'>
              <LockIcon className='size-5' aria-hidden='true' />
            </div>
            <div className='min-w-0 flex-1 space-y-1'>
              <p className='text-muted-foreground truncate text-xs font-medium'>
                {t('tags.encyclopedia.kpiLockedArticles', 'Admin Curated')}
              </p>
              {isFetching && !data.length ? (
                <Skeleton className='h-7 w-16' />
              ) : (
                <p className='text-foreground font-mono text-2xl font-bold tracking-tight tabular-nums'>
                  {stats.lockedArticles.toLocaleString()}
                </p>
              )}
              <p className='text-muted-foreground truncate text-[11px]'>
                {t(
                  'tags.encyclopedia.kpiLockedArticlesDesc',
                  'Protected against community edits'
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Open Articles */}
        <Card className='group border-border/70 bg-card relative overflow-hidden shadow-xs transition-all hover:border-emerald-500/40 hover:shadow-sm'>
          <CardContent className='flex items-center gap-4 p-4 sm:p-5'>
            <div className='shrink-0 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-emerald-600 shadow-2xs dark:text-emerald-400'>
              <UnlockIcon className='size-5' aria-hidden='true' />
            </div>
            <div className='min-w-0 flex-1 space-y-1'>
              <p className='text-muted-foreground truncate text-xs font-medium'>
                {t('tags.encyclopedia.kpiOpenArticles', 'Community Open')}
              </p>
              {isFetching && !data.length ? (
                <Skeleton className='h-7 w-16' />
              ) : (
                <p className='text-foreground font-mono text-2xl font-bold tracking-tight tabular-nums'>
                  {stats.openArticles.toLocaleString()}
                </p>
              )}
              <p className='text-muted-foreground truncate text-[11px]'>
                {t(
                  'tags.encyclopedia.kpiOpenArticlesDesc',
                  'Open for community contributions'
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Views */}
        <Card className='group border-border/70 bg-card relative overflow-hidden shadow-xs transition-all hover:border-violet-500/40 hover:shadow-sm'>
          <CardContent className='flex items-center gap-4 p-4 sm:p-5'>
            <div className='shrink-0 rounded-xl border border-violet-500/20 bg-violet-500/10 p-2.5 text-violet-600 shadow-2xs dark:text-violet-400'>
              <EyeIcon className='size-5' aria-hidden='true' />
            </div>
            <div className='min-w-0 flex-1 space-y-1'>
              <p className='text-muted-foreground truncate text-xs font-medium'>
                {t('tags.encyclopedia.kpiTotalViews', 'Total Readers')}
              </p>
              {isFetching && !data.length ? (
                <Skeleton className='h-7 w-20' />
              ) : (
                <p className='text-foreground font-mono text-2xl font-bold tracking-tight tabular-nums'>
                  {stats.totalViews.toLocaleString()}
                </p>
              )}
              <p className='text-muted-foreground truncate text-[11px]'>
                {t(
                  'tags.encyclopedia.kpiTotalViewsDesc',
                  'Knowledge page views across locales'
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

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
