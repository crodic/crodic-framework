import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Switch } from '@/components/ui/switch'
import { apiUpdateAdminEventStatus } from '../queries'
import type { Event, EventStatus } from '../schema'

interface EventStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: Event | null
}

export function EventStatusDialog({
  open,
  onOpenChange,
  event,
}: EventStatusDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<EventStatus>(
    (event?.status as EventStatus) ?? 'upcoming'
  )
  const [isFeaturedFestival, setIsFeaturedFestival] = useState<boolean>(
    event?.isFeaturedFestival ?? false
  )
  const [isRecruiting, setIsRecruiting] = useState<boolean>(
    event?.isRecruiting ?? false
  )

  const updateStatusMutation = useMutation({
    mutationFn: apiUpdateAdminEventStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] })
      toast.success(
        t(
          'events.messages.statusUpdated',
          'Cập nhật trạng thái sự kiện thành công'
        )
      )
      onOpenChange(false)
    },
    onError: restApiErrorHandler,
  })

  if (!event) return null

  const handleSave = () => {
    updateStatusMutation.mutate({
      id: event.id,
      status,
      isFeaturedFestival,
      isRecruiting,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[440px]'>
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái sự kiện</DialogTitle>
          <DialogDescription>{event.title}</DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-3'>
          <div className='space-y-2'>
            <Label htmlFor='status'>Trạng thái sự kiện</Label>
            <Select
              value={status}
              onValueChange={(val) => setStatus(val as EventStatus)}
            >
              <SelectTrigger id='status'>
                <SelectValue placeholder='Chọn trạng thái' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='upcoming'>Sắp diễn ra (Upcoming)</SelectItem>
                <SelectItem value='ongoing'>Đang diễn ra (Ongoing)</SelectItem>
                <SelectItem value='completed'>
                  Đã kết thúc (Completed)
                </SelectItem>
                <SelectItem value='cancelled'>Đã hủy (Cancelled)</SelectItem>
                <SelectItem value='draft'>Bản nháp (Draft)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-center justify-between rounded-lg border p-3'>
            <div className='space-y-0.5'>
              <Label className='text-sm font-medium'>
                Sự kiện tiêu điểm (Featured Festival)
              </Label>
              <p className='text-muted-foreground text-xs'>
                Hiển thị trong banner lớn tiêu điểm trên trang chủ
              </p>
            </div>
            <Switch
              checked={isFeaturedFestival}
              onCheckedChange={setIsFeaturedFestival}
            />
          </div>

          <div className='flex items-center justify-between rounded-lg border p-3'>
            <div className='space-y-0.5'>
              <Label className='text-sm font-medium'>
                Đang mở đăng ký (Recruiting)
              </Label>
              <p className='text-muted-foreground text-xs'>
                Cho phép Cosplayer & Khách mời nộp đơn tham gia
              </p>
            </div>
            <Switch checked={isRecruiting} onCheckedChange={setIsRecruiting} />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={updateStatusMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateStatusMutation.isPending}
          >
            {updateStatusMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
