import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Handshake } from 'lucide-react'
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
import { getBookingsTableColumns } from './columns'
import { BookingDetailDialog } from './components/booking-detail-dialog'
import { BookingStatusDialog } from './components/booking-status-dialog'
import { apiDeleteAdminBooking, useDataAdminBookingsOverview } from './queries'
import { BookingColumnKey, type Booking } from './schema'

const bookingFilterParsers = {
  status: parseAsString,
  bookingType: parseAsString,
  fullName: parseAsString,
} as const

export function PageBookingsOverview() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null)

  useBreadcrumb([
    { title: t('navigation.kosume.title', 'Quản trị Kosume') },
    { title: t('navigation.kosume.bookings', 'Hợp đồng & Booking') },
  ])

  const deleteMutation = useMutation({
    mutationFn: apiDeleteAdminBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] })
      toast.success(
        t('bookings.messages.deleted', 'Xóa bản ghi booking thành công')
      )
      setBookingToDelete(null)
    },
    onError: restApiErrorHandler,
  })

  const handleOpenDetail = useCallback((booking: Booking) => {
    setSelectedBooking(booking)
    setIsDetailOpen(true)
  }, [])

  const handleOpenStatus = useCallback((booking: Booking) => {
    setSelectedBooking(booking)
    setIsStatusOpen(true)
  }, [])

  const handleOpenDelete = useCallback((booking: Booking) => {
    setBookingToDelete(booking)
  }, [])

  const columns = useMemo(
    () =>
      getBookingsTableColumns({
        onView: handleOpenDetail,
        onStatusChange: handleOpenStatus,
        onDelete: handleOpenDelete,
      }),
    [handleOpenDetail, handleOpenStatus, handleOpenDelete]
  )

  const buildQuery: RestResourceQueryBuilderFn<typeof bookingFilterParsers> =
    useCallback((builder, filter) => {
      if (filter.status) {
        builder.filter('status', filter.status)
      }
      if (filter.bookingType) {
        builder.filter('bookingType', filter.bookingType)
      }
      if (filter.fullName) {
        builder.filter('fullName', filter.fullName)
      }
    }, [])

  const { table, isFetching } = useRestResourceTable<
    Booking,
    typeof bookingFilterParsers
  >({
    columns,
    allowedSorts: [BookingColumnKey.createdAt, BookingColumnKey.status],
    filterParsers: bookingFilterParsers,
    queryHook: useDataAdminBookingsOverview,
    buildQuery,
    getRowId: (row) => row.id,
    clearOnDefault: true,
  })

  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <PageHeader
        title={
          <div className='flex items-center gap-2'>
            <Handshake className='text-primary size-6' />
            <span>
              {t(
                'navigation.kosume.bookings',
                'Quản lý hợp đồng booking & Xử lý khiếu nại'
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

      <BookingDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        booking={selectedBooking}
      />

      <BookingStatusDialog
        open={isStatusOpen}
        onOpenChange={setIsStatusOpen}
        booking={selectedBooking}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['admin-bookings'] })
        }}
      />

      {bookingToDelete && (
        <DeleteAlertDialog
          open={!!bookingToDelete}
          onOpenChange={(open) => !open && setBookingToDelete(null)}
          handleDelete={() => deleteMutation.mutate(bookingToDelete.id)}
          isLoading={deleteMutation.isPending}
        />
      )}
    </Main>
  )
}
