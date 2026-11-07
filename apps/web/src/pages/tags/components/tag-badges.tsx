import { BadgeCheckIcon, LockIcon, ShieldAlertIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { TagCategory, TagSafetyRating, TagStatus } from '../schema'

const CATEGORY_STYLES: Record<TagCategory, { dot: string; badge: string }> = {
  general: {
    dot: 'bg-zinc-500 dark:bg-zinc-400',
    badge:
      'border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200',
  },
  copyright: {
    dot: 'bg-violet-600 dark:bg-violet-400',
    badge:
      'border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-900/70 dark:bg-violet-950/60 dark:text-violet-200',
  },
  character: {
    dot: 'bg-emerald-600 dark:bg-emerald-400',
    badge:
      'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/70 dark:bg-emerald-950/60 dark:text-emerald-200',
  },
  artist: {
    dot: 'bg-amber-600 dark:bg-amber-400',
    badge:
      'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/60 dark:text-amber-200',
  },
  meta: {
    dot: 'bg-sky-600 dark:bg-sky-400',
    badge:
      'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/70 dark:bg-sky-950/60 dark:text-sky-200',
  },
  system: {
    dot: 'bg-rose-600 dark:bg-rose-400',
    badge:
      'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/70 dark:bg-rose-950/60 dark:text-rose-200',
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

export function TagNodeChip({
  name,
  translatedName,
  category,
  isOfficial,
  isSystem,
  usageCount,
  onClick,
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
  trailingAction?: React.ReactNode
  className?: string
}) {
  const style = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.general
  const showSecondary =
    Boolean(translatedName) && translatedName?.trim() !== name.trim()

  return (
    <div
      className={cn(
        'bg-card hover:border-foreground/30 inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs whitespace-nowrap transition-colors',
        onClick && 'cursor-pointer',
        className
      )}
    >
      <button
        type='button'
        onClick={onClick}
        disabled={!onClick}
        className={cn(
          'inline-flex min-w-0 items-center gap-1.5 text-left focus-visible:outline-none',
          onClick && 'hover:underline'
        )}
      >
        <span
          className={cn('size-2 shrink-0 rounded-full', style.dot)}
          aria-hidden='true'
        />
        <span className='text-foreground max-w-44 truncate font-medium'>
          #{name}
        </span>
        {showSecondary && (
          <span className='text-muted-foreground max-w-36 truncate'>
            ({translatedName})
          </span>
        )}
        {isOfficial && (
          <BadgeCheckIcon
            className='text-primary size-3.5 shrink-0'
            aria-hidden='true'
          />
        )}
        {isSystem && (
          <LockIcon
            className='text-muted-foreground size-3 shrink-0'
            aria-hidden='true'
          />
        )}
        {typeof usageCount === 'number' && (
          <span className='text-muted-foreground ml-0.5 font-mono text-[11px] tabular-nums'>
            {usageCount.toLocaleString()}
          </span>
        )}
      </button>
      {trailingAction}
    </div>
  )
}
