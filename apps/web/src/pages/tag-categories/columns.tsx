import type { ColumnDef } from '@tanstack/react-table'
import {
  BookOpen,
  Camera,
  Edit,
  Film,
  Flame,
  FolderTree,
  Heart,
  Layers,
  MoreHorizontal,
  Palette,
  Scissors,
  Shield,
  Shirt,
  Sparkles,
  Tag,
  Trash2,
  User,
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
import type { TagCategorySchema } from './schema'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Tag,
  Sparkles,
  User,
  Palette,
  Camera,
  Shirt,
  BookOpen,
  Heart,
  Film,
  Layers,
  Shield,
  Scissors,
  Flame,
  FolderTree,
}

function CategoryIcon({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const Component = ICON_MAP[name] || Tag
  return <Component className={className} />
}

interface GetColumnsProps {
  onEdit: (category: TagCategorySchema) => void
  onDelete: (category: TagCategorySchema) => void
}

export function getTagCategoriesColumns({
  onEdit,
  onDelete,
}: GetColumnsProps): ColumnDef<TagCategorySchema>[] {
  return [
    {
      id: 'icon',
      header: 'Biểu tượng',
      cell: ({ row }) => {
        const cat = row.original
        return (
          <div
            className='flex size-9 items-center justify-center rounded-xl shadow-xs'
            style={{
              backgroundColor: `${cat.color || '#3b82f6'}20`,
              color: cat.color || '#3b82f6',
            }}
          >
            <CategoryIcon name={cat.icon} className='size-4' />
          </div>
        )
      },
      size: 60,
      enableSorting: false,
    },
    {
      id: 'name',
      accessorFn: (row) => row.name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Tên danh mục' />
      ),
      cell: ({ row }) => {
        const cat = row.original
        return (
          <div className='max-w-[240px] min-w-0 space-y-0.5'>
            <div className='flex items-center gap-2'>
              <span className='text-foreground text-xs font-semibold'>
                {cat.name}
              </span>
              <div
                className='size-2.5 shrink-0 rounded-full'
                style={{ backgroundColor: cat.color || '#3b82f6' }}
                title={`Màu: ${cat.color}`}
              />
            </div>
            {cat.description && (
              <p className='text-muted-foreground truncate text-[11px]'>
                {cat.description}
              </p>
            )}
          </div>
        )
      },
      meta: {
        label: 'Tên danh mục',
        placeholder: 'Tìm kiếm danh mục...',
        variant: 'text',
      },
      enableSorting: true,
    },
    {
      id: 'slug',
      accessorFn: (row) => row.slug,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Slug định danh' />
      ),
      cell: ({ row }) => (
        <code className='bg-muted text-muted-foreground rounded-md px-2 py-0.5 font-mono text-[11px]'>
          {row.original.slug}
        </code>
      ),
      meta: {
        label: 'Slug',
        placeholder: 'Lọc theo slug...',
        variant: 'text',
      },
      enableSorting: true,
    },
    {
      id: 'sortOrder',
      accessorFn: (row) => row.sortOrder,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Thứ tự' />
      ),
      cell: ({ row }) => (
        <span className='text-muted-foreground font-mono text-xs'>
          {row.original.sortOrder}
        </span>
      ),
      size: 70,
      enableSorting: true,
    },
    {
      id: 'tagCount',
      header: 'Số lượng thẻ',
      cell: ({ row }) => {
        const count = row.original.tagCount ?? 0
        return (
          <Badge variant='secondary' className='font-mono text-xs'>
            {count} thẻ
          </Badge>
        )
      },
      size: 90,
      enableSorting: false,
    },
    {
      id: 'isSystem',
      accessorFn: (row) => (row.isSystem ? 'system' : 'custom'),
      header: 'Phân loại',
      cell: ({ row }) => {
        const isSystem = row.original.isSystem
        return isSystem ? (
          <Badge
            variant='outline'
            className='border-primary/40 text-primary text-[10px]'
          >
            Hệ thống
          </Badge>
        ) : (
          <Badge variant='secondary' className='text-[10px]'>
            Tùy biến
          </Badge>
        )
      },
      meta: {
        label: 'Phân loại',
        variant: 'select',
        options: [
          { label: 'Hệ thống', value: 'system' },
          { label: 'Tùy biến', value: 'custom' },
        ],
      },
      size: 90,
      enableSorting: false,
    },
    {
      id: 'isActive',
      accessorFn: (row) => (row.isActive ? 'active' : 'inactive'),
      header: 'Trạng thái',
      cell: ({ row }) => {
        const active = row.original.isActive
        return active ? (
          <Badge className='border-emerald-500/30 bg-emerald-500/15 text-[10px] text-emerald-600 dark:text-emerald-400'>
            Đang hoạt động
          </Badge>
        ) : (
          <Badge
            variant='outline'
            className='text-muted-foreground text-[10px]'
          >
            Tạm ẩn
          </Badge>
        )
      },
      meta: {
        label: 'Trạng thái',
        variant: 'select',
        options: [
          { label: 'Đang hoạt động', value: 'active' },
          { label: 'Tạm ẩn', value: 'inactive' },
        ],
      },
      size: 100,
      enableSorting: false,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const cat = row.original
        return (
          <div className='flex items-center justify-end'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='text-muted-foreground hover:text-foreground size-8'
                >
                  <MoreHorizontal className='size-4' />
                  <span className='sr-only'>Tùy chọn</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-36'>
                <DropdownMenuItem onClick={() => onEdit(cat)}>
                  <Edit className='mr-2 size-3.5' />
                  <span>Chỉnh sửa</span>
                </DropdownMenuItem>
                {!cat.isSystem && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(cat)}
                      className='text-destructive focus:text-destructive'
                    >
                      <Trash2 className='mr-2 size-3.5' />
                      <span>Xóa</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
      size: 50,
      enableSorting: false,
    },
  ]
}
