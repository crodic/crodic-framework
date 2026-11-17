import type { ColumnDef } from '@tanstack/react-table'
import {
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Eye,
  MoreHorizontal,
  Scale,
  Trash2,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { BookingColumnKey, type Booking } from './schema'

interface GetBookingColumnsProps {
  onView: (booking: Booking) => void
  onStatusChange: (booking: Booking) => void
  onDelete: (booking: Booking) => void
}

export function getBookingsTableColumns({
  onView,
  onStatusChange,
  onDelete,
}: GetBookingColumnsProps): ColumnDef<Booking>[] {
  return [
    {
      id: BookingColumnKey.id,
      accessorFn: (row) => row.id,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Mã HĐ' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-xs font-semibold'>
          #{row.original.id}
        </span>
      ),
      size: 60,
      enableSorting: false,
    },
    {
      id: BookingColumnKey.bookingType,
      accessorFn: (row) => row.bookingType,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Loại hình & Thời gian' />
      ),
      cell: ({ row }) => (
        <div className='flex min-w-0 flex-col'>
          <span className='truncate text-sm font-semibold'>
            {row.original.bookingType}
          </span>
          <span className='text-muted-foreground mt-0.5 flex items-center gap-1 text-xs'>
            <Calendar className='text-primary size-3 shrink-0' />
            {row.original.targetDateLabel}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      id: BookingColumnKey.requester,
      accessorFn: (row) => row.fullName,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Bên đặt lịch (Client)' />
      ),
      cell: ({ row }) => (
        <div className='flex min-w-0 flex-col'>
          <span className='truncate text-xs font-semibold'>
            {row.original.fullName}
          </span>
          <span className='text-muted-foreground truncate text-[11px]'>
            {row.original.contactInfo}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      id: BookingColumnKey.cosplayer,
      accessorFn: (row) => row.targetCosplayer?.fullName,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Cosplayer' />
      ),
      cell: ({ row }) => {
        const cos = row.original.targetCosplayer
        return (
          <div className='flex max-w-[180px] items-center gap-2'>
            <div className='bg-muted flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold'>
              {cos?.avatarUrl ? (
                <img
                  src={cos.avatarUrl}
                  alt={cos.fullName || 'cosplayer'}
                  className='size-full object-cover'
                />
              ) : (
                (cos?.fullName || 'C').charAt(0).toUpperCase()
              )}
            </div>
            <div className='flex min-w-0 flex-col'>
              <span className='truncate text-xs font-medium'>
                {cos?.fullName ||
                  `Cosplayer #${row.original.targetCosplayerId}`}
              </span>
              <span className='text-muted-foreground truncate text-[10px]'>
                {cos?.email || `ID #${row.original.targetCosplayerId}`}
              </span>
            </div>
          </div>
        )
      },
      enableSorting: false,
    },
    {
      id: BookingColumnKey.budgetLabel,
      accessorFn: (row) => row.budgetLabel,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Ngân sách' />
      ),
      cell: ({ row }) => (
        <div className='flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400'>
          <DollarSign className='size-3 shrink-0' />
          <span>{row.original.budgetLabel}</span>
        </div>
      ),
      enableSorting: false,
    },
    {
      id: BookingColumnKey.status,
      accessorFn: (row) => row.status,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Trạng thái' />
      ),
      cell: ({ row }) => {
        const status = row.original.status
        if (status === 'accepted') {
          return (
            <Badge className='gap-1 border-emerald-500/20 bg-emerald-500/15 text-xs text-emerald-700 dark:text-emerald-300'>
              <CheckCircle2 className='size-3' />
              Đã nhận lịch
            </Badge>
          )
        }
        if (status === 'completed') {
          return (
            <Badge className='gap-1 border-blue-500/20 bg-blue-500/15 text-xs text-blue-700 dark:text-blue-300'>
              <CheckCircle2 className='size-3' />
              Hoàn thành
            </Badge>
          )
        }
        if (status === 'declined') {
          return (
            <Badge className='gap-1 border-rose-500/20 bg-rose-500/15 text-xs text-rose-700 dark:text-rose-300'>
              <XCircle className='size-3' />
              Từ chối
            </Badge>
          )
        }
        if (status === 'cancelled') {
          return (
            <Badge variant='destructive' className='gap-1 text-xs'>
              <Scale className='size-3' />
              Hủy / Khiếu nại
            </Badge>
          )
        }
        return (
          <Badge className='gap-1 border-amber-500/20 bg-amber-500/15 text-xs text-amber-700 dark:text-amber-300'>
            <Clock className='size-3' />
            Chờ xử lý
          </Badge>
        )
      },
      enableSorting: true,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const booking = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon' className='size-8'>
                <MoreHorizontal className='size-4' />
                <span className='sr-only'>Hành động</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => onView(booking)}>
                <Eye className='mr-2 size-4' />
                Xem hợp đồng chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(booking)}>
                <Scale className='mr-2 size-4' />
                Xử lý trạng thái & Tranh chấp
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='text-destructive focus:text-destructive'
                onClick={() => onDelete(booking)}
              >
                <Trash2 className='mr-2 size-4' />
                Xóa bản ghi
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      size: 50,
      enableSorting: false,
    },
  ]
}
