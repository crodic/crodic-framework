import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, XCircle } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { apiResolveContentReport } from '../queries'
import type { ContentReport } from '../schema'

interface ResolveReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  report: ContentReport | null
}

export function ResolveReportDialog({
  open,
  onOpenChange,
  report,
}: ResolveReportDialogProps) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<'resolved' | 'dismissed'>('resolved')
  const [resolutionNote, setResolutionNote] = useState('')

  const resolveMutation = useMutation({
    mutationFn: apiResolveContentReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-content-reports'] })
      toast.success('Báo cáo đã được xử lý thành công')
      onOpenChange(false)
      setResolutionNote('')
    },
    onError: restApiErrorHandler,
  })

  if (!report) return null

  const handleResolve = () => {
    resolveMutation.mutate({
      id: report.id,
      data: {
        status,
        resolutionNote: resolutionNote.trim() || undefined,
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[480px]'>
        <DialogHeader>
          <DialogTitle>Xử lý báo cáo vi phạm #{report.id}</DialogTitle>
          <DialogDescription>
            Đưa ra quyết định phê duyệt xử lý hoặc bác bỏ báo cáo này.
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-3'>
          <div className='bg-muted/40 space-y-1.5 rounded-md border p-3 text-sm'>
            <div>
              <span className='font-semibold'>Loại đối tượng:</span>{' '}
              <span className='bg-muted rounded border px-1.5 py-0.5 font-mono text-xs uppercase'>
                {report.targetType} #{report.targetId}
              </span>
            </div>
            <div>
              <span className='font-semibold'>Lý do:</span> {report.reason}
            </div>
            {report.description && (
              <div className='text-muted-foreground text-xs'>
                Mô tả chi tiết: {report.description}
              </div>
            )}
            <div className='text-muted-foreground text-xs'>
              Người báo cáo:{' '}
              {report.reporterName ||
                report.reporterEmail ||
                `User #${report.reporterUserId}`}
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='status'>Quyết định xử lý</Label>
            <Select
              value={status}
              onValueChange={(val: 'resolved' | 'dismissed') => setStatus(val)}
            >
              <SelectTrigger id='status'>
                <SelectValue placeholder='Chọn trạng thái' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='resolved'>
                  <div className='flex items-center gap-2 text-emerald-600 dark:text-emerald-400'>
                    <CheckCircle2 className='size-4' />
                    <span>Xác nhận vi phạm (Resolved)</span>
                  </div>
                </SelectItem>
                <SelectItem value='dismissed'>
                  <div className='text-muted-foreground flex items-center gap-2'>
                    <XCircle className='size-4' />
                    <span>Bác bỏ báo cáo (Dismissed)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='note'>Ghi chú xử lý (Resolution Note)</Label>
            <Textarea
              id='note'
              placeholder='Nhập ghi chú hoặc biện pháp xử lý đã thực hiện...'
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={resolveMutation.isPending}
          >
            Hủy
          </Button>
          <Button onClick={handleResolve} disabled={resolveMutation.isPending}>
            {resolveMutation.isPending ? 'Đang lưu...' : 'Lưu kết quả'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
