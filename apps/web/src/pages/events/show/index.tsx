import { useState } from 'react'
import { format, isValid } from 'date-fns'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BadgeCheckIcon,
  CheckIcon,
  CopyIcon,
  EditIcon,
  ExternalLinkIcon,
  MapPinIcon,
  TrashIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DeleteAlertDialog } from '@/components/common/delete-alert-dialog'
import DataLoader from '@/components/layout/data-loader'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-shell'
import { NotFoundError } from '@/pages/errors/not-found-error'
import {
  EventFeaturedBadge,
  EventRecruitingBadge,
  EventStatusBadge,
} from '../components/event-badges'
import {
  apiDeleteAdminEvent,
  useDataAdminEventById,
  useDataAdminEventParticipants,
} from '../queries'

function formatTimestamp(iso?: string | null): string {
  if (!iso) return '—'
  const date = new Date(iso)
  return isValid(date) ? format(date, 'dd/MM/yyyy HH:mm') : '—'
}

export function PageEventShow() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [copiedSlug, setCopiedSlug] = useState(false)
  const [participantsPage, setParticipantsPage] = useState(1)

  const { data: event, isFetching } = useDataAdminEventById(id ?? '')
  const {
    data: participantsResponse,
    isFetching: isParticipantsFetching,
    isError: hasParticipantsError,
  } = useDataAdminEventParticipants(id ?? '', participantsPage)

  useBreadcrumb([
    {
      title: t('navigation.kosume.events', 'Quản lý sự kiện'),
      href: '/events',
    },
    { title: event ? event.title : `#${id}` },
  ])

  const deleteMutation = useMutation({
    mutationFn: apiDeleteAdminEvent,
    onSuccess: () => {
      toast.success(t('events.messages.deleted', 'Xóa sự kiện thành công'))
      queryClient.invalidateQueries({ queryKey: ['admin-events'] })
      navigate('/events')
    },
    onError: restApiErrorHandler,
  })

  const copySlug = (slug: string) => {
    navigator.clipboard?.writeText(slug)
    setCopiedSlug(true)
    toast.success(t('events.actions.copiedSlug', 'Đã sao chép slug'))
    setTimeout(() => setCopiedSlug(false), 1500)
  }

  const clientUrl = import.meta.env.VITE_CLIENT_URL || 'https://crodic.net'

  if (!event && isFetching) return <DataLoader />
  if (!id || !event) return <NotFoundError />

  const ticketDisplay =
    event.ticketPriceLabel ||
    (event.ticketPriceAmount && event.ticketPriceAmount > 0
      ? `${event.ticketPriceAmount.toLocaleString('vi-VN')}đ`
      : t('events.form.ticketFree', 'Miễn phí'))

  return (
    <>
      <DeleteAlertDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={t('events.dialogs.deleteTitle', 'Xóa sự kiện')}
        description={t(
          'events.dialogs.deleteDesc',
          'Bạn có chắc chắn muốn xóa sự kiện "{{title}}"? Hành động này sẽ gỡ sự kiện khỏi trang công khai.',
          { title: event.title }
        )}
        handleDelete={() => deleteMutation.mutate(event.id)}
        isLoading={deleteMutation.isPending}
      />

      <Main className='flex-1'>
        <PageHeader
          title={event.title}
          backTo='/events'
          backLabel={t('buttons.back', 'Quay lại')}
          badges={
            <>
              <EventStatusBadge status={event.status} />
              <EventFeaturedBadge isFeatured={event.isFeaturedFestival} />
              <EventRecruitingBadge isRecruiting={event.isRecruiting} />
            </>
          }
          description={
            <div className='flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2'>
              <span className='tabular-nums'>#{event.id}</span>
              <div className='flex min-w-0 items-center gap-1'>
                <span className='break-all'>/{event.slug}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='size-8 shrink-0'
                      onClick={() => copySlug(event.slug)}
                      aria-label={t('events.actions.copySlug', 'Sao chép slug')}
                    >
                      {copiedSlug ? (
                        <CheckIcon className='size-4' />
                      ) : (
                        <CopyIcon className='size-4' />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {t('events.actions.copySlug', 'Sao chép slug')}
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className='inline-flex min-w-0 items-start gap-1.5'>
                <MapPinIcon
                  className='mt-0.5 size-4 shrink-0'
                  aria-hidden='true'
                />
                <span className='break-words'>
                  {event.locationLabel} — {event.venue}
                </span>
              </span>
            </div>
          }
          actions={
            <div className='flex flex-wrap items-center gap-2'>
              <Button variant='outline' asChild>
                <a
                  href={`${clientUrl}/events/${event.slug}`}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <ExternalLinkIcon className='size-4' aria-hidden='true' />
                  {t('events.actions.viewPublic', 'Xem trên web')}
                </a>
              </Button>
              <Button
                type='button'
                onClick={() => navigate(`/events/${event.id}/edit`)}
              >
                <EditIcon className='size-4' aria-hidden='true' />
                {t('buttons.edit', 'Chỉnh sửa')}
              </Button>
              <Button
                variant='destructive'
                type='button'
                onClick={() => setIsDeleteOpen(true)}
              >
                <TrashIcon className='size-4' aria-hidden='true' />
                {t('buttons.delete', 'Xóa')}
              </Button>
            </div>
          }
        />

        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          <Card>
            <CardContent>
              <dl className='space-y-1'>
                <dt className='text-muted-foreground text-sm'>
                  {t('events.show.metricDate', 'Thời gian diễn ra')}
                </dt>
                <dd className='text-sm font-semibold tabular-nums'>
                  {event.dateString}
                </dd>
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <dl className='space-y-1'>
                <dt className='text-muted-foreground text-sm'>
                  {t('events.show.metricTicket', 'Giá vé vào cổng')}
                </dt>
                <dd className='text-sm font-semibold tabular-nums'>
                  {ticketDisplay}
                </dd>
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <dl className='space-y-1'>
                <dt className='text-muted-foreground text-sm'>
                  {t('events.show.metricEngagement', 'Quan tâm / Tham gia')}
                </dt>
                <dd className='text-sm font-semibold tabular-nums'>
                  {event.interestedCount.toLocaleString()} /{' '}
                  {event.participantsCount.toLocaleString()}
                </dd>
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <dl className='space-y-1'>
                <dt className='text-muted-foreground text-sm'>
                  {t('events.show.metricApplications', 'Đơn ứng tuyển')}
                </dt>
                <dd className='text-sm font-semibold tabular-nums'>
                  {t(
                    'events.show.applicationsCount',
                    '{{count}} applications',
                    {
                      count: event.applicationsCount,
                    }
                  )}
                </dd>
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Two-Column Detail Grid */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
          {/* Left Column (8 Cols) */}
          <div className='space-y-6 lg:col-span-8'>
            {/* Description & Venue */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base font-semibold'>
                  {t('events.show.aboutSection', 'Nội dung & Tổ chức')}
                </CardTitle>
                <CardDescription>
                  {event.organizerName
                    ? t('events.show.organizer', 'Organizer: {{name}}', {
                        name: event.organizerName,
                      })
                    : t(
                        'events.show.aboutDescription',
                        'Event overview and categories'
                      )}
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {event.categories && event.categories.length > 0 && (
                  <div className='flex flex-wrap gap-1.5'>
                    {event.categories.map((cat) => (
                      <Badge key={cat} variant='secondary' className='text-xs'>
                        {cat}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className='text-foreground/90 text-sm leading-relaxed whitespace-pre-line'>
                  {event.description || (
                    <span className='text-muted-foreground italic'>
                      {t(
                        'events.show.emptyDescription',
                        'No detailed description is available for this event.'
                      )}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Schedule Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base font-semibold'>
                  {t('events.show.scheduleSection', 'Lịch trình hoạt động')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {event.schedule && event.schedule.length > 0 ? (
                  <div className='divide-border/60 border-border/60 divide-y rounded-lg border'>
                    {event.schedule.map((item, idx) => (
                      <div
                        key={idx}
                        className='flex items-start gap-4 px-4 py-3 text-sm'
                      >
                        <span className='bg-muted text-foreground w-24 shrink-0 rounded px-2 py-0.5 text-center font-mono text-xs font-semibold tabular-nums'>
                          {item.time}
                        </span>
                        <span className='text-foreground/90 flex-1'>
                          {item.activity}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-muted-foreground text-xs'>
                    {t(
                      'events.show.emptySchedule',
                      'Chưa thiết lập các mốc giờ hoạt động.'
                    )}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Participants & Guests */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base font-semibold'>
                  {t(
                    'events.show.participantsSection',
                    'Khách mời & Người tham gia'
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {participantsResponse?.data &&
                participantsResponse.data.length > 0 ? (
                  <div className='grid gap-3 sm:grid-cols-2'>
                    {participantsResponse.data.map((p) => (
                      <div
                        key={p.id}
                        className='border-border/60 bg-muted/20 flex items-center gap-3 rounded-lg border p-3'
                      >
                        <Avatar className='size-9'>
                          <AvatarImage src={p.avatarUrl ?? undefined} />
                          <AvatarFallback className='text-xs'>
                            {p.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className='min-w-0 flex-1'>
                          <div className='flex items-center gap-1'>
                            <span className='truncate text-sm font-medium'>
                              {p.name}
                            </span>
                            {p.isVerified && (
                              <BadgeCheckIcon
                                className='text-primary size-3.5 shrink-0'
                                aria-hidden='true'
                              />
                            )}
                          </div>
                          <p className='text-muted-foreground truncate text-xs'>
                            {p.roleLabel ||
                              t('events.show.cosplayerRole', 'Cosplayer')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : isParticipantsFetching ? (
                  <p className='text-muted-foreground text-sm' role='status'>
                    {t('common.loading', 'Đang tải...')}
                  </p>
                ) : hasParticipantsError ? (
                  <p className='text-destructive text-sm' role='alert'>
                    {t(
                      'events.show.participantsLoadError',
                      'Không tải được danh sách người tham gia.'
                    )}
                  </p>
                ) : (
                  <p className='text-muted-foreground text-xs'>
                    {t(
                      'events.show.emptyParticipants',
                      'Chưa có khách mời hoặc người tham gia được ghi nhận.'
                    )}
                  </p>
                )}
                {participantsResponse?.meta &&
                  participantsResponse.meta.totalPages > 1 && (
                    <div className='flex items-center justify-between gap-3 pt-3'>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        disabled={
                          isParticipantsFetching || participantsPage <= 1
                        }
                        onClick={() =>
                          setParticipantsPage((page) => Math.max(1, page - 1))
                        }
                      >
                        {t('common.previous', 'Trước')}
                      </Button>
                      <span className='text-muted-foreground text-xs tabular-nums'>
                        {participantsResponse.meta.currentPage} /{' '}
                        {participantsResponse.meta.totalPages}
                      </span>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        disabled={
                          isParticipantsFetching ||
                          participantsPage >=
                            participantsResponse.meta.totalPages
                        }
                        onClick={() => setParticipantsPage((page) => page + 1)}
                      >
                        {t('common.next', 'Tiếp')}
                      </Button>
                    </div>
                  )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column (4 Cols) */}
          <div className='space-y-6 lg:col-span-4'>
            {/* Media Previews */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base font-semibold'>
                  {t('events.show.mediaSection', 'Hình ảnh sự kiện')}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-1.5'>
                  <p className='text-muted-foreground text-xs font-medium'>
                    {t('events.show.posterLabel', 'Poster image')}
                  </p>
                  <div className='border-border/70 bg-muted/30 overflow-hidden rounded-lg border'>
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className='aspect-[16/10] w-full object-cover'
                    />
                  </div>
                </div>

                {event.bannerImageUrl && (
                  <div className='space-y-1.5'>
                    <p className='text-muted-foreground text-xs font-medium'>
                      {t('events.show.heroBannerLabel', 'Hero banner')}
                    </p>
                    <div className='border-border/70 bg-muted/30 overflow-hidden rounded-lg border'>
                      <img
                        src={event.bannerImageUrl}
                        alt={`${event.title} banner`}
                        className='aspect-video w-full object-cover'
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Technical Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base font-semibold'>
                  {t('events.show.metadataSection', 'Thông tin kỹ thuật')}
                </CardTitle>
              </CardHeader>
              <CardContent className='divide-border divide-y text-sm'>
                <div className='flex items-center justify-between py-2.5'>
                  <span className='text-muted-foreground'>
                    {t('events.show.startLabel', 'Starts')}
                  </span>
                  <span className='font-mono font-medium tabular-nums'>
                    {formatTimestamp(event.startAt)}
                  </span>
                </div>
                <div className='flex items-center justify-between py-2.5'>
                  <span className='text-muted-foreground'>
                    {t('events.show.endLabel', 'Ends')}
                  </span>
                  <span className='font-mono font-medium tabular-nums'>
                    {formatTimestamp(event.endAt)}
                  </span>
                </div>
                <div className='flex items-center justify-between py-2.5'>
                  <span className='text-muted-foreground'>
                    {t('events.show.createdLabel', 'Created')}
                  </span>
                  <span className='font-mono font-medium tabular-nums'>
                    {formatTimestamp(event.createdAt)}
                  </span>
                </div>
                <div className='flex items-center justify-between py-2.5'>
                  <span className='text-muted-foreground'>
                    {t('events.show.updatedLabel', 'Updated')}
                  </span>
                  <span className='font-mono font-medium tabular-nums'>
                    {formatTimestamp(event.updatedAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
    </>
  )
}
