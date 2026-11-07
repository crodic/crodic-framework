import { format } from 'date-fns'
import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import {
  BadgeCheckIcon,
  EditIcon,
  EyeIcon,
  FlameIcon,
  GitMergeIcon,
  LockIcon,
  MoreHorizontalIcon,
  TrashIcon,
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
  TagCategoryBadge,
  TagSafetyBadge,
  TagStatusBadge,
} from './components/tag-badges'
import { TagColumnKey, type TagSummary } from './schema'

interface TagColumnsOptions {
  t: TFunction
  onViewStudio: (row: TagSummary) => void
  onEdit: (row: TagSummary) => void
  onMerge: (row: TagSummary) => void
  onDelete: (row: TagSummary) => void
}

export function getTagsTableColumns({
  t,
  onViewStudio,
  onEdit,
  onMerge,
  onDelete,
}: TagColumnsOptions): ColumnDef<TagSummary>[] {
  return [
    {
      id: TagColumnKey.name,
      accessorFn: (row) => row.name,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={t('tags.table.name', 'Canonical Tag')}
        />
      ),
      cell: ({ row }) => {
        const tag = row.original
        const aliasCount = tag.aliases?.length ?? 0

        return (
          <div className='flex min-w-0 flex-col gap-0.5 py-0.5'>
            <div className='flex min-w-0 items-center gap-1.5'>
              <span className='truncate font-semibold'>#{tag.name}</span>
              {tag.isOfficial && (
                <BadgeCheckIcon
                  className='text-primary size-3.5 shrink-0'
                  aria-hidden='true'
                />
              )}
              {tag.isSystem && (
                <LockIcon
                  className='text-muted-foreground size-3.5 shrink-0'
                  aria-hidden='true'
                />
              )}
              {aliasCount > 0 && (
                <Badge
                  variant='secondary'
                  className='px-1.5 py-0 text-[10px] font-normal tabular-nums'
                >
                  +{aliasCount} alias
                </Badge>
              )}
            </div>
            <div className='text-muted-foreground flex min-w-0 items-center gap-2 text-xs'>
              <span className='truncate font-mono text-[11px]'>
                /{tag.slug}
              </span>
              {tag.translatedName && tag.translatedName !== tag.name && (
                <span className='truncate'>· {tag.translatedName}</span>
              )}
            </div>
          </div>
        )
      },
      enableColumnFilter: true,
      meta: {
        label: t('tags.table.name', 'Canonical Tag'),
        placeholder: t(
          'tags.table.searchPlaceholder',
          'Search canonical name, alias, translation...'
        ),
        variant: 'text',
      },
    },
    {
      id: TagColumnKey.category,
      accessorFn: (row) => row.category,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={t('tags.table.category', 'Category')}
        />
      ),
      cell: ({ row }) => <TagCategoryBadge category={row.original.category} />,
      enableColumnFilter: true,
      meta: {
        label: t('tags.table.category', 'Category'),
        variant: 'select',
        options: [
          { label: t('tags.category.general', 'General'), value: 'general' },
          {
            label: t('tags.category.copyright', 'Copyright / Series'),
            value: 'copyright',
          },
          {
            label: t('tags.category.character', 'Character'),
            value: 'character',
          },
          { label: t('tags.category.artist', 'Artist'), value: 'artist' },
          { label: t('tags.category.meta', 'Meta'), value: 'meta' },
          { label: t('tags.category.system', 'System'), value: 'system' },
        ],
      },
    },
    {
      id: TagColumnKey.safetyRating,
      accessorFn: (row) => row.safetyRating,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={t('tags.table.safety', 'Safety Rating')}
        />
      ),
      cell: ({ row }) => (
        <TagSafetyBadge safetyRating={row.original.safetyRating} />
      ),
      enableColumnFilter: true,
      meta: {
        label: t('tags.table.safety', 'Safety Rating'),
        variant: 'select',
        options: [
          { label: t('tags.safety.safe', 'Safe'), value: 'safe' },
          {
            label: t('tags.safety.sensitive', 'Sensitive'),
            value: 'sensitive',
          },
          { label: t('tags.safety.r18', 'R-18'), value: 'r18' },
          { label: t('tags.safety.r18g', 'R-18G'), value: 'r18g' },
        ],
      },
    },
    {
      id: TagColumnKey.status,
      accessorFn: (row) => row.status,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={t('tags.table.status', 'Status')}
        />
      ),
      cell: ({ row }) => <TagStatusBadge status={row.original.status} />,
      enableColumnFilter: true,
      meta: {
        label: t('tags.table.status', 'Status'),
        variant: 'select',
        options: [
          { label: t('tags.status.active', 'Active'), value: 'active' },
          { label: t('tags.status.pending', 'Pending'), value: 'pending' },
          { label: t('tags.status.merged', 'Merged'), value: 'merged' },
          { label: t('tags.status.banned', 'Banned'), value: 'banned' },
        ],
      },
    },
    {
      id: TagColumnKey.usageCount,
      accessorFn: (row) => row.usageCount,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={t('tags.table.usageCount', 'Usage')}
        />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-xs font-medium tabular-nums'>
          {row.original.usageCount.toLocaleString()}
        </span>
      ),
    },
    {
      id: TagColumnKey.trendingScore,
      accessorFn: (row) => row.trendingScore,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={t('tags.table.trendingScore', 'Trending')}
        />
      ),
      cell: ({ row }) => (
        <div className='inline-flex items-center gap-1 font-mono text-xs tabular-nums'>
          {row.original.trendingScore > 0 && (
            <FlameIcon className='size-3.5 text-amber-500' aria-hidden='true' />
          )}
          <span>{row.original.trendingScore.toFixed(1)}</span>
        </div>
      ),
    },
    {
      id: 'locales',
      accessorFn: (row) =>
        row.translations?.map((item) => item.locale).join(', ') ?? '',
      header: () => (
        <span className='text-xs font-medium'>
          {t('tags.table.locales', 'Locales')}
        </span>
      ),
      cell: ({ row }) => {
        const locales = Array.from(
          new Set(row.original.translations?.map((tr) => tr.locale) ?? [])
        )
        if (locales.length === 0) {
          return <span className='text-muted-foreground text-xs'>—</span>
        }
        return (
          <div className='flex flex-wrap gap-1'>
            {locales.map((loc) => (
              <Badge
                key={loc}
                variant='outline'
                className='px-1.5 py-0 text-[10px] uppercase'
              >
                {loc}
              </Badge>
            ))}
          </div>
        )
      },
      enableSorting: false,
    },
    {
      id: TagColumnKey.updatedAt,
      accessorFn: (row) => row.updatedAt,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={t('tags.table.updatedAt', 'Updated At')}
        />
      ),
      cell: ({ row }) => (
        <span className='text-muted-foreground text-xs whitespace-nowrap tabular-nums'>
          {format(new Date(row.original.updatedAt), 'dd/MM/yyyy HH:mm')}
        </span>
      ),
    },
    {
      id: 'actions',
      size: 56,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const tag = row.original
        return (
          <div
            className='flex justify-end'
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='size-8'
                  aria-label={`Actions for tag ${tag.name}`}
                >
                  <MoreHorizontalIcon className='size-4' aria-hidden='true' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-48'>
                <DropdownMenuItem onClick={() => onViewStudio(tag)}>
                  <EyeIcon className='size-4' aria-hidden='true' />
                  {t('tags.actions.openStudio', 'Open Governance Studio')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(tag)}>
                  <EditIcon className='size-4' aria-hidden='true' />
                  {t('buttons.edit', 'Edit')}
                </DropdownMenuItem>
                {!tag.isSystem && tag.status !== 'merged' && (
                  <DropdownMenuItem onClick={() => onMerge(tag)}>
                    <GitMergeIcon className='size-4' aria-hidden='true' />
                    {t('tags.actions.mergeTag', 'Merge Into Tag...')}
                  </DropdownMenuItem>
                )}
                {!tag.isSystem && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className='text-destructive focus:text-destructive'
                      onClick={() => onDelete(tag)}
                    >
                      <TrashIcon className='size-4' aria-hidden='true' />
                      {t('buttons.delete', 'Delete')}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
