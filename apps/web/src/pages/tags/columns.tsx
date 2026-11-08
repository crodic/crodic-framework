import { useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import type { ColumnDef } from '@tanstack/react-table'
import { vi } from 'date-fns/locale'
import type { TFunction } from 'i18next'
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  CheckIcon,
  ClockIcon,
  CopyIcon,
  EditIcon,
  EyeIcon,
  FlameIcon,
  GitMergeIcon,
  LayersIcon,
  LockIcon,
  MoreHorizontalIcon,
  ShieldCheckIcon,
  TrashIcon,
} from 'lucide-react'
import { toast } from 'sonner'
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
  AuditActionBadge,
  TagCategoryBadge,
  TagSafetyBadge,
  TagStatusBadge,
} from './components/tag-badges'
import { TagColumnKey, type EntityTagLog, type TagSummary } from './schema'

interface TagColumnsOptions {
  t: TFunction
  onViewStudio: (row: TagSummary) => void
  onEdit: (row: TagSummary) => void
  onMerge: (row: TagSummary) => void
  onDelete: (row: TagSummary) => void
}

function TagNameCell({ tag, t }: { tag: TagSummary; t: TFunction }) {
  const [copied, setCopied] = useState(false)
  const aliasCount = tag.aliases?.length ?? 0

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(tag.name)
    setCopied(true)
    toast.success(t('tags.actions.copied', 'Copied to clipboard'))
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className='group/tag flex min-w-0 flex-col gap-0.5 py-0.5'>
      <div className='flex min-w-0 items-center gap-1.5'>
        <span className='text-foreground group-hover/tag:text-primary truncate font-semibold transition-colors'>
          #{tag.name}
        </span>
        <button
          type='button'
          onClick={handleCopy}
          aria-label={t('tags.actions.copyName', 'Copy tag name')}
          className='text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 cursor-pointer rounded-sm p-0.5 opacity-0 transition-opacity group-hover/tag:opacity-100 focus-visible:opacity-100'
        >
          {copied ? (
            <CheckIcon className='size-3 text-emerald-500' aria-hidden='true' />
          ) : (
            <CopyIcon className='size-3' aria-hidden='true' />
          )}
        </button>
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
        <span className='truncate font-mono text-[11px]'>/{tag.slug}</span>
        {tag.translatedName && tag.translatedName !== tag.name && (
          <span className='truncate'>· {tag.translatedName}</span>
        )}
      </div>
    </div>
  )
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
      cell: ({ row }) => <TagNameCell tag={row.original} t={t} />,
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
        <span className='text-foreground/90 font-mono text-xs font-semibold tabular-nums'>
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
          {row.original.trendingScore > 0 ? (
            <span className='inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400'>
              <FlameIcon className='size-3.5 shrink-0' aria-hidden='true' />
              {row.original.trendingScore.toFixed(1)}
            </span>
          ) : (
            <span className='text-muted-foreground'>0.0</span>
          )}
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
                className='bg-muted/40 px-1.5 py-0 font-mono text-[10px] uppercase'
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

interface AuditColumnsOptions {
  t: TFunction
  locale?: string
  onNavigateToTag?: (tagId: string) => void
}

export function getAuditLogsTableColumns({
  t,
  locale = 'vi',
  onNavigateToTag,
}: AuditColumnsOptions): ColumnDef<EntityTagLog>[] {
  return [
    {
      id: 'action',
      accessorKey: 'action',
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={t('tags.audit.action', 'Hành động')}
        />
      ),
      cell: ({ row }) => <AuditActionBadge action={row.original.action} />,
    },
    {
      id: 'tagNameSnapshot',
      accessorKey: 'tagNameSnapshot',
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={t('tags.audit.tagSnapshot', 'Ảnh chụp thẻ')}
        />
      ),
      cell: ({ row }) => {
        const log = row.original
        const hasDiff =
          log.tagNameSnapshot && log.tagNameSnapshot.includes('->')
        const [oldTag, newTag] = hasDiff
          ? log.tagNameSnapshot!.split('->').map((s) => s.trim())
          : [log.tagNameSnapshot, null]

        if (hasDiff && oldTag && newTag) {
          return (
            <div className='inline-flex items-center gap-1.5 text-xs font-medium'>
              <span className='bg-muted text-muted-foreground rounded px-2 py-0.5 font-mono text-[11px] line-through'>
                {oldTag.startsWith('#') ? oldTag : `#${oldTag}`}
              </span>
              <ArrowRightIcon
                className='text-primary size-3 shrink-0'
                aria-hidden='true'
              />
              <button
                type='button'
                disabled={!log.tagId}
                onClick={(e) => {
                  e.stopPropagation()
                  if (log.tagId && onNavigateToTag) {
                    onNavigateToTag(log.tagId)
                  }
                }}
                className='bg-primary/10 text-primary cursor-pointer rounded px-2 py-0.5 font-mono text-[11px] font-semibold hover:underline disabled:no-underline'
              >
                {newTag.startsWith('#') ? newTag : `#${newTag}`}
              </button>
            </div>
          )
        }

        if (log.tagNameSnapshot) {
          return (
            <button
              type='button'
              disabled={!log.tagId}
              onClick={(e) => {
                e.stopPropagation()
                if (log.tagId && onNavigateToTag) {
                  onNavigateToTag(log.tagId)
                }
              }}
              className='border-border/70 bg-card text-foreground hover:border-primary hover:text-primary disabled:hover:border-border/70 disabled:hover:text-foreground inline-flex cursor-pointer items-center rounded-lg border px-2.5 py-1 font-mono text-xs font-semibold transition-colors disabled:no-underline'
            >
              {log.tagNameSnapshot.startsWith('#')
                ? log.tagNameSnapshot
                : `#${log.tagNameSnapshot}`}
            </button>
          )
        }

        return (
          <span className='text-muted-foreground text-xs italic'>
            {t('tags.audit.entityConfig', 'Cấu hình thực thể')}
          </span>
        )
      },
    },
    {
      id: 'entityType',
      accessorKey: 'entityType',
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={t('tags.audit.targetEntity', 'Thực thể đích')}
        />
      ),
      cell: ({ row }) => (
        <div className='bg-muted/50 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-xs'>
          <LayersIcon
            className='text-muted-foreground size-3'
            aria-hidden='true'
          />
          <span className='text-foreground font-semibold'>
            {row.original.entityType}
          </span>
          <span className='text-muted-foreground'>
            #{row.original.entityId}
          </span>
        </div>
      ),
    },
    {
      id: 'actorName',
      accessorKey: 'actorName',
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={t('tags.audit.actor', 'Người thực hiện')}
        />
      ),
      cell: ({ row }) => {
        const log = row.original
        const initials = (log.actorName || (log.isAdminAction ? 'AD' : 'US'))
          .slice(0, 2)
          .toUpperCase()

        return (
          <div className='inline-flex items-center gap-2 text-xs'>
            <div className='bg-muted text-foreground flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold'>
              {initials}
            </div>
            <div className='flex items-center gap-1.5'>
              {log.isAdminAction && (
                <ShieldCheckIcon
                  className='text-primary size-3.5 shrink-0'
                  aria-hidden='true'
                />
              )}
              <span className='text-foreground font-medium'>
                {log.actorName ||
                  (log.isAdminAction
                    ? t('tags.audit.adminUser', 'Quản trị viên')
                    : t('tags.audit.communityUser', 'Thành viên cộng đồng'))}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={t('tags.audit.timestamp', 'Thời gian')}
          className='justify-end'
        />
      ),
      cell: ({ row }) => {
        const logDate = new Date(row.original.createdAt)
        const isVi = locale === 'vi'
        return (
          <div className='flex flex-col items-end gap-0.5 text-xs tabular-nums'>
            <span className='text-foreground font-semibold'>
              {formatDistanceToNow(logDate, {
                addSuffix: true,
                locale: isVi ? vi : undefined,
              })}
            </span>
            <span className='text-muted-foreground inline-flex items-center gap-1 text-[10px]'>
              <ClockIcon className='size-2.5 opacity-60' aria-hidden='true' />
              {format(logDate, 'dd/MM/yyyy • HH:mm:ss')}
            </span>
          </div>
        )
      },
    },
  ]
}
