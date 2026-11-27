import { useState } from 'react'
import { format, isValid } from 'date-fns'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeftIcon,
  BadgeCheckIcon,
  CheckIcon,
  CopyIcon,
  EditIcon,
  ExternalLinkIcon,
  MapPinIcon,
  SlidersHorizontalIcon,
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
import { apiDeleteAdminEvent, useDataAdminEventById } from '../queries'

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

  const { data: event, isFetching } = useDataAdminEventById(id ?? '')

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
        {/* Top Summary Header Card */}
        <div className='border-border/80 bg-card rounded-2xl border p-4 sm:p-6'>
          <PageHeader
            title={<>{event.title}</>}
            badges={
              <>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={() => navigate('/events')}
                  className='mt-0.5 size-9 shrink-0 cursor-pointer'
                  aria-label={t('buttons.back', 'Quay lại')}
                >
                  <ArrowLeftIcon className='size-4' aria-hidden='true' />
                </Button>

                <div className='min-w-0 flex-1 space-y-2'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <EventStatusBadge status={event.status} />
                    <EventFeaturedBadge isFeatured={event.isFeaturedFestival} />
                    <EventRecruitingBadge isRecruiting={event.isRecruiting} />
                  </div>

                  <div className='text-muted-foreground flex flex-wrap items-center gap-2 text-xs'>
                    <span className='font-mono tabular-nums'>#{event.id}</span>
                    <span>•</span>
                    <div className='border-border/70 bg-muted/40 inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[11px]'>
                      <span>/{event.slug}</span>
                      <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                          <button
                            type='button'
                            onClick={() => copySlug(event.slug)}
                            aria-label={t(
                              'events.actions.copySlug',
                              'Sao chép slug'
                            )}
                            className='text-muted-foreground hover:text-foreground cursor-pointer'
                          >
                            {copiedSlug ? (
                              <CheckIcon
                                className='text-primary size-3'
                                aria-hidden='true'
                              />
                            ) : (
                              <CopyIcon className='size-3' aria-hidden='true' />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side='top' className='text-xs'>
                          {copiedSlug ? 'Đã sao chép!' : 'Sao chép slug'}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span>•</span>
                    <span className='inline-flex items-center gap-1'>
                      <MapPinIcon className='size-3.5' aria-hidden='true' />
                      <span>
                        {event.locationLabel} — {event.venue}
                      </span>
                    </span>
                  </div>
                </div>
              </>
            }
            actions={
              <>
                <div className='grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:flex-wrap sm:items-center sm:justify-end'>
                  <Button
                    variant='outline'
                    size='sm'
                    asChild
                    className='h-9 w-full cursor-pointer gap-1.5 text-xs sm:w-auto'
                  >
                    <a
                      href={`${clientUrl}/events/${event.slug}`}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <ExternalLinkIcon
                        className='size-3.5'
                        aria-hidden='true'
                      />
                      <span>
                        {t('events.actions.viewPublic', 'Xem trên web')}
                      </span>
                    </a>
                  </Button>

                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => navigate(`/events/${event.id}/edit`)}
                    className='h-9 w-full cursor-pointer gap-1.5 text-xs sm:w-auto'
                  >
                    <SlidersHorizontalIcon
                      className='size-3.5'
                      aria-hidden='true'
                    />
                    <span>{t('events.actions.status', 'Trạng thái')}</span>
                  </Button>

                  <Button
                    size='sm'
                    onClick={() => navigate(`/events/${event.id}/edit`)}
                    className='h-9 w-full cursor-pointer gap-1.5 text-xs sm:w-auto'
                  >
                    <EditIcon className='size-3.5' aria-hidden='true' />
                    <span>{t('buttons.edit', 'Chỉnh sửa')}</span>
                  </Button>

                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() => setIsDeleteOpen(true)}
                    className='h-9 w-full cursor-pointer gap-1.5 text-xs sm:w-auto'
                  >
                    <TrashIcon className='size-3.5' aria-hidden='true' />
                    <span>{t('buttons.delete', 'Xóa')}</span>
                  </Button>
                </div>
              </>
            }
          />

          {/* Compact 4-Column Metric Strip */}
          <div className='mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4'>
            <div className='bg-muted/30 border-border/60 rounded-xl border px-3.5 py-2.5'>
              <p className='text-muted-foreground text-[11px] font-medium'>
                {t('events.show.metricDate', 'Thời gian diễn ra')}
              </p>
              <p className='text-foreground mt-0.5 text-sm font-semibold tabular-nums'>
                {event.dateString}
              </p>
            </div>

            <div className='bg-muted/30 border-border/60 rounded-xl border px-3.5 py-2.5'>
              <p className='text-muted-foreground text-[11px] font-medium'>
                {t('events.show.metricTicket', 'Giá vé vào cổng')}
              </p>
              <p className='text-foreground mt-0.5 font-mono text-sm font-semibold tabular-nums'>
                {ticketDisplay}
              </p>
            </div>

            <div className='bg-muted/30 border-border/60 rounded-xl border px-3.5 py-2.5'>
              <p className='text-muted-foreground text-[11px] font-medium'>
                {t('events.show.metricEngagement', 'Quan tâm / Tham gia')}
              </p>
              <p className='text-foreground mt-0.5 font-mono text-sm font-semibold tabular-nums'>
                {event.interestedCount.toLocaleString()} /{' '}
                {event.participantsCount.toLocaleString()}
              </p>
            </div>

            <div className='bg-muted/30 border-border/60 rounded-xl border px-3.5 py-2.5'>
              <p className='text-muted-foreground text-[11px] font-medium'>
                {t('events.show.metricApplications', 'Đơn ứng tuyển')}
              </p>
              <p className='text-foreground mt-0.5 font-mono text-sm font-semibold tabular-nums'>
                {event.applicationsCount.toLocaleString()} hồ sơ
              </p>
            </div>
          </div>
        </div>

        {/* Two-Column Detail Grid */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
          {/* Left Column (8 Cols) */}
          <div className='space-y-6 lg:col-span-8'>
            {/* Description & Venue */}
            <Card className='border-border/80'>
              <CardHeader className='border-b px-5 py-4'>
                <CardTitle className='text-base font-semibold'>
                  {t('events.show.aboutSection', 'Nội dung & Tổ chức')}
                </CardTitle>
                <CardDescription className='text-xs'>
                  {event.organizerName
                    ? `Đơn vị tổ chức: ${event.organizerName}`
                    : 'Thông tin giới thiệu và danh mục sự kiện'}
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4 p-5'>
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
                      Chưa có mô tả chi tiết cho sự kiện này.
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Schedule Timeline */}
            <Card className='border-border/80'>
              <CardHeader className='border-b px-5 py-4'>
                <CardTitle className='text-base font-semibold'>
                  {t('events.show.scheduleSection', 'Lịch trình hoạt động')}
                </CardTitle>
              </CardHeader>
              <CardContent className='p-5'>
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
            <Card className='border-border/80'>
              <CardHeader className='border-b px-5 py-4'>
                <CardTitle className='text-base font-semibold'>
                  {t(
                    'events.show.participantsSection',
                    'Khách mời & Người tham gia'
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className='p-5'>
                {event.participants && event.participants.length > 0 ? (
                  <div className='grid gap-3 sm:grid-cols-2'>
                    {event.participants.map((p) => (
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
                            {p.roleLabel || 'Cosplayer'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-muted-foreground text-xs'>
                    {t(
                      'events.show.emptyParticipants',
                      'Chưa có khách mời hoặc người tham gia được ghi nhận.'
                    )}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column (4 Cols) */}
          <div className='space-y-6 lg:col-span-4'>
            {/* Media Previews */}
            <Card className='border-border/80'>
              <CardHeader className='border-b px-5 py-4'>
                <CardTitle className='text-base font-semibold'>
                  {t('events.show.mediaSection', 'Hình ảnh sự kiện')}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4 p-5'>
                <div className='space-y-1.5'>
                  <p className='text-muted-foreground text-xs font-medium'>
                    Ảnh đại diện (Poster)
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
                      Ảnh Hero Banner
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
            <Card className='border-border/80'>
              <CardHeader className='border-b px-5 py-4'>
                <CardTitle className='text-base font-semibold'>
                  {t('events.show.metadataSection', 'Thông tin kỹ thuật')}
                </CardTitle>
              </CardHeader>
              <CardContent className='divide-border/60 divide-y px-5 py-2 text-xs'>
                <div className='flex items-center justify-between py-2.5'>
                  <span className='text-muted-foreground'>Bắt đầu</span>
                  <span className='font-mono font-medium tabular-nums'>
                    {formatTimestamp(event.startAt)}
                  </span>
                </div>
                <div className='flex items-center justify-between py-2.5'>
                  <span className='text-muted-foreground'>Kết thúc</span>
                  <span className='font-mono font-medium tabular-nums'>
                    {formatTimestamp(event.endAt)}
                  </span>
                </div>
                <div className='flex items-center justify-between py-2.5'>
                  <span className='text-muted-foreground'>Ngày tạo</span>
                  <span className='font-mono font-medium tabular-nums'>
                    {formatTimestamp(event.createdAt)}
                  </span>
                </div>
                <div className='flex items-center justify-between py-2.5'>
                  <span className='text-muted-foreground'>Cập nhật</span>
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
