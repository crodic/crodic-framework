import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { GalleryHorizontalEnd, PlusIcon } from 'lucide-react'
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
import { DeleteAlertDialog } from '@/components/common/delete-alert-dialog'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableSortList } from '@/components/data-table/data-table-sort-list'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-shell'
import { getSpotlightBannersTableColumns } from './columns'
import {
  apiDeleteAdminSpotlightBanner,
  apiToggleAdminSpotlightBanner,
  useDataAdminSpotlightBannersOverview,
} from './queries'
import { SpotlightColumnKey, type SpotlightBanner } from './schema'

const spotlightFilterParsers = {
  isActive: parseAsString,
  name: parseAsString,
} as const

export function PageSpotlightBannersOverview() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [bannerToDelete, setBannerToDelete] = useState<SpotlightBanner | null>(
    null
  )

  useBreadcrumb([
    { title: t('navigation.kosume.title', 'Quản trị Kosume') },
    { title: t('navigation.kosume.spotlight', 'Cài đặt Banner Tiêu điểm') },
  ])

  const toggleMutation = useMutation({
    mutationFn: apiToggleAdminSpotlightBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-spotlight-banners'] })
      toast.success(
        t(
          'spotlight.messages.toggled',
          'Đã chuyển đổi trạng thái hiển thị banner'
        )
      )
    },
    onError: restApiErrorHandler,
  })

  const deleteMutation = useMutation({
    mutationFn: apiDeleteAdminSpotlightBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-spotlight-banners'] })
      toast.success(
        t('spotlight.messages.deleted', 'Đã xóa banner tiêu điểm thành công')
      )
      setBannerToDelete(null)
    },
    onError: restApiErrorHandler,
  })

  const handleEdit = useCallback(
    (banner: SpotlightBanner) => {
      navigate(`/spotlight-banners/${banner.id}/edit`)
    },
    [navigate]
  )

  const handleCreate = useCallback(() => {
    navigate('/spotlight-banners/create')
  }, [navigate])

  const { mutate: toggleBanner } = toggleMutation
  const handleToggle = useCallback(
    (banner: SpotlightBanner) => {
      toggleBanner(banner.id)
    },
    [toggleBanner]
  )

  const handleDelete = useCallback((banner: SpotlightBanner) => {
    setBannerToDelete(banner)
  }, [])

  const columns = useMemo(
    () =>
      getSpotlightBannersTableColumns({
        onEdit: handleEdit,
        onToggle: handleToggle,
        onDelete: handleDelete,
      }),
    [handleEdit, handleToggle, handleDelete]
  )

  const buildQuery: RestResourceQueryBuilderFn<typeof spotlightFilterParsers> =
    useCallback((builder, filter) => {
      if (filter.isActive) {
        builder.filter(
          'isActive',
          filter.isActive === 'active' ? 'true' : 'false'
        )
      }
      if (filter.name) {
        builder.filter('search', filter.name)
      }
    }, [])

  const { table, isFetching } = useRestResourceTable<
    SpotlightBanner,
    typeof spotlightFilterParsers
  >({
    columns,
    allowedSorts: [
      SpotlightColumnKey.sortOrder,
      SpotlightColumnKey.createdAt,
      'updatedAt',
    ],
    filterParsers: spotlightFilterParsers,
    queryHook: useDataAdminSpotlightBannersOverview,
    buildQuery,
    getRowId: (row) => row.id,
    clearOnDefault: true,
  })

  return (
    <Main className='flex-1'>
      <PageHeader
        title={
          <div className='flex items-center gap-2'>
            <GalleryHorizontalEnd className='text-primary size-6' />
            <span>
              {t(
                'navigation.kosume.spotlight',
                'Cài đặt Banner Tiêu điểm (Spotlight)'
              )}
            </span>
          </div>
        }
        actions={
          <Button onClick={handleCreate}>
            <PlusIcon className='mr-1.5 size-4' />
            {t('spotlight.actions.create', 'Thêm Banner')}
          </Button>
        }
      />

      <DataTable table={table} isFetching={isFetching}>
        <DataTableToolbar table={table}>
          <DataTableSortList table={table} align='end' />
        </DataTableToolbar>
      </DataTable>

      {bannerToDelete && (
        <DeleteAlertDialog
          open={!!bannerToDelete}
          onOpenChange={(open) => !open && setBannerToDelete(null)}
          handleDelete={() => deleteMutation.mutate(bannerToDelete.id)}
          isLoading={deleteMutation.isPending}
        />
      )}
    </Main>
  )
}
