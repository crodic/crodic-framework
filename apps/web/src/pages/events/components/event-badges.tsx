import { CheckCircle2, Clock, Star, UserCheck, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { EventStatus } from '../schema'

/**
 * Displays the normalized lifecycle status badge for an event.
 */
export function EventStatusBadge({
  status,
  className,
}: {
  status: EventStatus
  className?: string
}) {
  const { t } = useTranslation()

  if (status === 'upcoming') {
    return (
      <Badge
        variant='outline-warning'
        className={cn('gap-1 text-xs font-medium', className)}
      >
        <Clock className='size-3' aria-hidden='true' />
        <span>{t('events.status.upcoming', 'Sắp diễn ra')}</span>
      </Badge>
    )
  }

  if (status === 'ongoing') {
    return (
      <Badge
        variant='success'
        className={cn('gap-1 text-xs font-medium', className)}
      >
        <CheckCircle2 className='size-3' aria-hidden='true' />
        <span>{t('events.status.ongoing', 'Đang diễn ra')}</span>
      </Badge>
    )
  }

  if (status === 'completed') {
    return (
      <Badge
        variant='secondary'
        className={cn('text-muted-foreground text-xs font-medium', className)}
      >
        {t('events.status.completed', 'Đã kết thúc')}
      </Badge>
    )
  }

  if (status === 'cancelled') {
    return (
      <Badge
        variant='destructive'
        className={cn('gap-1 text-xs font-medium', className)}
      >
        <XCircle className='size-3' aria-hidden='true' />
        <span>{t('events.status.cancelled', 'Đã hủy')}</span>
      </Badge>
    )
  }

  return (
    <Badge variant='secondary' className={cn('text-xs font-medium', className)}>
      {t('events.status.draft', 'Bản nháp')}
    </Badge>
  )
}

/**
 * Displays whether an event is featured as a spotlight festival.
 */
export function EventFeaturedBadge({
  isFeatured,
  className,
}: {
  isFeatured: boolean
  className?: string
}) {
  const { t } = useTranslation()
  if (!isFeatured) return null

  return (
    <Badge
      variant='info'
      className={cn('gap-1 text-xs font-medium', className)}
    >
      <Star className='size-3' aria-hidden='true' />
      <span>{t('events.badges.featuredFestival', 'Festival')}</span>
    </Badge>
  )
}

/**
 * Displays whether cosplayer/guest registration is open for an event.
 */
export function EventRecruitingBadge({
  isRecruiting,
  className,
}: {
  isRecruiting: boolean
  className?: string
}) {
  const { t } = useTranslation()

  if (!isRecruiting) {
    return (
      <Badge
        variant='secondary'
        className={cn('text-xs font-medium', className)}
      >
        {t('events.recruiting.closed', 'Đóng')}
      </Badge>
    )
  }

  return (
    <Badge
      variant='success'
      className={cn('gap-1 text-xs font-medium', className)}
    >
      <UserCheck className='size-3' aria-hidden='true' />
      <span>{t('events.recruiting.open', 'Mở đăng ký')}</span>
    </Badge>
  )
}
