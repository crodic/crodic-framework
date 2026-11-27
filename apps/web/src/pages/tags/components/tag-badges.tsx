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

export const TAG_CATEGORY_ACCENTS: Record<TagCategory, string> = {
  general: 'text-primary dark:text-primary',
  copyright: 'text-primary dark:text-primary',
  character: 'text-primary dark:text-primary',
  artist: 'text-primary dark:text-primary',
  meta: 'text-primary dark:text-primary',
  system: 'text-destructive dark:text-destructive',
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
    dot: 'bg-primary ring-sky-500/30',
    badge:
      'border-primary/25 bg-primary/10 text-primary dark:border-primary/30 dark:bg-primary/15 dark:text-primary',
    chip: 'border-primary/20 bg-primary/5 text-foreground hover:bg-primary/10 hover:border-primary/40 dark:border-primary/25 dark:bg-primary/30 dark:hover:bg-primary/40',
    counter:
      'bg-primary/10 text-primary border-primary/25 dark:bg-primary/60 dark:text-primary dark:border-primary/30',
    text: 'text-primary dark:text-primary',
  },
  copyright: {
    dot: 'bg-primary ring-violet-500/30',
    badge:
      'border-primary/25 bg-primary/10 text-primary dark:border-primary/30 dark:bg-primary/15 dark:text-primary',
    chip: 'border-primary/20 bg-primary/5 text-foreground hover:bg-primary/10 hover:border-primary/40 dark:border-primary/25 dark:bg-primary/30 dark:hover:bg-primary/40',
    counter:
      'bg-primary/10 text-primary border-primary/25 dark:bg-primary/60 dark:text-primary dark:border-primary/30',
    text: 'text-primary dark:text-primary',
  },
  character: {
    dot: 'bg-primary ring-emerald-500/30',
    badge:
      'border-primary/25 bg-primary/10 text-primary dark:border-primary/30 dark:bg-primary/15 dark:text-primary',
    chip: 'border-primary/20 bg-primary/5 text-foreground hover:bg-primary/10 hover:border-primary/40 dark:border-primary/25 dark:bg-primary/30 dark:hover:bg-primary/40',
    counter:
      'bg-primary/10 text-primary border-primary/25 dark:bg-primary/60 dark:text-primary dark:border-primary/30',
    text: 'text-primary dark:text-primary',
  },
  artist: {
    dot: 'bg-primary ring-amber-500/30',
    badge:
      'border-primary/25 bg-primary/10 text-primary dark:border-primary/30 dark:bg-primary/15 dark:text-primary',
    chip: 'border-primary/20 bg-primary/5 text-foreground hover:bg-primary/10 hover:border-primary/40 dark:border-primary/25 dark:bg-primary/30 dark:hover:bg-primary/40',
    counter:
      'bg-primary/10 text-primary border-primary/25 dark:bg-primary/60 dark:text-primary dark:border-primary/30',
    text: 'text-primary dark:text-primary',
  },
  meta: {
    dot: 'bg-primary ring-indigo-500/30',
    badge:
      'border-primary/25 bg-primary/10 text-primary dark:border-primary/30 dark:bg-primary/15 dark:text-primary',
    chip: 'border-primary/20 bg-primary/5 text-foreground hover:bg-primary/10 hover:border-primary/40 dark:border-primary/25 dark:bg-primary/30 dark:hover:bg-primary/40',
    counter:
      'bg-primary/10 text-primary border-primary/25 dark:bg-primary/60 dark:text-primary dark:border-primary/30',
    text: 'text-primary dark:text-primary',
  },
  system: {
    dot: 'bg-destructive ring-rose-500/30',
    badge:
      'border-destructive/25 bg-destructive/10 text-destructive dark:border-destructive/30 dark:bg-destructive/15 dark:text-destructive',
    chip: 'border-destructive/20 bg-destructive/5 text-foreground hover:bg-destructive/10 hover:border-destructive/40 dark:border-destructive/25 dark:bg-destructive/30 dark:hover:bg-destructive/40',
    counter:
      'bg-destructive/10 text-destructive border-destructive/25 dark:bg-destructive/60 dark:text-destructive dark:border-destructive/30',
    text: 'text-destructive dark:text-destructive',
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
      'border-primary/25 bg-primary/10 text-primary dark:border-primary/30 dark:bg-primary/15 dark:text-primary',
    icon: ShieldCheckIcon,
  },
  sensitive: {
    style:
      'border-primary/25 bg-primary/10 text-primary dark:border-primary/30 dark:bg-primary/15 dark:text-primary',
    icon: AlertCircleIcon,
  },
  r18: {
    style:
      'border-destructive/25 bg-destructive/10 text-destructive dark:border-destructive/30 dark:bg-destructive/15 dark:text-destructive',
    icon: ShieldAlertIcon,
  },
  r18g: {
    style:
      'border-destructive/30 bg-destructive/15 text-destructive dark:border-destructive/40 dark:bg-destructive/60 dark:text-destructive font-bold',
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
      'border-primary/25 bg-primary/10 text-primary dark:border-primary/30 dark:bg-primary/15 dark:text-primary',
    icon: CheckCircle2Icon,
  },
  pending: {
    style:
      'border-primary/25 bg-primary/10 text-primary dark:border-primary/30 dark:bg-primary/15 dark:text-primary',
    icon: ClockIcon,
  },
  merged: {
    style:
      'border-primary/25 bg-primary/10 text-primary dark:border-primary/30 dark:bg-primary/15 dark:text-primary',
    icon: GitMergeIcon,
  },
  banned: {
    style:
      'border-destructive/25 bg-destructive/10 text-destructive dark:border-destructive/30 dark:bg-destructive/15 dark:text-destructive',
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
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap transition-colors',
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
        'inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap transition-colors',
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
        'inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap transition-colors',
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
      'border-primary/25 bg-primary/10 text-primary dark:border-primary/30 dark:bg-primary/15 dark:text-primary'
    Icon = GitMergeIcon
  } else if (
    norm.includes('attach') ||
    norm.includes('add') ||
    norm.includes('create')
  ) {
    style =
      'border-primary/25 bg-primary/10 text-primary dark:border-primary/30 dark:bg-primary/15 dark:text-primary'
    Icon = PlusIcon
  } else if (
    norm.includes('detach') ||
    norm.includes('remove') ||
    norm.includes('delete')
  ) {
    style =
      'border-destructive/25 bg-destructive/10 text-destructive dark:border-destructive/30 dark:bg-destructive/15 dark:text-destructive'
    Icon = XIcon
  } else if (norm.includes('unlock')) {
    style =
      'border-primary/25 bg-primary/10 text-primary dark:border-primary/30 dark:bg-primary/15 dark:text-primary'
    Icon = UnlockIcon
  } else if (norm.includes('lock') || norm.includes('freeze')) {
    style =
      'border-primary/25 bg-primary/10 text-primary dark:border-primary/30 dark:bg-primary/15 dark:text-primary'
    Icon = LockIcon
  }

  return (
    <Badge
      variant='outline'
      className={cn(
        'inline-flex items-center gap-1 font-mono text-[10px] font-bold tracking-wider whitespace-nowrap uppercase',
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
        'group/chip inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs whitespace-nowrap transition-colors',
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
          onClick && 'hover:opacity-90'
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
            className='text-primary size-3.5 shrink-0'
            aria-hidden='true'
          />
        )}
        {isSystem && (
          <LockIcon
            className='text-primary size-3 shrink-0 opacity-80'
            aria-hidden='true'
          />
        )}
        {typeof usageCount === 'number' && (
          <span
            className={cn(
              'ml-1 inline-flex items-center rounded-full border px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums',
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
  const accent = TAG_CATEGORY_ACCENTS[category] ?? TAG_CATEGORY_ACCENTS.general
  const Icon = CATEGORY_ICONS[category] ?? HashIcon
  return { ...style, accent, Icon }
}
