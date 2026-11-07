import { useCallback, useMemo, useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ActivityIcon,
  BadgeCheckIcon,
  BookMarkedIcon,
  FlameIcon,
  LockIcon,
  PlusIcon,
  ShieldCheckIcon,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DeleteAlertDialog } from '@/components/common/delete-alert-dialog'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableSortList } from '@/components/data-table/data-table-sort-list'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-shell'
import { getTagsTableColumns } from './columns'
import { MergeTagDialog } from './components/merge-tag-dialog'
import { AuditActionBadge } from './components/tag-badges'
import {
  apiDeleteTag,
  useDataTagAuditLogs,
  useDataTagsOverview,
} from './queries'
import { TagColumnKey, type TagSummary } from './schema'

const tagFilterParsers = {
  name: parseAsString,
  category: parseAsString,
  safetyRating: parseAsString,
  status: parseAsString,
} as const

export function PageTagOverview() {
  const { t } = useTranslation()
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

  const { data: auditLogs = [], isFetching: isLoadingLogs } =
    useDataTagAuditLogs(60, activeTab === 'audit')

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
            <Card className='shadow-xs'>
              <CardHeader className='border-b px-5 py-4'>
                <CardTitle className='flex items-center gap-2 text-base font-semibold'>
                  <ActivityIcon
                    className='text-primary size-4'
                    aria-hidden='true'
                  />
                  {t(
                    'tags.audit.title',
                    'Recent Folksonomy & Governance Audit Trail'
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className='p-0'>
                {isLoadingLogs ? (
                  <div className='space-y-2 p-5'>
                    <Skeleton className='h-9 w-full' />
                    <Skeleton className='h-9 w-full' />
                    <Skeleton className='h-9 w-full' />
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className='flex flex-col items-center justify-center p-12 text-center'>
                    <div className='bg-muted text-muted-foreground mb-3 rounded-full p-3'>
                      <ActivityIcon className='size-6' aria-hidden='true' />
                    </div>
                    <p className='text-foreground mb-1 text-sm font-semibold'>
                      {t('tags.audit.emptyTitle', 'No Audit Logs Recorded')}
                    </p>
                    <p className='text-muted-foreground max-w-sm text-xs'>
                      {t(
                        'tags.audit.empty',
                        'No tag governance or community tagging actions recorded yet.'
                      )}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          {t('tags.audit.action', 'Action')}
                        </TableHead>
                        <TableHead>
                          {t('tags.audit.tagSnapshot', 'Tag Snapshot')}
                        </TableHead>
                        <TableHead>
                          {t('tags.audit.targetEntity', 'Target Entity')}
                        </TableHead>
                        <TableHead>{t('tags.audit.actor', 'Actor')}</TableHead>
                        <TableHead className='text-right'>
                          {t('tags.audit.timestamp', 'Timestamp')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log) => {
                        const logDate = new Date(log.createdAt)
                        return (
                          <TableRow
                            key={log.id}
                            className='hover:bg-muted/40 transition-colors'
                          >
                            <TableCell>
                              <AuditActionBadge action={log.action} />
                            </TableCell>
                            <TableCell className='font-medium'>
                              {log.tagNameSnapshot ? (
                                <button
                                  type='button'
                                  disabled={!log.tagId}
                                  onClick={() => {
                                    if (log.tagId) {
                                      navigate(`/tags/${log.tagId}/show`)
                                    }
                                  }}
                                  className='hover:text-primary font-mono text-xs font-medium hover:underline disabled:no-underline'
                                >
                                  #{log.tagNameSnapshot}
                                </button>
                              ) : (
                                <span className='text-muted-foreground text-xs italic'>
                                  Entity Config
                                </span>
                              )}
                            </TableCell>
                            <TableCell className='text-muted-foreground font-mono text-xs'>
                              <span className='text-foreground font-medium'>
                                {log.entityType}
                              </span>{' '}
                              #{log.entityId}
                            </TableCell>
                            <TableCell>
                              <div className='inline-flex items-center gap-1.5 text-xs'>
                                {log.isAdminAction && (
                                  <ShieldCheckIcon
                                    className='text-primary size-3.5 shrink-0'
                                    aria-hidden='true'
                                  />
                                )}
                                <span className='text-foreground/90 font-medium'>
                                  {log.actorName ||
                                    (log.isAdminAction
                                      ? 'Administrator'
                                      : 'Community User')}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className='text-right text-xs'>
                              <div className='flex flex-col items-end gap-0.5 tabular-nums'>
                                <span className='text-foreground/90 font-medium'>
                                  {formatDistanceToNow(logDate, {
                                    addSuffix: true,
                                  })}
                                </span>
                                <span className='text-muted-foreground text-[11px]'>
                                  {format(logDate, 'dd/MM/yyyy HH:mm:ss')}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
