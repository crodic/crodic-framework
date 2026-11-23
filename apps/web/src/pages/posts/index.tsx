import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Image } from 'lucide-react'
import { parseAsString } from 'nuqs'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import {
  useRestResourceTable,
  type RestResourceQueryBuilderFn,
} from '@/hooks/use-rest-resource-table'
import { DeleteAlertDialog } from '@/components/common/delete-alert-dialog'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableSortList } from '@/components/data-table/data-table-sort-list'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-shell'
import { getPostsTableColumns } from './columns'
import { PostDetailDialog } from './components/post-detail-dialog'
import { PostStatusDialog } from './components/post-status-dialog'
import {
  apiDeleteAdminPost,
  apiToggleAdminPostFeature,
  useDataAdminPostsOverview,
} from './queries'
import { PostColumnKey, type Post } from './schema'

const postFilterParsers = {
  status: parseAsString,
  title: parseAsString,
  albumCategory: parseAsString,
} as const

export function PagePostsOverview() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<Post | null>(null)

  useBreadcrumb([
    { title: t('navigation.kosume.title', 'Quản trị Kosume') },
    { title: t('navigation.kosume.posts', 'Bài đăng & Album ảnh') },
  ])

  const deleteMutation = useMutation({
    mutationFn: apiDeleteAdminPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] })
      toast.success(t('posts.messages.deleted', 'Xóa bài đăng thành công'))
      setPostToDelete(null)
    },
    onError: restApiErrorHandler,
  })

  const toggleFeatureMutation = useMutation({
    mutationFn: apiToggleAdminPostFeature,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] })
      toast.success(
        t(
          'posts.messages.featureUpdated',
          'Cập nhật trạng thái nổi bật thành công'
        )
      )
    },
    onError: restApiErrorHandler,
  })

  const handleOpenDetail = useCallback((post: Post) => {
    setSelectedPost(post)
    setIsDetailOpen(true)
  }, [])

  const handleOpenStatus = useCallback((post: Post) => {
    setSelectedPost(post)
    setIsStatusOpen(true)
  }, [])

  const { mutate: toggleFeature } = toggleFeatureMutation
  const handleToggleFeature = useCallback(
    (post: Post, isFeatured: boolean) => {
      toggleFeature({ id: post.id, isFeatured })
    },
    [toggleFeature]
  )

  const handleOpenDelete = useCallback((post: Post) => {
    setPostToDelete(post)
  }, [])

  const columns = useMemo(
    () =>
      getPostsTableColumns({
        onView: handleOpenDetail,
        onStatusChange: handleOpenStatus,
        onToggleFeature: handleToggleFeature,
        onDelete: handleOpenDelete,
      }),
    [handleOpenDetail, handleOpenStatus, handleToggleFeature, handleOpenDelete]
  )

  const buildQuery: RestResourceQueryBuilderFn<typeof postFilterParsers> =
    useCallback((builder, filter) => {
      if (filter.status) {
        builder.filter('status', filter.status)
      }
      if (filter.title) {
        builder.filter('title', filter.title)
      }
      if (filter.albumCategory) {
        builder.filter('albumCategory', filter.albumCategory)
      }
    }, [])

  const { table, isFetching } = useRestResourceTable<
    Post,
    typeof postFilterParsers
  >({
    columns,
    allowedSorts: [
      PostColumnKey.createdAt,
      PostColumnKey.publishedAt,
      'likesCount',
      'viewsCount',
      'commentsCount',
    ],
    filterParsers: postFilterParsers,
    queryHook: useDataAdminPostsOverview,
    buildQuery,
    getRowId: (row) => row.id,
    clearOnDefault: true,
  })

  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <PageHeader
        title={
          <div className='flex items-center gap-2'>
            <Image className='text-primary size-6' />
            <span>
              {t(
                'navigation.kosume.posts',
                'Quản lý bài đăng & Album ảnh cộng đồng'
              )}
            </span>
          </div>
        }
      />

      <DataTable table={table} isFetching={isFetching}>
        <DataTableToolbar table={table}>
          <DataTableSortList table={table} align='end' />
        </DataTableToolbar>
      </DataTable>

      <PostDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        post={selectedPost}
      />

      <PostStatusDialog
        open={isStatusOpen}
        onOpenChange={setIsStatusOpen}
        post={selectedPost}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['admin-posts'] })
        }}
      />

      {postToDelete && (
        <DeleteAlertDialog
          open={!!postToDelete}
          onOpenChange={(open) => !open && setPostToDelete(null)}
          handleDelete={() => deleteMutation.mutate(postToDelete.id)}
          isLoading={deleteMutation.isPending}
        />
      )}
    </Main>
  )
}
