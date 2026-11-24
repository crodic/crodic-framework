import type { ColumnDef } from '@tanstack/react-table'
import i18n from '@/i18n'
import {
  Eye,
  Heart,
  Images,
  MessageSquare,
  MoreHorizontal,
  ShieldAlert,
  ShieldCheck,
  Star,
  Trash2,
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
import { Switch } from '@/components/ui/switch'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { PostColumnKey, type Post } from './schema'

interface GetPostColumnsProps {
  onView: (post: Post) => void
  onStatusChange: (post: Post) => void
  onToggleFeature: (post: Post, isFeatured: boolean) => void
  onDelete: (post: Post) => void
}

export function getPostsTableColumns({
  onView,
  onStatusChange,
  onToggleFeature,
  onDelete,
}: GetPostColumnsProps): ColumnDef<Post>[] {
  return [
    {
      id: PostColumnKey.id,
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
      id: PostColumnKey.title,
      accessorFn: (row) => row.title,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={i18n.t('posts.columns.title', 'Tác phẩm & Bộ ảnh')}
        />
      ),
      cell: ({ row }) => (
        <div className='flex max-w-[340px] items-center gap-3'>
          <img
            src={row.original.coverImageUrl}
            alt={row.original.title}
            className='bg-muted size-12 shrink-0 rounded-md border object-cover'
            onError={(e) => {
              ;(e.target as HTMLElement).style.display = 'none'
            }}
          />
          <div className='flex min-w-0 flex-col'>
            <div className='flex items-center gap-1.5'>
              <span
                onClick={() => onView(row.original)}
                className='text-foreground line-clamp-1 cursor-pointer text-sm font-semibold hover:underline'
              >
                {row.original.title}
              </span>
            </div>
            <div className='text-muted-foreground mt-0.5 flex items-center gap-1.5 truncate text-xs'>
              <Badge
                variant='outline'
                className='px-1 py-0 text-[10px] uppercase'
              >
                {i18n.t(`posts.categories.${row.original.albumCategory}`, {
                  defaultValue:
                    row.original.albumCategoryLabel ||
                    row.original.albumCategory,
                })}
              </Badge>
              {row.original.characterName && (
                <span className='truncate'>
                  {row.original.characterName}
                  {row.original.fandomName
                    ? ` • ${row.original.fandomName}`
                    : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
      meta: {
        label: i18n.t('posts.columns.title', 'Tác phẩm & Bộ ảnh'),
        placeholder: i18n.t('posts.filter.searchTitle', 'Tìm kiếm tác phẩm...'),
        variant: 'text',
      },
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      id: PostColumnKey.author,
      accessorFn: (row) => row.author.displayName,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={i18n.t('posts.columns.author', 'Cosplayer / Tác giả')}
        />
      ),
      cell: ({ row }) => {
        const author = row.original.author
        return (
          <div className='flex max-w-[200px] items-center gap-2'>
            <div className='bg-muted flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold'>
              {author.avatarUrl ? (
                <img
                  src={author.avatarUrl}
                  alt={author.displayName}
                  className='size-full object-cover'
                />
              ) : (
                author.displayName.charAt(0).toUpperCase()
              )}
            </div>
            <div className='flex min-w-0 flex-col'>
              <div className='flex items-center gap-1 truncate text-xs font-medium'>
                <span className='truncate'>{author.displayName}</span>
                {author.isVerified && (
                  <ShieldCheck className='size-3.5 shrink-0 text-sky-500' />
                )}
              </div>
              <span className='text-muted-foreground truncate text-[10px]'>
                {author.handle}
              </span>
            </div>
          </div>
        )
      },
      enableSorting: false,
    },
    {
      id: PostColumnKey.metrics,
      accessorFn: (row) => row.likesCount,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={i18n.t('posts.columns.engagement', 'Tương tác')}
        />
      ),
      cell: ({ row }) => (
        <div className='text-muted-foreground flex items-center gap-3 text-xs'>
          <span className='flex items-center gap-1' title='Lượt thích'>
            <Heart className='size-3.5 text-rose-500' />
            {row.original.likesCount}
          </span>
          <span className='flex items-center gap-1' title='Bình luận'>
            <MessageSquare className='size-3.5 text-blue-500' />
            {row.original.commentsCount}
          </span>
          <span className='flex items-center gap-1' title='Lượt xem'>
            <Eye className='size-3.5 text-emerald-500' />
            {row.original.viewsCount}
          </span>
          <span className='flex items-center gap-1' title='Số lượng ảnh'>
            <Images className='size-3.5 text-amber-500' />
            {row.original.photosCount}
          </span>
        </div>
      ),
      enableSorting: true,
    },
    {
      id: PostColumnKey.isFeaturedWork,
      accessorFn: (row) => row.isFeaturedWork,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={i18n.t('posts.columns.featured', 'Nổi bật')}
        />
      ),
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <Switch
            checked={row.original.isFeaturedWork}
            onCheckedChange={(checked) =>
              onToggleFeature(row.original, checked)
            }
          />
          {row.original.isFeaturedWork && (
            <Star className='size-4 fill-amber-500 text-amber-500' />
          )}
        </div>
      ),
      meta: {
        label: i18n.t('posts.columns.featured', 'Nổi bật'),
        variant: 'select',
        options: [
          {
            label: i18n.t('common.featured', 'Nổi bật'),
            value: 'true',
          },
          {
            label: i18n.t('common.standard', 'Thường'),
            value: 'false',
          },
        ],
      },
      enableColumnFilter: true,
      enableSorting: false,
    },
    {
      id: PostColumnKey.status,
      accessorFn: (row) => row.status,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={i18n.t('posts.columns.status', 'Trạng thái')}
        />
      ),
      cell: ({ row }) => {
        const status = row.original.status
        if (status === 'published') {
          return (
            <Badge className='border-emerald-500/20 bg-emerald-500/15 text-xs text-emerald-700 dark:text-emerald-300'>
              {i18n.t('posts.status.published', 'Đã xuất bản')}
            </Badge>
          )
        }
        if (status === 'pending_review') {
          return (
            <Badge className='border-amber-500/20 bg-amber-500/15 text-xs text-amber-700 dark:text-amber-300'>
              {i18n.t('posts.status.pending_review', 'Chờ duyệt')}
            </Badge>
          )
        }
        if (status === 'hidden') {
          return (
            <Badge className='border-rose-500/20 bg-rose-500/15 text-xs text-rose-700 dark:text-rose-300'>
              {i18n.t('posts.status.hidden', 'Bị ẩn / Vi phạm')}
            </Badge>
          )
        }
        return (
          <Badge variant='outline' className='text-muted-foreground text-xs'>
            {i18n.t('posts.status.draft', 'Bản nháp')}
          </Badge>
        )
      },
      meta: {
        label: i18n.t('posts.columns.status', 'Trạng thái'),
        variant: 'select',
        options: [
          {
            label: i18n.t('posts.status.published', 'Đã xuất bản'),
            value: 'published',
          },
          {
            label: i18n.t('posts.status.pending_review', 'Chờ duyệt'),
            value: 'pending_review',
          },
          {
            label: i18n.t('posts.status.hidden', 'Bị ẩn / Vi phạm'),
            value: 'hidden',
          },
          {
            label: i18n.t('posts.status.draft', 'Bản nháp'),
            value: 'draft',
          },
        ],
      },
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const post = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon' className='size-8'>
                <MoreHorizontal className='size-4' />
                <span className='sr-only'>
                  {i18n.t('common.actions', 'Hành động')}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => onView(post)}>
                <Eye className='mr-2 size-4' />
                {i18n.t('posts.actions.view', 'Xem chi tiết & Album')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(post)}>
                <ShieldAlert className='mr-2 size-4' />
                {i18n.t('posts.actions.moderate', 'Kiểm duyệt trạng thái')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='text-destructive focus:text-destructive'
                onClick={() => onDelete(post)}
              >
                <Trash2 className='mr-2 size-4' />
                {i18n.t('posts.actions.delete', 'Xóa bài đăng')}
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
