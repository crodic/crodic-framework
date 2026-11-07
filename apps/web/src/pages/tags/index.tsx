import { useCallback, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ActivityIcon,
  BookMarkedIcon,
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
import { Badge } from '@/components/ui/badge'
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

  const { table, isFetching } = useRestResourceTable<
    TagSummary,
    typeof tagFilterParsers
  >({
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
                  <div className='text-muted-foreground p-10 text-center text-sm'>
                    {t(
                      'tags.audit.empty',
                      'No tag governance or community tagging actions recorded yet.'
                    )}
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
                      {auditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <Badge
                              variant='outline'
                              className='font-mono text-[11px] uppercase'
                            >
                              {log.action}
                            </Badge>
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
                                className='hover:underline disabled:no-underline'
                              >
                                #{log.tagNameSnapshot}
                              </button>
                            ) : (
                              <span className='text-muted-foreground text-xs'>
                                Entity Config
                              </span>
                            )}
                          </TableCell>
                          <TableCell className='font-mono text-xs'>
                            {log.entityType} #{log.entityId}
                          </TableCell>
                          <TableCell>
                            <div className='inline-flex items-center gap-1.5 text-xs'>
                              {log.isAdminAction && (
                                <ShieldCheckIcon
                                  className='text-primary size-3.5'
                                  aria-hidden='true'
                                />
                              )}
                              <span>
                                {log.actorName ||
                                  (log.isAdminAction
                                    ? 'Administrator'
                                    : 'Community User')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className='text-muted-foreground text-right text-xs tabular-nums'>
                            {format(
                              new Date(log.createdAt),
                              'dd/MM/yyyy HH:mm:ss'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
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
