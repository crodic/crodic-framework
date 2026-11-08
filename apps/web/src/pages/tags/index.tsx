import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ActivityIcon,
  BadgeCheckIcon,
  BookMarkedIcon,
  FlameIcon,
  LockIcon,
  PlusIcon,
  TagsIcon,
} from 'lucide-react'
import { parseAsString } from 'nuqs'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import {
  useRestResourceTable,
  type RestResourceQueryBuilderFn,
} from '@/hooks/use-rest-resource-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DeleteAlertDialog } from '@/components/common/delete-alert-dialog'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableSortList } from '@/components/data-table/data-table-sort-list'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-shell'
import { getAuditLogsTableColumns, getTagsTableColumns } from './columns'
import { MergeTagDialog } from './components/merge-tag-dialog'
import {
  apiDeleteTag,
  useDataTagAuditLogs,
  useDataTagsOverview,
} from './queries'
import { TagColumnKey, type EntityTagLog, type TagSummary } from './schema'

const tagFilterParsers = {
  name: parseAsString,
  category: parseAsString,
  safetyRating: parseAsString,
  status: parseAsString,
} as const

const auditFilterParsers = {
  action: parseAsString,
  entityType: parseAsString,
  entityId: parseAsString,
  tagNameSnapshot: parseAsString,
} as const

export function PageTagOverview() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState<'directory' | 'audit'>('directory')
  const [tagToDelete, setTagToDelete] = useState<TagSummary | null>(null)
  const [tagToMerge, setTagToMerge] = useState<TagSummary | null>(null)

  useBreadcrumb([{ title: t('navigation.management.tags', 'Tags Governance') }])

  const deleteMutation = useMutation({
    mutationFn: apiDeleteTag,
    onSuccess: () => {
      toast.success(t('tags.messages.deleted', 'Tag deleted successfully'))
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      setTagToDelete(null)
    },
    onError: restApiErrorHandler,
  })

  const columns = useMemo(
    () =>
      getTagsTableColumns({
        t,
        onViewStudio: (row) => navigate(`/tags/${row.id}/show`),
        onEdit: (row) => navigate(`/tags/${row.id}/edit`),
        onMerge: (row) => setTagToMerge(row),
        onDelete: (row) => setTagToDelete(row),
      }),
    [navigate, t]
  )

  const buildQuery: RestResourceQueryBuilderFn<typeof tagFilterParsers> =
    useCallback((builder, filter) => {
      if (filter.name) {
        builder.filter('search', filter.name)
      }
      if (filter.category) {
        builder.filter('category', filter.category)
      }
      if (filter.safetyRating) {
        builder.filter('safetyRating', filter.safetyRating)
      }
      if (filter.status) {
        builder.filter('status', filter.status)
      }
    }, [])

  const {
    table,
    data = [],
    meta,
    isFetching,
  } = useRestResourceTable<TagSummary, typeof tagFilterParsers>({
    columns,
    allowedSorts: [
      TagColumnKey.name,
      TagColumnKey.usageCount,
      TagColumnKey.trendingScore,
      TagColumnKey.updatedAt,
    ],
    filterParsers: tagFilterParsers,
    queryHook: useDataTagsOverview,
    buildQuery,
    getRowId: (row) => row.id,
  })

  const stats = useMemo(() => {
    const totalTags = meta?.totalItems ?? data.length
    const officialCount = data.filter((t) => t.isOfficial).length
    const systemCount = data.filter((t) => t.isSystem).length
    const totalUsage = data.reduce((acc, t) => acc + (t.usageCount || 0), 0)
    return { totalTags, officialCount, systemCount, totalUsage }
  }, [meta?.totalItems, data])

  const auditColumns = useMemo(
    () =>
      getAuditLogsTableColumns({
        t,
        locale: i18n.language,
        onNavigateToTag: (tagId) => navigate(`/tags/${tagId}/show`),
      }),
    [navigate, t, i18n.language]
  )

  const buildAuditQuery: RestResourceQueryBuilderFn<typeof auditFilterParsers> =
    useCallback((builder, filter) => {
      if (filter.action) builder.filter('action', filter.action)
      if (filter.entityType) builder.filter('entityType', filter.entityType)
      if (filter.entityId) builder.filter('entityId', filter.entityId)
      if (filter.tagNameSnapshot)
        builder.filter('tagNameSnapshot', filter.tagNameSnapshot)
    }, [])

  const { table: auditTable, isFetching: isLoadingLogs } = useRestResourceTable<
    EntityTagLog,
    typeof auditFilterParsers
  >({
    columns: auditColumns,
    allowedSorts: ['createdAt', 'action', 'entityType'],
    filterParsers: auditFilterParsers,
    queryHook: useDataTagAuditLogs,
    buildQuery: buildAuditQuery,
    getRowId: (row) => row.id,
    queryKeys: {
      page: 'auditPage',
      perPage: 'auditPerPage',
      sort: 'auditSort',
    },
  })

  return (
    <>
      <DeleteAlertDialog
        open={Boolean(tagToDelete)}
        onOpenChange={(open) => {
          if (!open) setTagToDelete(null)
        }}
        handleDelete={() => {
          if (tagToDelete) deleteMutation.mutate(tagToDelete.id)
        }}
        isLoading={deleteMutation.isPending}
      />

      <MergeTagDialog
        open={Boolean(tagToMerge)}
        onOpenChange={(open) => {
          if (!open) setTagToMerge(null)
        }}
        sourceTag={tagToMerge}
      />

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <PageHeader
          title={t('tags.overview.title', 'Tags Governance')}
          description={t(
            'tags.overview.description',
            'Manage canonical tags, multilingual translations, orthographic aliases, DAG hierarchy, and community moderation.'
          )}
          actions={
            <div className='flex flex-wrap items-center gap-2'>
              <Button
                variant='outline'
                onClick={() => navigate('/tag-encyclopedias')}
              >
                <BookMarkedIcon className='size-4' aria-hidden='true' />
                {t(
                  'navigation.management.tagEncyclopedias',
                  'Tag Encyclopedia'
                )}
              </Button>
              <Button onClick={() => navigate('/tags/create')}>
                <PlusIcon className='size-4' aria-hidden='true' />
                {t('buttons.create', 'Create')}
              </Button>
            </div>
          }
        />

        {/* KPI Executive Summary Strip */}
        <div className='grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'>
          <Card className='border-border/70 hover:border-border shadow-xs transition-colors'>
            <CardContent className='flex items-center gap-3.5 p-4 sm:p-5'>
              <div className='bg-primary/10 text-primary shrink-0 rounded-lg p-2.5'>
                <TagsIcon className='size-5' aria-hidden='true' />
              </div>
              <div className='min-w-0 flex-1 space-y-0.5'>
                <p className='text-muted-foreground truncate text-xs font-medium'>
                  {t('tags.kpi.totalTags', 'Total Canonical Tags')}
                </p>
                {isFetching && !data.length ? (
                  <Skeleton className='h-7 w-20' />
                ) : (
                  <p className='text-foreground font-mono text-xl font-bold tracking-tight tabular-nums sm:text-2xl'>
                    {stats.totalTags.toLocaleString()}
                  </p>
                )}
                <p className='text-muted-foreground truncate text-[11px]'>
                  {t('tags.kpi.totalTagsDesc', 'Taxonomy root & leaf nodes')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className='border-border/70 hover:border-border shadow-xs transition-colors'>
            <CardContent className='flex items-center gap-3.5 p-4 sm:p-5'>
              <div className='shrink-0 rounded-lg bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-400'>
                <BadgeCheckIcon className='size-5' aria-hidden='true' />
              </div>
              <div className='min-w-0 flex-1 space-y-0.5'>
                <p className='text-muted-foreground truncate text-xs font-medium'>
                  {t('tags.kpi.officialTags', 'Official Curated')}
                </p>
                {isFetching && !data.length ? (
                  <Skeleton className='h-7 w-16' />
                ) : (
                  <p className='text-foreground font-mono text-xl font-bold tracking-tight tabular-nums sm:text-2xl'>
                    {stats.officialCount.toLocaleString()}
                  </p>
                )}
                <p className='text-muted-foreground truncate text-[11px]'>
                  {t('tags.kpi.officialDesc', 'Moderator verified tags')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className='border-border/70 hover:border-border shadow-xs transition-colors'>
            <CardContent className='flex items-center gap-3.5 p-4 sm:p-5'>
              <div className='shrink-0 rounded-lg bg-amber-500/10 p-2.5 text-amber-600 dark:text-amber-400'>
                <LockIcon className='size-5' aria-hidden='true' />
              </div>
              <div className='min-w-0 flex-1 space-y-0.5'>
                <p className='text-muted-foreground truncate text-xs font-medium'>
                  {t('tags.kpi.systemProtected', 'System Protected')}
                </p>
                {isFetching && !data.length ? (
                  <Skeleton className='h-7 w-16' />
                ) : (
                  <p className='text-foreground font-mono text-xl font-bold tracking-tight tabular-nums sm:text-2xl'>
                    {stats.systemCount.toLocaleString()}
                  </p>
                )}
                <p className='text-muted-foreground truncate text-[11px]'>
                  {t('tags.kpi.systemDesc', 'Core platform tags')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className='border-border/70 hover:border-border shadow-xs transition-colors'>
            <CardContent className='flex items-center gap-3.5 p-4 sm:p-5'>
              <div className='shrink-0 rounded-lg bg-orange-500/10 p-2.5 text-orange-600 dark:text-orange-400'>
                <FlameIcon className='size-5' aria-hidden='true' />
              </div>
              <div className='min-w-0 flex-1 space-y-0.5'>
                <p className='text-muted-foreground truncate text-xs font-medium'>
                  {t('tags.kpi.totalUsage', 'Taxonomy Usage')}
                </p>
                {isFetching && !data.length ? (
                  <Skeleton className='h-7 w-20' />
                ) : (
                  <p className='text-foreground font-mono text-xl font-bold tracking-tight tabular-nums sm:text-2xl'>
                    {stats.totalUsage.toLocaleString()}
                  </p>
                )}
                <p className='text-muted-foreground truncate text-[11px]'>
                  {t('tags.kpi.usageDesc', 'Total entity assignments')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'directory' | 'audit')}
          className='flex flex-1 flex-col gap-4'
        >
          <TabsList className='w-fit'>
            <TabsTrigger value='directory' className='gap-2'>
              <TagsIcon className='size-4' aria-hidden='true' />
              {t('tags.tabs.directory', 'Tag Directory')}
            </TabsTrigger>
            <TabsTrigger value='audit' className='gap-2'>
              <ActivityIcon className='size-4' aria-hidden='true' />
              {t('tags.tabs.auditLogs', 'Audit & Moderation Logs')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value='directory' className='m-0 flex-1'>
            <DataTable
              table={table}
              isFetching={isFetching}
              onClickRowAction={(row) => navigate(`/tags/${row.id}/show`)}
            >
              <DataTableToolbar table={table}>
                <DataTableSortList table={table} />
              </DataTableToolbar>
            </DataTable>
          </TabsContent>

          <TabsContent value='audit' className='m-0 flex-1'>
            <DataTable
              table={auditTable}
              isFetching={isLoadingLogs}
              onClickRowAction={(row) => {
                if (row.tagId) {
                  navigate(`/tags/${row.tagId}/show`)
                }
              }}
            >
              <DataTableToolbar table={auditTable}>
                <DataTableSortList table={auditTable} />
              </DataTableToolbar>
            </DataTable>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
