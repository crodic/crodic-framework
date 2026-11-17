import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, PlusIcon } from 'lucide-react'
import { parseAsString } from 'nuqs'
import { useTranslation } from 'react-i18next'
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
import { EventFormDialog } from './components/event-form-dialog'
import { EventStatusDialog } from './components/event-status-dialog'
import { apiDeleteAdminEvent, useDataAdminEventsOverview } from './queries'
import { EventColumnKey, type Event } from './schema'

const eventFilterParsers = {
  status: parseAsString,
  title: parseAsString,
  venue: parseAsString,
} as const

export function PageEventsOverview() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)

  useBreadcrumb([
    { title: t('navigation.kosume.title', 'Quản trị Kosume') },
    { title: t('navigation.kosume.events', 'Quản lý sự kiện') },
  ])

  const deleteMutation = useMutation({
    mutationFn: apiDeleteAdminEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] })
      toast.success('Xóa sự kiện thành công')
      setEventToDelete(null)
    },
    onError: restApiErrorHandler,
  })

  const handleOpenStatus = useCallback((event: Event) => {
    setSelectedEvent(event)
    setIsStatusOpen(true)
  }, [])

  const handleOpenDelete = useCallback((event: Event) => {
    setEventToDelete(event)
  }, [])

  const columns = useMemo(
    () =>
      getEventsTableColumns({
        onStatusChange: handleOpenStatus,
        onDelete: handleOpenDelete,
      }),
    [handleOpenStatus, handleOpenDelete]
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
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <PageHeader
        title={
          <div className='flex items-center gap-2'>
            <CalendarDays className='text-primary size-6' />
            <span>
              {t(
                'navigation.kosume.events',
                'Quản lý sự kiện & Cosplay Festival'
              )}
            </span>
          </div>
        }
        actions={
          <Button onClick={() => setIsCreateOpen(true)}>
            <PlusIcon className='mr-1.5 size-4' />
            Tạo sự kiện mới
          </Button>
        }
      />

      <DataTable table={table} isFetching={isFetching}>
        <DataTableToolbar table={table}>
          <DataTableSortList table={table} align='end' />
        </DataTableToolbar>
      </DataTable>

      <EventStatusDialog
        open={isStatusOpen}
        onOpenChange={setIsStatusOpen}
        event={selectedEvent}
      />

      <EventFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

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
