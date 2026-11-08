import {
  BadgeCheckIcon,
  GitMergeIcon,
  LockIcon,
  PlusIcon,
  ShieldAlertIcon,
  UnlockIcon,
  XIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { TagCategory, TagSafetyRating, TagStatus } from '../schema'

export const TAG_CATEGORY_GRADIENTS: Record<TagCategory, string> = {
  general:
    'from-sky-500/20 via-indigo-500/10 to-purple-500/5 dark:from-sky-950/50 dark:via-indigo-950/30 dark:to-transparent',
  copyright:
    'from-violet-600/20 via-purple-600/10 to-fuchsia-500/5 dark:from-violet-950/50 dark:via-purple-950/30 dark:to-transparent',
  character:
    'from-emerald-600/20 via-teal-600/10 to-cyan-500/5 dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-transparent',
  artist:
    'from-amber-600/20 via-orange-600/10 to-yellow-500/5 dark:from-amber-950/50 dark:via-orange-950/30 dark:to-transparent',
  meta: 'from-blue-600/20 via-indigo-600/10 to-slate-500/5 dark:from-blue-950/50 dark:via-indigo-950/30 dark:to-transparent',
  system:
    'from-rose-600/20 via-pink-600/10 to-red-500/5 dark:from-rose-950/50 dark:via-pink-950/30 dark:to-transparent',
}

export const TAG_CATEGORY_ACCENTS: Record<TagCategory, string> = {
  general: 'text-sky-600 dark:text-sky-400',
  copyright: 'text-violet-600 dark:text-violet-400',
  character: 'text-emerald-600 dark:text-emerald-400',
  artist: 'text-amber-600 dark:text-amber-400',
  meta: 'text-blue-600 dark:text-blue-400',
  system: 'text-rose-600 dark:text-rose-400',
}

const CATEGORY_STYLES: Record<
  TagCategory,
  {
    dot: string
    badge: string
    chip: string
    counter: string
    text: string
  }
> = {
  general: {
    dot: 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]',
    badge:
      'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300',
    chip: 'border-sky-200/80 bg-sky-50/70 text-sky-950 hover:bg-sky-100/60 hover:border-sky-300 dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-100 dark:hover:bg-sky-950/60',
    counter:
      'bg-sky-100/90 text-sky-800 border-sky-200/80 dark:bg-sky-900/60 dark:text-sky-200 dark:border-sky-800/60',
    text: 'text-sky-800 dark:text-sky-200',
  },
  copyright: {
    dot: 'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]',
    badge:
      'border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-900/70 dark:bg-violet-950/60 dark:text-violet-200',
    chip: 'border-violet-200/80 bg-violet-50/70 text-violet-950 hover:bg-violet-100/60 hover:border-violet-300 dark:border-violet-800/60 dark:bg-violet-950/40 dark:text-violet-100 dark:hover:bg-violet-950/60',
    counter:
      'bg-violet-100/90 text-violet-800 border-violet-200/80 dark:bg-violet-900/60 dark:text-violet-200 dark:border-violet-800/60',
    text: 'text-violet-800 dark:text-violet-200',
  },
  character: {
    dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    badge:
      'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/70 dark:bg-emerald-950/60 dark:text-emerald-200',
    chip: 'border-emerald-200/80 bg-emerald-50/70 text-emerald-950 hover:bg-emerald-100/60 hover:border-emerald-300 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-100 dark:hover:bg-emerald-950/60',
    counter:
      'bg-emerald-100/90 text-emerald-800 border-emerald-200/80 dark:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-800/60',
    text: 'text-emerald-800 dark:text-emerald-200',
  },
  artist: {
    dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
    badge:
      'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/60 dark:text-amber-200',
    chip: 'border-amber-200/80 bg-amber-50/70 text-amber-950 hover:bg-amber-100/60 hover:border-amber-300 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-950/60',
    counter:
      'bg-amber-100/90 text-amber-800 border-amber-200/80 dark:bg-amber-900/60 dark:text-amber-200 dark:border-amber-800/60',
    text: 'text-amber-800 dark:text-amber-200',
  },
  meta: {
    dot: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]',
    badge:
      'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/70 dark:bg-blue-950/60 dark:text-blue-200',
    chip: 'border-blue-200/80 bg-blue-50/70 text-blue-950 hover:bg-blue-100/60 hover:border-blue-300 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-100 dark:hover:bg-blue-950/60',
    counter:
      'bg-blue-100/90 text-blue-800 border-blue-200/80 dark:bg-blue-900/60 dark:text-blue-200 dark:border-blue-800/60',
    text: 'text-blue-800 dark:text-blue-200',
  },
  system: {
    dot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]',
    badge:
      'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/70 dark:bg-rose-950/60 dark:text-rose-200',
    chip: 'border-rose-200/80 bg-rose-50/70 text-rose-950 hover:bg-rose-100/60 hover:border-rose-300 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-100 dark:hover:bg-rose-950/60',
    counter:
      'bg-rose-100/90 text-rose-800 border-rose-200/80 dark:bg-rose-900/60 dark:text-rose-200 dark:border-rose-800/60',
    text: 'text-rose-800 dark:text-rose-200',
  },
}

const SAFETY_STYLES: Record<TagSafetyRating, string> = {
  safe: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300',
  sensitive:
    'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300',
  r18: 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300',
  r18g: 'border-red-300 bg-red-100 text-red-950 dark:border-red-900 dark:bg-red-950/80 dark:text-red-200',
}

const STATUS_STYLES: Record<TagStatus, string> = {
  active:
    'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200',
  pending:
    'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200',
  merged:
    'border-indigo-200 bg-indigo-50 text-indigo-900 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200',
  banned:
    'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200',
}

export function TagCategoryBadge({
  category,
  className,
}: {
  category: TagCategory
  className?: string
}) {
  const { t } = useTranslation()
  const style = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.general

  return (
    <Badge
      variant='outline'
      className={cn(
        'gap-1.5 font-medium whitespace-nowrap',
        style.badge,
        className
      )}
    >
      <span
        className={cn('size-1.5 shrink-0 rounded-full', style.dot)}
        aria-hidden='true'
      />
      <span>{t(`tags.category.${category}`, category)}</span>
    </Badge>
  )
}

export function TagSafetyBadge({
  safetyRating,
  className,
}: {
  safetyRating: TagSafetyRating
  className?: string
}) {
  const { t } = useTranslation()
  const isRestricted = safetyRating === 'r18' || safetyRating === 'r18g'

  return (
    <Badge
      variant='outline'
      className={cn(
        'gap-1 font-medium whitespace-nowrap',
        SAFETY_STYLES[safetyRating],
        className
      )}
    >
      {isRestricted && (
        <ShieldAlertIcon className='size-3 shrink-0' aria-hidden='true' />
      )}
      <span>
        {t(`tags.safety.${safetyRating}`, safetyRating.toUpperCase())}
      </span>
    </Badge>
  )
}

export function TagStatusBadge({
  status,
  className,
}: {
  status: TagStatus
  className?: string
}) {
  const { t } = useTranslation()
  return (
    <Badge
      variant='outline'
      className={cn(
        'font-medium whitespace-nowrap',
        STATUS_STYLES[status],
        className
      )}
    >
      {t(`tags.status.${status}`, status)}
    </Badge>
  )
}

export function AuditActionBadge({
  action,
  className,
}: {
  action: string
  className?: string
}) {
  const { t } = useTranslation()
  const norm = action.toLowerCase()
  let style = 'border-border/80 bg-muted/60 text-foreground'
  let Icon = null

  if (norm.includes('merge')) {
    style =
      'border-purple-200/80 bg-purple-50/80 text-purple-700 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300'
    Icon = GitMergeIcon
  } else if (
    norm.includes('attach') ||
    norm.includes('add') ||
    norm.includes('create')
  ) {
    style =
      'border-emerald-200/80 bg-emerald-50/80 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
    Icon = PlusIcon
  } else if (
    norm.includes('detach') ||
    norm.includes('remove') ||
    norm.includes('delete')
  ) {
    style =
      'border-rose-200/80 bg-rose-50/80 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300'
    Icon = XIcon
  } else if (norm.includes('unlock')) {
    style =
      'border-sky-200/80 bg-sky-50/80 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300'
    Icon = UnlockIcon
  } else if (norm.includes('lock') || norm.includes('freeze')) {
    style =
      'border-amber-200/80 bg-amber-50/80 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300'
    Icon = LockIcon
  }

  return (
    <Badge
      variant='outline'
      className={cn(
        'inline-flex items-center gap-1 font-mono text-[10px] font-bold tracking-wider whitespace-nowrap uppercase shadow-2xs',
        style,
        className
      )}
    >
      {Icon && <Icon className='size-2.5' aria-hidden='true' />}
      <span>{t(`tags.auditAction.${norm}`, action)}</span>
    </Badge>
  )
}

export function TagNodeChip({
  name,
  translatedName,
  category,
  isOfficial,
  isSystem,
  usageCount,
  onClick,
  onUnlink,
  trailingAction,
  className,
}: {
  name: string
  translatedName?: string | null
  category: TagCategory
  isOfficial?: boolean
  isSystem?: boolean
  usageCount?: number
  onClick?: () => void
  onUnlink?: () => void
  trailingAction?: React.ReactNode
  className?: string
}) {
  const { t } = useTranslation()
  const style = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.general
  const showSecondary =
    Boolean(translatedName) && translatedName?.trim() !== name.trim()

  return (
    <div
      className={cn(
        'group/chip inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs whitespace-nowrap shadow-2xs transition-all hover:shadow-xs',
        style.chip,
        onClick && 'cursor-pointer',
        className
      )}
    >
      <button
        type='button'
        onClick={onClick}
        disabled={!onClick}
        className={cn(
          'inline-flex min-w-0 cursor-pointer items-center gap-1.5 text-left focus-visible:outline-none',
          onClick && 'hover:opacity-85'
        )}
      >
        <span
          className={cn(
            'size-1.5 shrink-0 rounded-full ring-2 ring-current/25',
            style.dot
          )}
          aria-hidden='true'
        />
        <span className='max-w-44 truncate font-semibold tracking-tight'>
          <span className='mr-0.5 text-[11px] font-bold opacity-60'>#</span>
          {name}
        </span>
        {showSecondary && (
          <span className='max-w-36 truncate text-[11px] font-normal opacity-70'>
            • {translatedName}
          </span>
        )}
        {isOfficial && (
          <BadgeCheckIcon
            className='text-primary drop-shadow-2xs size-3.5 shrink-0'
            aria-hidden='true'
          />
        )}
        {isSystem && (
          <LockIcon className='size-3 shrink-0 opacity-70' aria-hidden='true' />
        )}
        {typeof usageCount === 'number' && (
          <span
            className={cn(
              'py-0.2 ml-1 inline-flex items-center rounded-full border px-1.5 font-mono text-[10px] font-semibold tabular-nums shadow-2xs',
              style.counter
            )}
            title={t('tags.show.usesTooltip', {
              count: usageCount.toLocaleString(),
              defaultValue: `${usageCount.toLocaleString()} lượt dùng`,
            })}
          >
            {usageCount.toLocaleString()}
          </span>
        )}
      </button>

      {onUnlink ? (
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation()
            onUnlink()
          }}
          aria-label={`Unlink tag ${name}`}
          className='hover:bg-destructive/15 hover:text-destructive -mr-1 ml-0.5 inline-flex size-4.5 cursor-pointer items-center justify-center rounded-full opacity-50 transition-all hover:opacity-100'
        >
          <XIcon className='size-3' aria-hidden='true' />
        </button>
      ) : trailingAction ? (
        <div className='-mr-1 ml-0.5 flex shrink-0 items-center'>
          {trailingAction}
        </div>
      ) : null}
    </div>
  )
}

export function getTagCategoryDesignToken(category: TagCategory) {
  const style = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.general
  const gradient =
    TAG_CATEGORY_GRADIENTS[category] ?? TAG_CATEGORY_GRADIENTS.general
  const accent = TAG_CATEGORY_ACCENTS[category] ?? TAG_CATEGORY_ACCENTS.general
  return { ...style, gradient, accent }
}
