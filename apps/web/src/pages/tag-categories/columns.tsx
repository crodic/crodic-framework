import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import {
  BookOpen,
  Camera,
  Edit,
  Film,
  Flame,
  FolderTree,
  Heart,
  Layers,
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
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import {
  TableRowAction,
  TableRowActions,
} from '@/components/data-table/table-row-actions'
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
  t: TFunction
  onEdit: (category: TagCategorySchema) => void
  onDelete: (category: TagCategorySchema) => void
}

export function getTagCategoriesColumns({
  t,
  onEdit,
  onDelete,
}: GetColumnsProps): ColumnDef<TagCategorySchema>[] {
  return [
    {
      id: 'icon',
      header: t('tagCategories.columns.icon', 'Biểu tượng'),
      cell: ({ row }) => {
        const cat = row.original
        return (
          <div
            className='border-border/40 flex size-8 items-center justify-center rounded-lg border'
            style={{
              backgroundColor: `${cat.color || '#3b82f6'}15`,
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
        <DataTableColumnHeader
          column={column}
          label={t('tagCategories.columns.name', 'Tên danh mục')}
        />
      ),
      cell: ({ row }) => {
        const cat = row.original
        const localizedName = t(`tagCategories.items.${cat.slug}.name`, {
          defaultValue: cat.name,
        })
        const localizedDesc = cat.description
          ? t(`tagCategories.items.${cat.slug}.description`, {
              defaultValue: cat.description,
            })
          : null

        return (
          <div className='max-w-[240px] min-w-0 space-y-0.5'>
            <div className='flex items-center gap-2'>
              <span className='text-foreground text-xs font-semibold'>
                {localizedName}
              </span>
              <div
                className='size-2.5 shrink-0 rounded-full'
                style={{ backgroundColor: cat.color || '#3b82f6' }}
                title={`Color: ${cat.color}`}
              />
            </div>
            {localizedDesc && (
              <p className='text-muted-foreground truncate text-[11px]'>
                {localizedDesc}
              </p>
            )}
          </div>
        )
      },
      meta: {
        label: t('tagCategories.columns.name', 'Tên danh mục'),
        placeholder: t(
          'tagCategories.search.namePlaceholder',
          'Tìm kiếm danh mục...'
        ),
        variant: 'text',
      },
      enableSorting: true,
    },
    {
      id: 'slug',
      accessorFn: (row) => row.slug,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={t('tagCategories.columns.slug', 'Slug định danh')}
        />
      ),
      cell: ({ row }) => (
        <code className='bg-muted text-muted-foreground rounded-md px-2 py-0.5 font-mono text-[11px]'>
          {row.original.slug}
        </code>
      ),
      meta: {
        label: t('tagCategories.columns.slug', 'Slug định danh'),
        placeholder: t(
          'tagCategories.search.slugPlaceholder',
          'Lọc theo slug...'
        ),
        variant: 'text',
      },
      enableSorting: true,
    },
    {
      id: 'sortOrder',
      accessorFn: (row) => row.sortOrder,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={t('tagCategories.columns.sortOrder', 'Thứ tự')}
        />
      ),
      cell: ({ row }) => (
        <span className='text-muted-foreground font-mono text-xs tabular-nums'>
          {row.original.sortOrder}
        </span>
      ),
      size: 70,
      enableSorting: true,
    },
    {
      id: 'tagCount',
      header: t('tagCategories.columns.tagCount', 'Số lượng thẻ'),
      cell: ({ row }) => {
        const count = row.original.tagCount ?? 0
        return (
          <Badge variant='secondary' className='font-mono text-xs tabular-nums'>
            {t('tagCategories.tagUnit', {
              count,
              defaultValue: `${count} thẻ`,
            })}
          </Badge>
        )
      },
      size: 90,
      enableSorting: false,
    },
    {
      id: 'isSystem',
      accessorFn: (row) => (row.isSystem ? 'system' : 'custom'),
      header: t('tagCategories.columns.type', 'Phân loại'),
      cell: ({ row }) => {
        const isSystem = row.original.isSystem
        return isSystem ? (
          <Badge
            variant='outline'
            className='border-primary/40 text-primary text-[10px]'
          >
            {t('tagCategories.types.system', 'Hệ thống')}
          </Badge>
        ) : (
          <Badge variant='secondary' className='text-[10px]'>
            {t('tagCategories.types.custom', 'Tùy biến')}
          </Badge>
        )
      },
      meta: {
        label: t('tagCategories.columns.type', 'Phân loại'),
        variant: 'select',
        options: [
          {
            label: t('tagCategories.types.system', 'Hệ thống'),
            value: 'system',
          },
          {
            label: t('tagCategories.types.custom', 'Tùy biến'),
            value: 'custom',
          },
        ],
      },
      size: 90,
      enableSorting: false,
    },
    {
      id: 'isActive',
      accessorFn: (row) => (row.isActive ? 'active' : 'inactive'),
      header: t('tagCategories.columns.status', 'Trạng thái'),
      cell: ({ row }) => {
        const active = row.original.isActive
        return active ? (
          <Badge className='border-primary/30 bg-primary/15 text-primary dark:text-primary text-[10px]'>
            {t('tagCategories.status.active', 'Đang hoạt động')}
          </Badge>
        ) : (
          <Badge
            variant='outline'
            className='text-muted-foreground text-[10px]'
          >
            {t('tagCategories.status.inactive', 'Tạm ẩn')}
          </Badge>
        )
      },
      meta: {
        label: t('tagCategories.columns.status', 'Trạng thái'),
        variant: 'select',
        options: [
          {
            label: t('tagCategories.status.active', 'Đang hoạt động'),
            value: 'active',
          },
          {
            label: t('tagCategories.status.inactive', 'Tạm ẩn'),
            value: 'inactive',
          },
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
          <TableRowActions>
            <TableRowAction
              label={
                <>
                  <span>{t('tagCategories.actions.edit', 'Chỉnh sửa')}</span>
                </>
              }
              icon={<Edit className='mr-2 size-3.5' />}
              onSelect={() => onEdit(cat)}
            />
            {!cat.isSystem && (
              <>
                <TableRowAction
                  label={
                    <>
                      <span>{t('tagCategories.actions.delete', 'Xóa')}</span>
                    </>
                  }
                  icon={<Trash2 className='mr-2 size-3.5' />}
                  onSelect={() => onDelete(cat)}
                  destructive
                />
              </>
            )}
          </TableRowActions>
        )
      },
      size: 50,
      enableSorting: false,
    },
  ]
}
