import { format } from 'date-fns'
import type { ColumnDef } from '@tanstack/react-table'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  ShieldAlert,
  User,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { ReportColumnKey, type ContentReport } from './schema'

interface GetReportColumnsProps {
  onResolve: (report: ContentReport) => void
}

export function getContentReportsTableColumns({
  onResolve,
}: GetReportColumnsProps): ColumnDef<ContentReport>[] {
  return [
    {
      id: ReportColumnKey.id,
      accessorFn: (row) => row.id,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='ID' />
      ),
      cell: ({ row }) => (
        <p className='font-mono text-xs'>#{row.original.id}</p>
      ),
      size: 60,
      enableSorting: false,
    },
    {
      id: ReportColumnKey.targetType,
      accessorFn: (row) => row.targetType,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Đối tượng' />
      ),
      cell: ({ row }) => {
        const type = row.original.targetType
        const config: Record<
          string,
          { label: string; icon: any; className: string }
        > = {
          post: {
            label: 'Bài viết',
            icon: ExternalLink,
            className:
              'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
          },
          user: {
            label: 'Người dùng',
            icon: User,
            className:
              'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
          },
          comment: {
            label: 'Bình luận',
            icon: MessageSquare,
            className:
              'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          },
          event: {
            label: 'Sự kiện',
            icon: AlertCircle,
            className:
              'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          },
        }

        const item = config[type] ?? {
          label: type,
          icon: ShieldAlert,
          className: '',
        }
        const Icon = item.icon

        return (
          <div className='flex items-center gap-1.5'>
            <Badge
              variant='outline'
              className={`gap-1 text-xs ${item.className}`}
            >
              <Icon className='size-3' />
              {item.label} #{row.original.targetId}
            </Badge>
          </div>
        )
      },
      meta: {
        variant: 'select',
        label: 'Đối tượng',
        options: [
          { label: 'Bài viết (Post)', value: 'post' },
          { label: 'Người dùng (User)', value: 'user' },
          { label: 'Bình luận (Comment)', value: 'comment' },
          { label: 'Sự kiện (Event)', value: 'event' },
        ],
      },
      enableColumnFilter: true,
      enableSorting: false,
    },
    {
      id: ReportColumnKey.reason,
      accessorFn: (row) => row.reason,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Lý do báo cáo' />
      ),
      cell: ({ row }) => (
        <div className='max-w-[280px]'>
          <p className='truncate text-sm font-medium'>{row.original.reason}</p>
          {row.original.description && (
            <p className='text-muted-foreground line-clamp-1 text-xs'>
              {row.original.description}
            </p>
          )}
        </div>
      ),
      enableColumnFilter: true,
      enableSorting: false,
    },
    {
      id: ReportColumnKey.reporterUserId,
      accessorFn: (row) =>
        row.reporterName || row.reporterEmail || row.reporterUserId,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Người báo cáo' />
      ),
      cell: ({ row }) => (
        <div className='text-xs'>
          <p className='font-medium'>
            {row.original.reporterName ||
              `User #${row.original.reporterUserId}`}
          </p>
          {row.original.reporterEmail && (
            <p className='text-muted-foreground truncate'>
              {row.original.reporterEmail}
            </p>
          )}
        </div>
      ),
      enableSorting: false,
    },
    {
      id: ReportColumnKey.status,
      accessorFn: (row) => row.status,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Trạng thái' />
      ),
      cell: ({ row }) => {
        const status = row.original.status
        if (status === 'resolved') {
          return (
            <Badge variant='outline-success' className='gap-1 text-xs'>
              <CheckCircle2 className='size-3' />
              Đã xử lý
            </Badge>
          )
        }
        if (status === 'dismissed') {
          return (
            <Badge
              variant='outline'
              className='text-muted-foreground gap-1 text-xs'
            >
              <XCircle className='size-3' />
              Bác bỏ
            </Badge>
          )
        }
        if (status === 'reviewing') {
          return (
            <Badge className='gap-1 border-blue-500/20 bg-blue-500/15 text-xs text-blue-700 dark:text-blue-300'>
              <Clock className='size-3' />
              Đang xem xét
            </Badge>
          )
        }
        return (
          <Badge className='gap-1 border-amber-500/20 bg-amber-500/15 text-xs text-amber-700 dark:text-amber-300'>
            <AlertCircle className='size-3' />
            Chờ duyệt
          </Badge>
        )
      },
      meta: {
        variant: 'select',
        label: 'Trạng thái',
        options: [
          { label: 'Chờ duyệt (Pending)', value: 'pending' },
          { label: 'Đang xem xét (Reviewing)', value: 'reviewing' },
          { label: 'Đã xử lý (Resolved)', value: 'resolved' },
          { label: 'Bác bỏ (Dismissed)', value: 'dismissed' },
        ],
      },
      enableColumnFilter: true,
      enableSorting: false,
    },
    {
      id: 'resolution',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Kết quả xử lý' />
      ),
      cell: ({ row }) => {
        if (!row.original.resolutionNote && !row.original.resolvedByAdminName) {
          return <span className='text-muted-foreground text-xs'>—</span>
        }
        return (
          <div className='max-w-[200px] text-xs'>
            {row.original.resolvedByAdminName && (
              <p className='text-muted-foreground font-medium'>
                Bởi: {row.original.resolvedByAdminName}
              </p>
            )}
            {row.original.resolutionNote && (
              <p className='line-clamp-1 italic'>
                "{row.original.resolutionNote}"
              </p>
            )}
          </div>
        )
      },
      enableSorting: false,
    },
    {
      id: ReportColumnKey.createdAt,
      accessorFn: (row) => row.createdAt,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Thời gian' />
      ),
      cell: ({ row }) => (
        <span className='text-muted-foreground text-xs'>
          {format(new Date(row.original.createdAt), 'dd/MM/yyyy HH:mm')}
        </span>
      ),
      enableColumnFilter: false,
    },
    {
      id: 'actions',
      header: () => null,
      cell: ({ row }) => (
        <Button
          size='sm'
          variant='outline'
          className='h-7 text-xs'
          onClick={() => onResolve(row.original)}
        >
          Xử lý
        </Button>
      ),
      size: 70,
      enableSorting: false,
    },
  ]
}
