import type { ColumnDef } from '@tanstack/react-table'
import i18n from '@/i18n'
import {
  CalendarDays,
  EditIcon,
  EyeIcon,
  FileText,
  Heart,
  MapPin,
  Trash2Icon,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import {
  TableRowAction,
  TableRowActions,
} from '@/components/data-table/table-row-actions'
import {
  EventFeaturedBadge,
  EventRecruitingBadge,
  EventStatusBadge,
} from './components/event-badges'
import { EventColumnKey, type Event } from './schema'

interface GetEventColumnsProps {
  onView: (event: Event) => void
  onEdit: (event: Event) => void
  onDelete: (event: Event) => void
}

export function getEventsTableColumns({
  onView,
  onEdit,
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
        <DataTableColumnHeader
          column={column}
          label={i18n.t('events.columns.date', 'Event date')}
        />
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
        <DataTableColumnHeader
          column={column}
          label={i18n.t('events.columns.location', 'Location')}
        />
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
        <DataTableColumnHeader
          column={column}
          label={i18n.t('events.columns.status', 'Status')}
        />
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
            'Interest / Attendees / Applications'
          )}
        />
      ),
      cell: ({ row }) => (
        <div className='flex items-center gap-3 font-mono text-xs tabular-nums'>
          <span
            className='text-muted-foreground flex items-center gap-1'
            title={i18n.t('events.columns.interested', 'Interested')}
          >
            <Heart className='text-destructive size-3' aria-hidden='true' />
            {row.original.interestedCount.toLocaleString()}
          </span>
          <span
            className='flex items-center gap-1'
            title={i18n.t('events.columns.attendees', 'Attendees')}
          >
            <Users className='text-primary size-3' aria-hidden='true' />
            {row.original.participantsCount.toLocaleString()}
          </span>
          <span
            className='text-muted-foreground flex items-center gap-1'
            title={i18n.t('events.columns.applications', 'Applications')}
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
          <TableRowActions>
            <TableRowAction
              label={
                <>
                  <span>{i18n.t('events.actions.view', 'Xem chi tiết')}</span>
                </>
              }
              icon={<EyeIcon className='mr-2 size-3.5' />}
              onSelect={() => onView(event)}
            />
            <TableRowAction
              label={
                <>
                  <span>{i18n.t('events.actions.edit', 'Chỉnh sửa')}</span>
                </>
              }
              icon={<EditIcon className='mr-2 size-3.5' />}
              onSelect={() => onEdit(event)}
            />
            <TableRowAction
              label={
                <>
                  <span>{i18n.t('events.actions.delete', 'Xóa')}</span>
                </>
              }
              icon={<Trash2Icon className='mr-2 size-3.5' />}
              onSelect={() => onDelete(event)}
              destructive
            />
          </TableRowActions>
        )
      },
      size: 56,
      enableSorting: false,
    },
  ]
}
