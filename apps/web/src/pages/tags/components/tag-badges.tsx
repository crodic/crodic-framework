import {
  AlertCircleIcon,
  BanIcon,
  BadgeCheckIcon,
  BookOpenIcon,
  CheckCircle2Icon,
  ClockIcon,
  CpuIcon,
  GitMergeIcon,
  HashIcon,
  LayersIcon,
  LockIcon,
  PaletteIcon,
  PlusIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  UnlockIcon,
  UserIcon,
  XIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { TagCategory, TagSafetyRating, TagStatus } from '../schema'

export const TAG_CATEGORY_GRADIENTS: Record<TagCategory, string> = {
  general:
    'from-sky-500/15 via-blue-500/5 to-transparent dark:from-sky-950/40 dark:via-blue-950/20 dark:to-transparent',
  copyright:
    'from-violet-500/15 via-purple-500/5 to-transparent dark:from-violet-950/40 dark:via-purple-950/20 dark:to-transparent',
  character:
    'from-emerald-500/15 via-teal-500/5 to-transparent dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-transparent',
  artist:
    'from-amber-500/15 via-orange-500/5 to-transparent dark:from-amber-950/40 dark:via-orange-950/20 dark:to-transparent',
  meta: 'from-indigo-500/15 via-blue-500/5 to-transparent dark:from-indigo-950/40 dark:via-blue-950/20 dark:to-transparent',
  system:
    'from-rose-500/15 via-pink-500/5 to-transparent dark:from-rose-950/40 dark:via-pink-950/20 dark:to-transparent',
}

export const TAG_CATEGORY_ACCENTS: Record<TagCategory, string> = {
  general: 'text-sky-600 dark:text-sky-400',
  copyright: 'text-violet-600 dark:text-violet-400',
  character: 'text-emerald-600 dark:text-emerald-400',
  artist: 'text-amber-600 dark:text-amber-400',
  meta: 'text-indigo-600 dark:text-indigo-400',
  system: 'text-rose-600 dark:text-rose-400',
}

export const CATEGORY_ICONS: Record<
  TagCategory,
  React.ComponentType<{ className?: string }>
> = {
  general: HashIcon,
  copyright: BookOpenIcon,
  character: UserIcon,
  artist: PaletteIcon,
  meta: LayersIcon,
  system: CpuIcon,
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
    dot: 'bg-sky-500 ring-sky-500/30',
    badge:
      'border-sky-500/25 bg-sky-500/10 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-300',
    chip: 'border-sky-500/20 bg-sky-500/5 text-foreground hover:bg-sky-500/10 hover:border-sky-500/40 dark:border-sky-500/25 dark:bg-sky-950/30 dark:hover:bg-sky-900/40',
    counter:
      'bg-sky-500/10 text-sky-700 border-sky-500/25 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-500/30',
    text: 'text-sky-700 dark:text-sky-300',
  },
  copyright: {
    dot: 'bg-violet-500 ring-violet-500/30',
    badge:
      'border-violet-500/25 bg-violet-500/10 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/15 dark:text-violet-300',
    chip: 'border-violet-500/20 bg-violet-500/5 text-foreground hover:bg-violet-500/10 hover:border-violet-500/40 dark:border-violet-500/25 dark:bg-violet-950/30 dark:hover:bg-violet-900/40',
    counter:
      'bg-violet-500/10 text-violet-700 border-violet-500/25 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-500/30',
    text: 'text-violet-700 dark:text-violet-300',
  },
  character: {
    dot: 'bg-emerald-500 ring-emerald-500/30',
    badge:
      'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300',
    chip: 'border-emerald-500/20 bg-emerald-500/5 text-foreground hover:bg-emerald-500/10 hover:border-emerald-500/40 dark:border-emerald-500/25 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40',
    counter:
      'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/30',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  artist: {
    dot: 'bg-amber-500 ring-amber-500/30',
    badge:
      'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300',
    chip: 'border-amber-500/20 bg-amber-500/5 text-foreground hover:bg-amber-500/10 hover:border-amber-500/40 dark:border-amber-500/25 dark:bg-amber-950/30 dark:hover:bg-amber-900/40',
    counter:
      'bg-amber-500/10 text-amber-700 border-amber-500/25 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-500/30',
    text: 'text-amber-700 dark:text-amber-300',
  },
  meta: {
    dot: 'bg-indigo-500 ring-indigo-500/30',
    badge:
      'border-indigo-500/25 bg-indigo-500/10 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-300',
    chip: 'border-indigo-500/20 bg-indigo-500/5 text-foreground hover:bg-indigo-500/10 hover:border-indigo-500/40 dark:border-indigo-500/25 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40',
    counter:
      'bg-indigo-500/10 text-indigo-700 border-indigo-500/25 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-500/30',
    text: 'text-indigo-700 dark:text-indigo-300',
  },
  system: {
    dot: 'bg-rose-500 ring-rose-500/30',
    badge:
      'border-rose-500/25 bg-rose-500/10 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300',
    chip: 'border-rose-500/20 bg-rose-500/5 text-foreground hover:bg-rose-500/10 hover:border-rose-500/40 dark:border-rose-500/25 dark:bg-rose-950/30 dark:hover:bg-rose-900/40',
    counter:
      'bg-rose-500/10 text-rose-700 border-rose-500/25 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-500/30',
    text: 'text-rose-700 dark:text-rose-300',
  },
}

const SAFETY_CONFIG: Record<
  TagSafetyRating,
  {
    style: string
    icon: React.ComponentType<{ className?: string }>
  }
> = {
  safe: {
    style:
      'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300',
    icon: ShieldCheckIcon,
  },
  sensitive: {
    style:
      'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300',
    icon: AlertCircleIcon,
  },
  r18: {
    style:
      'border-rose-500/25 bg-rose-500/10 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300',
    icon: ShieldAlertIcon,
  },
  r18g: {
    style:
      'border-red-600/30 bg-red-600/15 text-red-800 dark:border-red-500/40 dark:bg-red-950/60 dark:text-red-200 font-bold',
    icon: ShieldAlertIcon,
  },
}

const STATUS_CONFIG: Record<
  TagStatus,
  {
    style: string
    icon: React.ComponentType<{ className?: string }>
  }
> = {
  active: {
    style:
      'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300',
    icon: CheckCircle2Icon,
  },
  pending: {
    style:
      'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300',
    icon: ClockIcon,
  },
  merged: {
    style:
      'border-violet-500/25 bg-violet-500/10 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/15 dark:text-violet-300',
    icon: GitMergeIcon,
  },
  banned: {
    style:
      'border-rose-500/25 bg-rose-500/10 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300',
    icon: BanIcon,
  },
}

export function TagCategoryBadge({
  category,
  className,
  showIcon = true,
}: {
  category: TagCategory
  className?: string
  showIcon?: boolean
}) {
  const { t } = useTranslation()
  const style = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.general
  const Icon = CATEGORY_ICONS[category] ?? HashIcon

  return (
    <Badge
      variant='outline'
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap shadow-2xs transition-colors',
        style.badge,
        className
      )}
    >
      {showIcon ? (
        <Icon className='size-3 shrink-0 opacity-80' aria-hidden='true' />
      ) : (
        <span
          className={cn('size-1.5 shrink-0 rounded-full ring-2', style.dot)}
          aria-hidden='true'
        />
      )}
      <span>{t(`tags.category.${category}`, category)}</span>
    </Badge>
  )
}

export function TagSafetyBadge({
  safetyRating,
  className,
  showIcon = true,
}: {
  safetyRating: TagSafetyRating
  className?: string
  showIcon?: boolean
}) {
  const { t } = useTranslation()
  const config = SAFETY_CONFIG[safetyRating] ?? SAFETY_CONFIG.safe
  const Icon = config.icon

  return (
    <Badge
      variant='outline'
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap shadow-2xs transition-colors',
        config.style,
        className
      )}
    >
      {showIcon && (
        <Icon className='size-3 shrink-0 opacity-85' aria-hidden='true' />
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
  showIcon = true,
}: {
  status: TagStatus
  className?: string
  showIcon?: boolean
}) {
  const { t } = useTranslation()
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.active
  const Icon = config.icon

  return (
    <Badge
      variant='outline'
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap shadow-2xs transition-colors',
        config.style,
        className
      )}
    >
      {showIcon && (
        <Icon className='size-3 shrink-0 opacity-85' aria-hidden='true' />
      )}
      <span>{t(`tags.status.${status}`, status)}</span>
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
      'border-violet-500/25 bg-violet-500/10 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/15 dark:text-violet-300'
    Icon = GitMergeIcon
  } else if (
    norm.includes('attach') ||
    norm.includes('add') ||
    norm.includes('create')
  ) {
    style =
      'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300'
    Icon = PlusIcon
  } else if (
    norm.includes('detach') ||
    norm.includes('remove') ||
    norm.includes('delete')
  ) {
    style =
      'border-rose-500/25 bg-rose-500/10 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300'
    Icon = XIcon
  } else if (norm.includes('unlock')) {
    style =
      'border-sky-500/25 bg-sky-500/10 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-300'
    Icon = UnlockIcon
  } else if (norm.includes('lock') || norm.includes('freeze')) {
    style =
      'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300'
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
  const Icon = CATEGORY_ICONS[category] ?? HashIcon
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
          'focus-visible:ring-ring inline-flex min-w-0 cursor-pointer items-center gap-1.5 rounded-full text-left focus-visible:ring-1 focus-visible:outline-none',
          onClick && 'hover:opacity-90 active:scale-[0.98]'
        )}
      >
        <span
          className={cn(
            'flex size-4 items-center justify-center rounded-full',
            style.badge
          )}
          aria-hidden='true'
        >
          <Icon className='size-2.5 shrink-0' />
        </span>
        <span className='max-w-48 truncate font-semibold tracking-tight'>
          <span className='mr-0.5 text-[11px] font-bold opacity-60'>#</span>
          {name}
        </span>
        {showSecondary && (
          <span className='text-muted-foreground max-w-36 truncate text-[11px] font-normal'>
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
          <LockIcon
            className='size-3 shrink-0 text-amber-500 opacity-80'
            aria-hidden='true'
          />
        )}
        {typeof usageCount === 'number' && (
          <span
            className={cn(
              'ml-1 inline-flex items-center rounded-full border px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums shadow-2xs',
              style.counter
            )}
            title={t('tags.show.usesTooltip', {
              count: usageCount.toLocaleString(),
              defaultValue: `${usageCount.toLocaleString()} uses`,
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
          className='hover:bg-destructive/15 hover:text-destructive focus-visible:ring-ring -mr-1 ml-0.5 inline-flex size-4.5 cursor-pointer items-center justify-center rounded-full opacity-60 transition-all hover:opacity-100 focus-visible:ring-1'
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
  const Icon = CATEGORY_ICONS[category] ?? HashIcon
  return { ...style, gradient, accent, Icon }
}
