import type { ColumnDef } from '@tanstack/react-table'
import { CheckCircle, Clock, Eye, Mail, User, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import type { CosplayerApplicationSchema } from './schema'

interface GetColumnsProps {
  onReview: (application: CosplayerApplicationSchema) => void
}

export function getCosplayerApplicationsColumns({
  onReview,
}: GetColumnsProps): ColumnDef<CosplayerApplicationSchema>[] {
  return [
    {
      id: 'id',
      accessorFn: (row) => row.id,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Mã đơn' />
      ),
      cell: ({ row }) => (
        <span className='text-xs font-medium'>#{row.original.id}</span>
      ),
      size: 80,
      enableSorting: true,
    },
    {
      id: 'user',
      header: 'Người nộp đơn',
      cell: ({ row }) => {
        const app = row.original
        return (
          <div className='flex items-center gap-2.5'>
            <div className='bg-primary/10 text-primary relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-semibold'>
              {app.user?.avatar ? (
                <img
                  src={app.user.avatar}
                  alt={app.user?.fullName || ''}
                  className='size-full object-cover'
                />
              ) : (
                <User className='size-4' />
              )}
            </div>
            <div className='flex min-w-0 flex-col'>
              <span className='text-foreground truncate text-xs font-medium'>
                {app.user?.fullName || app.stageName}
              </span>
              <span className='text-muted-foreground flex items-center gap-1 truncate text-[11px]'>
                <Mail className='size-3 shrink-0' />
                {app.user?.email}
              </span>
            </div>
          </div>
        )
      },
      enableSorting: false,
    },
    {
      id: 'stageName',
      accessorFn: (row) => row.stageName,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Nghệ danh' />
      ),
      cell: ({ row }) => (
        <span className='text-primary text-xs font-semibold'>
          {row.original.stageName}
        </span>
      ),
      meta: {
        label: 'Nghệ danh',
        placeholder: 'Tìm theo nghệ danh...',
        variant: 'text',
      },
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      id: 'bio',
      header: 'Giới thiệu',
      cell: ({ row }) => (
        <p className='text-muted-foreground max-w-[240px] truncate text-xs'>
          {row.original.bio}
        </p>
      ),
      enableSorting: false,
    },
    {
      id: 'status',
      accessorFn: (row) => row.status,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Trạng thái' />
      ),
      cell: ({ row }) => {
        const status = row.original.status
        if (status === 'APPROVED') {
          return (
            <Badge variant='outline-success' className='gap-1 text-xs'>
              <CheckCircle className='size-3' /> Đã duyệt
            </Badge>
          )
        }
        if (status === 'REJECTED') {
          return (
            <Badge variant='destructive' className='gap-1 text-xs'>
              <XCircle className='size-3' /> Đã từ chối
            </Badge>
          )
        }
        return (
          <Badge variant='outline-warning' className='gap-1 text-xs'>
            <Clock className='size-3' /> Chờ duyệt
          </Badge>
        )
      },
      meta: {
        variant: 'select',
        label: 'Trạng thái',
        options: [
          { label: 'Chờ duyệt', value: 'PENDING' },
          { label: 'Đã duyệt', value: 'APPROVED' },
          { label: 'Đã từ chối', value: 'REJECTED' },
        ],
      },
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      id: 'portfolioCount',
      header: 'Tác phẩm',
      cell: ({ row }) => {
        const count = row.original.portfolioUrls?.length || 0
        return (
          <span className='text-muted-foreground text-xs'>
            {count > 0 ? `${count} ảnh` : 'Chưa có'}
          </span>
        )
      },
      enableSorting: false,
    },
    {
      id: 'createdAt',
      accessorFn: (row) => row.createdAt,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Ngày nộp' />
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt)
        return (
          <span className='text-muted-foreground text-xs'>
            {date.toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )
      },
      enableSorting: true,
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <Button
          variant='ghost'
          size='sm'
          onClick={() => onReview(row.original)}
          className='h-8 gap-1 text-xs font-semibold'
        >
          <Eye className='size-3.5' />
          <span>Xem & Duyệt</span>
        </Button>
      ),
      size: 110,
      enableSorting: false,
    },
  ]
}
