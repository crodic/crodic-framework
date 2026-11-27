import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PlusIcon } from 'lucide-react'
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
import { getEventsTableColumns } from './columns'
import { apiDeleteAdminEvent, useDataAdminEventsOverview } from './queries'
import { EventColumnKey, type Event } from './schema'

const eventFilterParsers = {
  status: parseAsString,
  title: parseAsString,
  venue: parseAsString,
} as const

export function PageEventsOverview() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)

  useBreadcrumb([
    { title: t('navigation.kosume.title', 'Quản trị Kosume') },
    { title: t('navigation.kosume.events', 'Quản lý sự kiện') },
  ])

  const deleteMutation = useMutation({
    mutationFn: apiDeleteAdminEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] })
      toast.success(t('events.messages.deleted', 'Xóa sự kiện thành công'))
      setEventToDelete(null)
    },
    onError: restApiErrorHandler,
  })

  const handleOpenView = useCallback(
    (event: Event) => {
      navigate(`/events/${event.id}/show`)
    },
    [navigate]
  )

  const handleOpenEdit = useCallback(
    (event: Event) => {
      navigate(`/events/${event.id}/edit`)
    },
    [navigate]
  )

  const handleOpenDelete = useCallback((event: Event) => {
    setEventToDelete(event)
  }, [])

  const columns = useMemo(
    () =>
      getEventsTableColumns({
        onView: handleOpenView,
        onEdit: handleOpenEdit,
        onDelete: handleOpenDelete,
      }),
    [handleOpenView, handleOpenEdit, handleOpenDelete]
  )

  const buildQuery: RestResourceQueryBuilderFn<typeof eventFilterParsers> =
    useCallback((builder, filter) => {
      if (filter.status) {
        builder.filter('status', filter.status)
      }
      if (filter.title) {
        builder.filter('title', filter.title)
      }
      if (filter.venue) {
        builder.filter('venue', filter.venue)
      }
    }, [])

  const { table, isFetching } = useRestResourceTable<
    Event,
    typeof eventFilterParsers
  >({
    columns,
    allowedSorts: [
      EventColumnKey.startAt,
      EventColumnKey.createdAt,
      'interestedCount',
      'participantsCount',
    ],
    filterParsers: eventFilterParsers,
    queryHook: useDataAdminEventsOverview,
    buildQuery,
    getRowId: (row) => row.id,
    clearOnDefault: true,
  })

  return (
    <Main className='flex-1'>
      <PageHeader
        title={t(
          'navigation.kosume.events',
          'Quản lý sự kiện & Cosplay Festival'
        )}
        description={t(
          'events.overview.description',
          'Quản lý lễ hội cosplay, lịch trình hoạt động, tuyển chọn khách mời và trạng thái công khai.'
        )}
        actions={
          <Button
            onClick={() => navigate('/events/create')}
            className='cursor-pointer'
          >
            <PlusIcon className='mr-1.5 size-4' aria-hidden='true' />
            {t('events.actions.create', 'Tạo sự kiện mới')}
          </Button>
        }
      />

      <DataTable
        table={table}
        isFetching={isFetching}
        onClickRowAction={(row) => navigate(`/events/${row.id}/show`)}
      >
        <DataTableToolbar table={table}>
          <DataTableSortList table={table} align='end' />
        </DataTableToolbar>
      </DataTable>

      {eventToDelete && (
        <DeleteAlertDialog
          open={!!eventToDelete}
          onOpenChange={(open) => !open && setEventToDelete(null)}
          handleDelete={() => deleteMutation.mutate(eventToDelete.id)}
          isLoading={deleteMutation.isPending}
        />
      )}
    </Main>
  )
}
