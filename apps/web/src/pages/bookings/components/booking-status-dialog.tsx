import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { apiUpdateAdminBookingStatus } from '../queries'
import type { Booking, BookingStatus } from '../schema'

interface BookingStatusDialogProps {
  booking: Booking | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function BookingStatusDialog({
  booking,
  open,
  onOpenChange,
  onSuccess,
}: BookingStatusDialogProps) {
  const { t } = useTranslation()
  const [status, setStatus] = useState<BookingStatus>(
    booking?.status || 'pending'
  )
  const [responseNote, setResponseNote] = useState<string>(
    booking?.responseNote || ''
  )
  const [isPending, setIsPending] = useState(false)

  const handleOpen = (nextOpen: boolean) => {
    if (nextOpen && booking) {
      setStatus(booking.status)
      setResponseNote(booking.responseNote || '')
    }
    onOpenChange(nextOpen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!booking) return

    setIsPending(true)
    try {
      await apiUpdateAdminBookingStatus({
        id: booking.id,
        status,
        responseNote: responseNote.trim() || undefined,
      })
      toast.success(
        t(
          'bookings.messages.statusUpdated',
          'Cập nhật trạng thái booking thành công'
        )
      )
      onSuccess()
      onOpenChange(false)
    } catch {
      toast.error(
        t('bookings.messages.updateFailed', 'Cập nhật trạng thái thất bại')
      )
    } finally {
      setIsPending(false)
    }
  }

  if (!booking) return null

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {t('bookings.dialog.moderateTitle', 'Xử lý trạng thái & Khiếu nại')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 pt-2'>
          <div className='bg-muted/20 space-y-1 rounded-lg border p-3 text-sm'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground text-xs'>Hợp đồng:</span>
              <span className='font-mono font-semibold'>#{booking.id}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground text-xs'>Người đặt:</span>
              <span className='font-medium'>{booking.fullName}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground text-xs'>Loại hình:</span>
              <span className='font-medium'>{booking.bookingType}</span>
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label>{t('bookings.fields.status', 'Trạng thái can thiệp')}</Label>
            <Select
              value={status}
              onValueChange={(val) => setStatus(val as BookingStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='pending'>
                  {t('bookings.status.pending', 'Chờ phản hồi (Pending)')}
                </SelectItem>
                <SelectItem value='accepted'>
                  {t('bookings.status.accepted', 'Đã chấp nhận (Accepted)')}
                </SelectItem>
                <SelectItem value='completed'>
                  {t(
                    'bookings.status.completed',
                    'Hoàn tất nghiệm thu (Completed)'
                  )}
                </SelectItem>
                <SelectItem value='declined'>
                  {t('bookings.status.declined', 'Từ chối (Declined)')}
                </SelectItem>
                <SelectItem value='cancelled'>
                  {t(
                    'bookings.status.cancelled',
                    'Hủy / Tranh chấp (Cancelled)'
                  )}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-1.5'>
            <Label>
              {t(
                'bookings.fields.responseNote',
                'Ghi chú phân giải / Quyết định Admin'
              )}
            </Label>
            <Textarea
              rows={3}
              placeholder={t(
                'bookings.fields.responseNotePlaceholder',
                'Nhập lý do thay đổi trạng thái hoặc kết quả xử lý khiếu nại...'
              )}
              value={responseNote}
              onChange={(e) => setResponseNote(e.target.value)}
              maxLength={500}
            />
            <span className='text-muted-foreground text-[10px]'>
              {responseNote.length}/500 ký tự
            </span>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {t('common.cancel', 'Hủy')}
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending
                ? t('common.saving', 'Đang lưu...')
                : t('common.save', 'Cập nhật')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
