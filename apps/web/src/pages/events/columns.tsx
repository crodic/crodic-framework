import type { ColumnDef } from '@tanstack/react-table'
import i18n from '@/i18n'
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Heart,
  MapPin,
  Star,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { EventColumnKey, type Event } from './schema'

interface GetEventColumnsProps {
  onStatusChange: (event: Event) => void
  onDelete: (event: Event) => void
}

export function getEventsTableColumns({
  onStatusChange,
  onDelete,
}: GetEventColumnsProps): ColumnDef<Event>[] {
  return [
    {
      id: EventColumnKey.id,
      accessorFn: (row) => row.id,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='ID' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-xs'>#{row.original.id}</span>
      ),
      size: 50,
      enableSorting: false,
    },
    {
      id: EventColumnKey.title,
      accessorFn: (row) => row.title,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={i18n.t('events.columns.title', 'Sự kiện & Địa điểm')}
        />
      ),
      cell: ({ row }) => (
        <div className='flex max-w-[340px] items-center gap-3'>
          <img
            src={row.original.imageUrl}
            alt={row.original.title}
            className='size-11 shrink-0 rounded-md border object-cover'
            onError={(e) => {
              ;(e.target as HTMLElement).style.display = 'none'
            }}
          />
          <div className='flex min-w-0 flex-col'>
            <div className='flex items-center gap-1.5'>
              <span className='line-clamp-1 text-sm font-semibold'>
                {row.original.title}
              </span>
              {row.original.isFeaturedFestival && (
                <Badge className='bg-primary/15 text-primary border-primary/20 h-4 shrink-0 px-1 py-0 text-[10px]'>
                  <Star className='mr-0.5 size-2.5' />
                  Festival
                </Badge>
              )}
            </div>
            <div className='text-muted-foreground mt-0.5 flex items-center gap-1 truncate text-xs'>
              <MapPin className='size-3 shrink-0' />
              <span className='truncate'>{row.original.venue}</span>
            </div>
          </div>
        </div>
      ),
      enableColumnFilter: true,
      enableSorting: false,
    },
    {
      id: EventColumnKey.dateString,
      accessorFn: (row) => row.dateString,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Thời gian diễn ra' />
      ),
      cell: ({ row }) => (
        <div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
          <CalendarDays className='text-primary size-3.5 shrink-0' />
          <span>{row.original.dateString}</span>
        </div>
      ),
      enableSorting: false,
    },
    {
      id: EventColumnKey.locationLabel,
      accessorFn: (row) => row.locationLabel,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Khu vực' />
      ),
      cell: ({ row }) => (
        <Badge variant='outline' className='text-xs'>
          {row.original.locationLabel}
        </Badge>
      ),
      enableSorting: false,
    },
    {
      id: EventColumnKey.status,
      accessorFn: (row) => row.status,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Trạng thái' />
      ),
      cell: ({ row }) => {
        const status = row.original.status
        if (status === 'upcoming') {
          return (
            <Badge className='gap-1 border-blue-500/20 bg-blue-500/15 text-xs text-blue-700 dark:text-blue-300'>
              <Clock className='size-3' />
              Sắp diễn ra
            </Badge>
          )
        }
        if (status === 'ongoing') {
          return (
            <Badge
              variant='outline-success'
              className='animate-pulse gap-1 text-xs'
            >
              <CheckCircle2 className='size-3' />
              Đang diễn ra
            </Badge>
          )
        }
        if (status === 'completed') {
          return (
            <Badge variant='outline' className='text-muted-foreground text-xs'>
              Đã kết thúc
            </Badge>
          )
        }
        if (status === 'cancelled') {
          return (
            <Badge variant='destructive' className='gap-1 text-xs'>
              <XCircle className='size-3' />
              Đã hủy
            </Badge>
          )
        }
        return (
          <Badge variant='secondary' className='text-xs'>
            {i18n.t('events.status.draft', 'Bản nháp')}
          </Badge>
        )
      },
      meta: {
        variant: 'select',
        label: i18n.t('events.columns.status', 'Trạng thái'),
        options: [
          {
            label: i18n.t(
              'events.status.upcomingOption',
              'Sắp diễn ra (Upcoming)'
            ),
            value: 'upcoming',
          },
          {
            label: i18n.t(
              'events.status.ongoingOption',
              'Đang diễn ra (Ongoing)'
            ),
            value: 'ongoing',
          },
          {
            label: i18n.t(
              'events.status.completedOption',
              'Đã kết thúc (Completed)'
            ),
            value: 'completed',
          },
          {
            label: i18n.t(
              'events.status.cancelledOption',
              'Đã hủy (Cancelled)'
            ),
            value: 'cancelled',
          },
          {
            label: i18n.t('events.status.draftOption', 'Bản nháp (Draft)'),
            value: 'draft',
          },
        ],
      },
      enableColumnFilter: true,
      enableSorting: false,
    },
    {
      id: EventColumnKey.isRecruiting,
      accessorFn: (row) => (row.isRecruiting ? 'recruiting' : 'closed'),
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={i18n.t('events.columns.recruiting', 'Đăng ký Guest')}
        />
      ),
      cell: ({ row }) =>
        row.original.isRecruiting ? (
          <Badge variant='outline-success' className='gap-1 text-xs'>
            <UserCheck className='size-3' />
            {i18n.t('events.recruiting.open', 'Mở đăng ký')}
          </Badge>
        ) : (
          <span className='text-muted-foreground text-xs'>
            {i18n.t('events.recruiting.closed', 'Đóng')}
          </span>
        ),
      enableSorting: false,
    },
    {
      id: 'engagement',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={i18n.t('events.columns.engagement', 'Quan tâm / Tham gia')}
        />
      ),
      cell: ({ row }) => (
        <div className='flex items-center gap-3 text-xs'>
          <span
            className='text-muted-foreground flex items-center gap-1'
            title='Lượt quan tâm'
          >
            <Heart className='size-3 text-rose-500' />
            {row.original.interestedCount}
          </span>
          <span className='flex items-center gap-1' title='Số người tham gia'>
            <Users className='text-primary size-3' />
            {row.original.participantsCount}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      id: 'actions',
      header: () => null,
      cell: ({ row }) => (
        <div className='flex items-center gap-1'>
          <Button
            size='sm'
            variant='outline'
            className='h-7 text-xs'
            onClick={() => onStatusChange(row.original)}
          >
            {i18n.t('events.actions.status', 'Trạng thái')}
          </Button>
          <Button
            size='sm'
            variant='ghost'
            className='text-destructive hover:bg-destructive/10 h-7 text-xs'
            onClick={() => onDelete(row.original)}
          >
            {i18n.t('events.actions.delete', 'Xóa')}
          </Button>
        </div>
      ),
      size: 130,
      enableSorting: false,
    },
  ]
}
