import type { ColumnDef } from '@tanstack/react-table'
import { BadgeCheck, Edit2, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import {
  TableRowAction,
  TableRowActions,
} from '@/components/data-table/table-row-actions'
import { SpotlightColumnKey, type SpotlightBanner } from './schema'

interface GetSpotlightColumnsProps {
  onEdit: (banner: SpotlightBanner) => void
  onToggle: (banner: SpotlightBanner) => void
  onDelete: (banner: SpotlightBanner) => void
}

export function getSpotlightBannersTableColumns({
  onEdit,
  onToggle,
  onDelete,
}: GetSpotlightColumnsProps): ColumnDef<SpotlightBanner>[] {
  return [
    {
      id: SpotlightColumnKey.id,
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
      id: SpotlightColumnKey.name,
      accessorFn: (row) => row.name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Banner & Cosplayer' />
      ),
      cell: ({ row }) => (
        <div className='flex max-w-[320px] items-center gap-3'>
          <img
            src={row.original.bannerImageUrl}
            alt={row.original.name}
            className='bg-muted h-10 w-16 shrink-0 rounded-md border object-cover'
            onError={(e) => {
              ;(e.target as HTMLElement).style.display = 'none'
            }}
          />
          <div className='flex min-w-0 flex-col'>
            <div className='flex items-center gap-1 text-sm font-semibold'>
              <span>{row.original.name}</span>
              {row.original.isVerified && (
                <BadgeCheck className='text-primary fill-primary/20 size-3.5 shrink-0' />
              )}
            </div>
            <span className='text-muted-foreground truncate text-xs'>
              {row.original.portfolioHref}
            </span>
          </div>
        </div>
      ),
      enableColumnFilter: true,
      enableSorting: false,
    },
    {
      id: SpotlightColumnKey.badge,
      accessorFn: (row) => row.badge,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Huy hiệu & Slogan' />
      ),
      cell: ({ row }) => (
        <div className='max-w-[280px]'>
          <Badge className='bg-primary/15 text-primary border-primary/25 mb-1 text-xs'>
            {row.original.badge}
          </Badge>
          <p className='text-muted-foreground line-clamp-1 text-xs'>
            {row.original.tagline}
          </p>
        </div>
      ),
      enableSorting: false,
    },
    {
      id: SpotlightColumnKey.sortOrder,
      accessorFn: (row) => row.sortOrder,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Thứ tự' />
      ),
      cell: ({ row }) => (
        <span className='bg-muted rounded px-2 py-0.5 font-mono text-xs font-semibold'>
          {row.original.sortOrder}
        </span>
      ),
      size: 80,
      enableSorting: true,
    },
    {
      id: SpotlightColumnKey.isActive,
      accessorFn: (row) => (row.isActive ? 'active' : 'inactive'),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Trạng thái' />
      ),
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <Switch
            checked={row.original.isActive}
            onCheckedChange={() => onToggle(row.original)}
          />
          <span className='text-muted-foreground text-xs'>
            {row.original.isActive ? 'Đang bật' : 'Tắt'}
          </span>
        </div>
      ),
      meta: {
        variant: 'select',
        label: 'Trạng thái',
        options: [
          { label: 'Đang hiển thị (Active)', value: 'active' },
          { label: 'Đã ẩn (Inactive)', value: 'inactive' },
        ],
      },
      enableColumnFilter: true,
      enableSorting: false,
    },
    {
      id: 'actions',
      header: () => null,
      cell: ({ row }) => (
        <TableRowActions>
          <TableRowAction
            label={'Actions'}
            icon={<Edit2 className='size-3.5' />}
            onSelect={() => onEdit(row.original)}
          />
          <TableRowAction
            label={'Actions'}
            icon={<Trash2 className='size-3.5' />}
            onSelect={() => onDelete(row.original)}
            destructive
          />
        </TableRowActions>
      ),
      size: 90,
      enableSorting: false,
    },
  ]
}
