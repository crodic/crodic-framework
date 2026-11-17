import { format } from 'date-fns'
import {
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Mail,
  MessageSquareQuote,
  ShieldCheck,
  User,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Booking } from '../schema'

interface BookingDetailDialogProps {
  booking: Booking | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BookingDetailDialog({
  booking,
  open,
  onOpenChange,
}: BookingDetailDialogProps) {
  const { t } = useTranslation()

  if (!booking) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <Badge className='border-emerald-500/20 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'>
            Đã chấp nhận
          </Badge>
        )
      case 'completed':
        return (
          <Badge className='border-blue-500/20 bg-blue-500/15 text-blue-700 dark:text-blue-300'>
            Đã hoàn thành
          </Badge>
        )
      case 'declined':
        return (
          <Badge className='border-rose-500/20 bg-rose-500/15 text-rose-700 dark:text-rose-300'>
            Đã từ chối
          </Badge>
        )
      case 'cancelled':
        return <Badge variant='destructive'>Đã hủy / Khiếu nại</Badge>
      default:
        return (
          <Badge className='border-amber-500/20 bg-amber-500/15 text-amber-700 dark:text-amber-300'>
            Chờ phản hồi
          </Badge>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[85vh] max-w-2xl flex-col p-6'>
        <DialogHeader>
          <div className='flex items-center justify-between pr-6'>
            <DialogTitle className='flex items-center gap-2 text-lg font-bold'>
              {t('bookings.dialog.detailTitle', 'Hợp đồng Booking')} #
              {booking.id}
            </DialogTitle>
            <div>{getStatusBadge(booking.status)}</div>
          </div>
        </DialogHeader>

        <ScrollArea className='flex-1 pr-3'>
          <div className='space-y-4 pt-1'>
            {/* Requester & Cosplayer Card */}
            <div className='grid grid-cols-2 gap-3'>
              {/* Requester */}
              <div className='bg-card space-y-2 rounded-lg border p-3.5'>
                <span className='text-muted-foreground flex items-center gap-1.5 text-xs font-semibold'>
                  <User className='size-3.5' />
                  {t('bookings.requester', 'Người đặt lịch')}
                </span>
                <div className='space-y-0.5 text-sm'>
                  <p className='text-foreground font-bold'>
                    {booking.fullName}
                  </p>
                  <p className='text-muted-foreground flex items-center gap-1 text-xs'>
                    <Mail className='size-3' />
                    {booking.contactInfo}
                  </p>
                  {booking.requesterUser?.email && (
                    <p className='text-muted-foreground text-xs'>
                      Account: {booking.requesterUser.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Target Cosplayer */}
              <div className='bg-card space-y-2 rounded-lg border p-3.5'>
                <span className='text-muted-foreground flex items-center gap-1.5 text-xs font-semibold'>
                  <ShieldCheck className='text-primary size-3.5' />
                  {t('bookings.cosplayer', 'Cosplayer được mời')}
                </span>
                <div className='space-y-0.5 text-sm'>
                  <p className='text-foreground font-bold'>
                    {booking.targetCosplayer?.fullName ||
                      `Cosplayer #${booking.targetCosplayerId}`}
                  </p>
                  {booking.targetCosplayer?.email && (
                    <p className='text-muted-foreground text-xs'>
                      {booking.targetCosplayer.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contract details & terms */}
            <div className='grid grid-cols-3 gap-3 text-sm'>
              <div className='bg-card space-y-1 rounded border p-3'>
                <span className='text-muted-foreground flex items-center gap-1 text-xs'>
                  <FileText className='size-3' />
                  {t('bookings.bookingType', 'Loại hình booking')}
                </span>
                <p className='font-semibold'>{booking.bookingType}</p>
              </div>

              <div className='bg-card space-y-1 rounded border p-3'>
                <span className='text-muted-foreground flex items-center gap-1 text-xs'>
                  <Calendar className='size-3' />
                  {t('bookings.targetDate', 'Thời gian dự kiến')}
                </span>
                <p className='font-semibold'>{booking.targetDateLabel}</p>
                {booking.targetStartAt &&
                  !Number.isNaN(new Date(booking.targetStartAt).getTime()) && (
                    <p className='text-muted-foreground text-xs'>
                      {format(
                        new Date(booking.targetStartAt),
                        'dd/MM/yyyy HH:mm'
                      )}
                    </p>
                  )}
              </div>

              <div className='bg-card space-y-1 rounded border p-3'>
                <span className='text-muted-foreground flex items-center gap-1 text-xs'>
                  <DollarSign className='size-3' />
                  {t('bookings.budget', 'Ngân sách thỏa thuận')}
                </span>
                <p className='font-semibold text-emerald-600 dark:text-emerald-400'>
                  {booking.budgetLabel}
                </p>
                {booking.budgetAmount !== null &&
                  booking.budgetAmount !== undefined && (
                    <p className='text-muted-foreground text-xs'>
                      {new Intl.NumberFormat('vi-VN').format(
                        booking.budgetAmount
                      )}{' '}
                      {booking.currency || 'VND'}
                    </p>
                  )}
              </div>
            </div>

            {/* Scope / Request details */}
            <div className='bg-card space-y-1.5 rounded border p-3.5'>
              <span className='text-muted-foreground text-xs font-medium'>
                {t('bookings.details', 'Nội dung chi tiết & Yêu cầu công việc')}
              </span>
              <p className='text-sm leading-relaxed whitespace-pre-wrap'>
                {booking.details}
              </p>
            </div>

            {/* Response / Resolution note */}
            {booking.responseNote && (
              <div className='space-y-1.5 rounded border border-amber-500/30 bg-amber-500/5 p-3.5'>
                <span className='flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400'>
                  <MessageSquareQuote className='size-3.5' />
                  {t(
                    'bookings.responseNote',
                    'Ghi chú phản hồi / Xử lý khiếu nại'
                  )}
                </span>
                <p className='text-foreground text-sm whitespace-pre-wrap'>
                  {booking.responseNote}
                </p>
                {booking.respondedAt && (
                  <p className='text-muted-foreground flex items-center gap-1 pt-1 text-[10px]'>
                    <Clock className='size-3' />
                    {format(new Date(booking.respondedAt), 'dd/MM/yyyy HH:mm')}
                  </p>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
