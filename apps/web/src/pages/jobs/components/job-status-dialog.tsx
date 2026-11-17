import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import { apiUpdateAdminJobStatus } from '../queries'
import type { Job } from '../schema'

interface JobStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  job: Job | null
}

export function JobStatusDialog({
  open,
  onOpenChange,
  job,
}: JobStatusDialogProps) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<string>(job?.status ?? 'open')
  const [isFeatured, setIsFeatured] = useState<boolean>(
    job?.isFeatured ?? false
  )

  const updateStatusMutation = useMutation({
    mutationFn: apiUpdateAdminJobStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] })
      toast.success('Cập nhật trạng thái tin tuyển dụng thành công')
      onOpenChange(false)
    },
    onError: restApiErrorHandler,
  })

  if (!job) return null

  const handleSave = () => {
    updateStatusMutation.mutate({
      id: job.id,
      status,
      isFeatured,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[420px]'>
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái tin tuyển dụng</DialogTitle>
          <DialogDescription>
            {job.title} ({job.brandName})
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-3'>
          <div className='space-y-2'>
            <Label htmlFor='status'>Trạng thái tin</Label>
            <Select value={status} onValueChange={(val) => setStatus(val)}>
              <SelectTrigger id='status'>
                <SelectValue placeholder='Chọn trạng thái' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='open'>Đang tuyển dụng (Open)</SelectItem>
                <SelectItem value='pending_approval'>
                  Chờ duyệt (Pending Approval)
                </SelectItem>
                <SelectItem value='closed'>
                  Đã đóng / Đủ chỉ tiêu (Closed)
                </SelectItem>
                <SelectItem value='draft'>Bản nháp (Draft)</SelectItem>
                <SelectItem value='expired'>Hết hạn (Expired)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-center justify-between rounded-lg border p-3'>
            <div className='space-y-0.5'>
              <Label className='text-sm font-medium'>Nổi bật (Featured)</Label>
              <p className='text-muted-foreground text-xs'>
                Ghim tin lên đầu danh sách tuyển dụng
              </p>
            </div>
            <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
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
