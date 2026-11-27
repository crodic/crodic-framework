import type { ColumnDef } from '@tanstack/react-table'
import i18n from '@/i18n'
import {
  CalendarDays,
  EditIcon,
  EyeIcon,
  FileText,
  Heart,
  MapPin,
  MoreHorizontal,
  SlidersHorizontalIcon,
  Trash2Icon,
  Users,
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
import {
  EventFeaturedBadge,
  EventRecruitingBadge,
  EventStatusBadge,
} from './components/event-badges'
import { EventColumnKey, type Event } from './schema'

interface GetEventColumnsProps {
  onView: (event: Event) => void
  onEdit: (event: Event) => void
  onStatusChange: (event: Event) => void
  onDelete: (event: Event) => void
}

export function getEventsTableColumns({
  onView,
  onEdit,
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
        <span className='text-muted-foreground font-mono text-xs tabular-nums'>
          #{row.original.id}
        </span>
      ),
      size: 60,
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
            className='border-border/60 size-11 shrink-0 rounded-md border object-cover'
            onError={(e) => {
              ;(e.target as HTMLElement).style.display = 'none'
            }}
          />
          <div className='flex min-w-0 flex-col'>
            <div className='flex items-center gap-1.5'>
              <span className='line-clamp-1 text-sm font-semibold'>
                {row.original.title}
              </span>
              <EventFeaturedBadge
                isFeatured={row.original.isFeaturedFestival}
                className='h-4 shrink-0 px-1.5 py-0 text-[10px]'
              />
            </div>
            <div className='text-muted-foreground mt-0.5 flex items-center gap-1 truncate text-xs'>
              <MapPin className='size-3 shrink-0' aria-hidden='true' />
              <span className='truncate'>{row.original.venue}</span>
            </div>
          </div>
        </div>
      ),
      meta: {
        label: i18n.t('events.columns.title', 'Tên sự kiện'),
        placeholder: i18n.t(
          'events.search.titlePlaceholder',
          'Tìm theo tên sự kiện...'
        ),
        variant: 'text',
      },
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
        <div className='text-muted-foreground flex items-center gap-1.5 text-xs tabular-nums'>
          <CalendarDays
            className='text-muted-foreground size-3.5 shrink-0'
            aria-hidden='true'
          />
          <span className='whitespace-nowrap'>{row.original.dateString}</span>
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
        <Badge variant='outline' className='text-xs font-normal'>
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
      cell: ({ row }) => <EventStatusBadge status={row.original.status} />,
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
      cell: ({ row }) => (
        <EventRecruitingBadge isRecruiting={row.original.isRecruiting} />
      ),
      enableSorting: false,
    },
    {
      id: 'engagement',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={i18n.t(
            'events.columns.engagement',
            'Quan tâm / Tham gia / Đơn'
          )}
        />
      ),
      cell: ({ row }) => (
        <div className='flex items-center gap-3 font-mono text-xs tabular-nums'>
          <span
            className='text-muted-foreground flex items-center gap-1'
            title='Lượt quan tâm'
          >
            <Heart className='text-destructive size-3' aria-hidden='true' />
            {row.original.interestedCount.toLocaleString()}
          </span>
          <span className='flex items-center gap-1' title='Số người tham gia'>
            <Users className='text-primary size-3' aria-hidden='true' />
            {row.original.participantsCount.toLocaleString()}
          </span>
          <span
            className='text-muted-foreground flex items-center gap-1'
            title='Đơn ứng tuyển'
          >
            <FileText className='size-3' aria-hidden='true' />
            {row.original.applicationsCount.toLocaleString()}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      id: 'actions',
      header: () => null,
      cell: ({ row }) => {
        const event = row.original
        return (
          <div
            className='flex items-center justify-end'
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='text-muted-foreground hover:text-foreground size-8 cursor-pointer'
                >
                  <MoreHorizontal className='size-4' />
                  <span className='sr-only'>
                    {i18n.t('events.actions.menu', 'Thao tác')}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-44'>
                <DropdownMenuItem onClick={() => onView(event)}>
                  <EyeIcon className='mr-2 size-3.5' />
                  <span>{i18n.t('events.actions.view', 'Xem chi tiết')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(event)}>
                  <EditIcon className='mr-2 size-3.5' />
                  <span>{i18n.t('events.actions.edit', 'Chỉnh sửa')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(event)}>
                  <SlidersHorizontalIcon className='mr-2 size-3.5' />
                  <span>
                    {i18n.t('events.actions.status', 'Đổi trạng thái')}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(event)}
                  className='text-destructive focus:text-destructive'
                >
                  <Trash2Icon className='mr-2 size-3.5' />
                  <span>{i18n.t('events.actions.delete', 'Xóa')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
      size: 56,
      enableSorting: false,
    },
  ]
}
