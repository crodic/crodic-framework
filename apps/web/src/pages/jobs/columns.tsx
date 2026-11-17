import type { ColumnDef } from '@tanstack/react-table'
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { JobColumnKey, type Job } from './schema'

interface GetJobColumnsProps {
  onStatusChange: (job: Job) => void
  onDelete: (job: Job) => void
}

export function getJobsTableColumns({
  onStatusChange,
  onDelete,
}: GetJobColumnsProps): ColumnDef<Job>[] {
  return [
    {
      id: JobColumnKey.id,
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
      id: JobColumnKey.title,
      accessorFn: (row) => row.title,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Tin tuyển dụng & Brand' />
      ),
      cell: ({ row }) => (
        <div className='max-w-[280px]'>
          <div className='flex items-center gap-1.5'>
            <span className='line-clamp-1 text-sm font-semibold'>
              {row.original.title}
            </span>
            {row.original.isFeatured && (
              <Badge className='h-4 border-amber-500/30 bg-amber-500/20 px-1 py-0 text-[10px] text-amber-700 dark:text-amber-300'>
                <Sparkles className='mr-0.5 size-2.5' />
                Hot
              </Badge>
            )}
          </div>
          <div className='text-muted-foreground mt-0.5 flex items-center gap-1 text-xs'>
            <Building2 className='size-3' />
            <span>{row.original.brandName}</span>
          </div>
        </div>
      ),
      enableColumnFilter: true,
      enableSorting: false,
    },
    {
      id: JobColumnKey.categoryCode,
      accessorFn: (row) => row.categoryCode,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Phân loại' />
      ),
      cell: ({ row }) => (
        <Badge variant='outline' className='text-xs'>
          {row.original.categoryLabel}
        </Badge>
      ),
      meta: {
        variant: 'select',
        label: 'Phân loại',
        options: [
          { label: 'Lookbook / Mẫu ảnh', value: 'lookbook' },
          { label: 'Sự kiện / Guest Festival', value: 'event' },
          { label: 'Chế tác / Props & Wig', value: 'crafting' },
          { label: 'Quảng cáo Game Ads', value: 'game_ads' },
        ],
      },
      enableColumnFilter: true,
      enableSorting: false,
    },
    {
      id: JobColumnKey.budgetLabel,
      accessorFn: (row) => row.budgetLabel,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Mức thù lao' />
      ),
      cell: ({ row }) => (
        <span className='text-xs font-medium text-emerald-600 dark:text-emerald-400'>
          {row.original.budgetLabel}
        </span>
      ),
      enableSorting: false,
    },
    {
      id: JobColumnKey.locationLabel,
      accessorFn: (row) => row.locationLabel,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Địa điểm' />
      ),
      cell: ({ row }) => (
        <div className='text-muted-foreground flex items-center gap-1 text-xs'>
          <MapPin className='size-3 shrink-0' />
          <span>{row.original.locationLabel}</span>
        </div>
      ),
      enableSorting: false,
    },
    {
      id: JobColumnKey.status,
      accessorFn: (row) => row.status,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Trạng thái' />
      ),
      cell: ({ row }) => {
        const status = row.original.status
        if (status === 'open') {
          return (
            <Badge variant='outline-success' className='gap-1 text-xs'>
              <CheckCircle2 className='size-3' />
              Đang tuyển
            </Badge>
          )
        }
        if (status === 'pending_approval') {
          return (
            <Badge className='gap-1 border-amber-500/20 bg-amber-500/15 text-xs text-amber-700 dark:text-amber-300'>
              <Clock className='size-3' />
              Chờ duyệt
            </Badge>
          )
        }
        if (status === 'closed') {
          return (
            <Badge variant='outline' className='text-muted-foreground text-xs'>
              Đã đóng
            </Badge>
          )
        }
        return (
          <Badge variant='secondary' className='text-xs'>
            {status}
          </Badge>
        )
      },
      meta: {
        variant: 'select',
        label: 'Trạng thái',
        options: [
          { label: 'Đang tuyển (Open)', value: 'open' },
          { label: 'Chờ duyệt (Pending Approval)', value: 'pending_approval' },
          { label: 'Đã đóng (Closed)', value: 'closed' },
          { label: 'Bản nháp (Draft)', value: 'draft' },
        ],
      },
      enableColumnFilter: true,
      enableSorting: false,
    },
    {
      id: JobColumnKey.applicationsCount,
      accessorFn: (row) => row.applicationsCount,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Ứng tuyển' />
      ),
      cell: ({ row }) => (
        <div className='flex items-center gap-1 text-xs'>
          <Users className='text-muted-foreground size-3' />
          <span className='font-semibold'>
            {row.original.applicationsCount}
          </span>
        </div>
      ),
      enableSorting: true,
    },
    {
      id: JobColumnKey.deadlineLabel,
      accessorFn: (row) => row.deadlineLabel,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Hạn nộp' />
      ),
      cell: ({ row }) => (
        <div className='text-muted-foreground flex items-center gap-1 text-xs'>
          <Calendar className='size-3' />
          <span>{row.original.deadlineLabel}</span>
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
            Trạng thái
          </Button>
          <Button
            size='sm'
            variant='ghost'
            className='text-destructive hover:bg-destructive/10 h-7 text-xs'
            onClick={() => onDelete(row.original)}
          >
            Xóa
          </Button>
        </div>
      ),
      size: 130,
      enableSorting: false,
    },
  ]
}
