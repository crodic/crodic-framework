import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ActivityIcon,
  BookMarkedIcon,
  FolderTreeIcon,
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DeleteAlertDialog } from '@/components/common/delete-alert-dialog'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableSortList } from '@/components/data-table/data-table-sort-list'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-shell'
import { getAuditLogsTableColumns, getTagsTableColumns } from './columns'
import { MergeTagDialog } from './components/merge-tag-dialog'
import { TagsTableActionBar } from './components/tags-table-action-bar'
import {
  apiDeleteManyTags,
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
  const [tagsToDelete, setTagsToDelete] = useState<TagSummary[]>([])
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

  const bulkDeleteMutation = useMutation({
    mutationFn: (tags: TagSummary[]) =>
      apiDeleteManyTags(tags.map((t) => t.id)),
    onSuccess: () => {
      toast.success(t('tags.messages.bulkDeleted', 'Tags deleted successfully'))
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      setTagsToDelete([])
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
      TagColumnKey.category,
      TagColumnKey.safetyRating,
      TagColumnKey.status,
      TagColumnKey.usageCount,
      TagColumnKey.trendingScore,
      TagColumnKey.updatedAt,
    ],
    filterParsers: tagFilterParsers,
    queryHook: useDataTagsOverview,
    buildQuery,
    getRowId: (row) => row.id,
    enableRowSelection: true,
  })

  const totalTagsCount = meta?.totalItems ?? data.length

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

  const {
    table: auditTable,
    isFetching: isLoadingLogs,
    meta: auditMeta,
  } = useRestResourceTable<EntityTagLog, typeof auditFilterParsers>({
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
        title={t('tags.dialogs.deleteTitle', 'Delete Canonical Tag')}
        description={
          tagToDelete
            ? t(
                'tags.dialogs.deleteDesc',
                'Are you sure you want to delete #{{name}}? Associated community artworks and pages will be decoupled.',
                { name: tagToDelete.name }
              )
            : undefined
        }
        handleDelete={() => {
          if (tagToDelete) deleteMutation.mutate(tagToDelete.id)
        }}
        isLoading={deleteMutation.isPending}
      />

      <DeleteAlertDialog
        open={tagsToDelete.length > 0}
        onOpenChange={(open) => {
          if (!open) setTagsToDelete([])
        }}
        title={t('tags.dialogs.bulkDeleteTitle', 'Delete Selected Tags')}
        description={t(
          'tags.dialogs.bulkDeleteDesc',
          'Are you sure you want to delete {{count}} selected tags? Associated community artworks and pages will be decoupled.',
          { count: tagsToDelete.length }
        )}
        handleDelete={() => {
          if (tagsToDelete.length > 0) bulkDeleteMutation.mutate(tagsToDelete)
        }}
        isLoading={bulkDeleteMutation.isPending}
      />

      <MergeTagDialog
        open={Boolean(tagToMerge)}
        onOpenChange={(open) => {
          if (!open) setTagToMerge(null)
        }}
        sourceTag={tagToMerge}
      />

      <Main className='flex flex-1 flex-col gap-5'>
        <PageHeader
          title={t('tags.overview.title', 'Tags Governance')}
          description={t(
            'tags.overview.description',
            'Manage canonical tags, multilingual translations, orthographic aliases, DAG hierarchy, and community moderation.'
          )}
          actions={
            <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-2'>
              <Button
                variant='outline'
                onClick={() => navigate('/tag-categories')}
                className='w-full cursor-pointer gap-2 sm:w-auto'
              >
                <FolderTreeIcon
                  className='text-muted-foreground size-4'
                  aria-hidden='true'
                />
                <span>
                  {t('navigation.management.tagCategories', 'Tag Categories')}
                </span>
              </Button>
              <Button
                variant='outline'
                onClick={() => navigate('/tag-encyclopedias')}
                className='w-full cursor-pointer gap-2 sm:w-auto'
              >
                <BookMarkedIcon
                  className='text-muted-foreground size-4'
                  aria-hidden='true'
                />
                <span>
                  {t(
                    'navigation.management.tagEncyclopedias',
                    'Tag Encyclopedia'
                  )}
                </span>
              </Button>
              <Button
                onClick={() => navigate('/tags/create')}
                className='w-full cursor-pointer gap-2 shadow-xs sm:w-auto'
              >
                <PlusIcon className='size-4' aria-hidden='true' />
                <span>{t('buttons.create', 'Create Tag')}</span>
              </Button>
            </div>
          }
        />

        {/* Studio Workspace Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'directory' | 'audit')}
          className='flex flex-1 flex-col gap-4'
        >
          <div className='flex flex-wrap items-center justify-between gap-3 border-b pb-3'>
            <TabsList>
              <TabsTrigger
                value='directory'
                className='gap-2 text-xs sm:text-sm'
              >
                <TagsIcon className='size-4' aria-hidden='true' />
                <span>{t('tags.tabs.directory', 'Tag Directory')}</span>
                <Badge
                  variant='secondary'
                  className='ml-0.5 h-4.5 px-1.5 font-mono text-[10px] tabular-nums'
                >
                  {totalTagsCount.toLocaleString()}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value='audit' className='gap-2 text-xs sm:text-sm'>
                <ActivityIcon className='size-4' aria-hidden='true' />
                <span>
                  {t('tags.tabs.auditLogs', 'Audit & Moderation Logs')}
                </span>
                {auditMeta?.totalItems ? (
                  <Badge
                    variant='outline'
                    className='ml-0.5 h-4.5 px-1.5 font-mono text-[10px] tabular-nums'
                  >
                    {auditMeta.totalItems.toLocaleString()}
                  </Badge>
                ) : null}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value='directory'
            className='m-0 flex-1 focus-visible:outline-none'
          >
            <DataTable
              table={table}
              isFetching={isFetching}
              actionBar={
                <TagsTableActionBar
                  table={table}
                  onDelete={(tags) => setTagsToDelete(tags)}
                  disabled={bulkDeleteMutation.isPending}
                />
              }
              onClickRowAction={(row) => navigate(`/tags/${row.id}/show`)}
            >
              <DataTableToolbar table={table}>
                <DataTableSortList table={table} />
              </DataTableToolbar>
            </DataTable>
          </TabsContent>

          <TabsContent
            value='audit'
            className='m-0 flex-1 focus-visible:outline-none'
          >
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
