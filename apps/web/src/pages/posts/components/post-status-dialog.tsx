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
import { Switch } from '@/components/ui/switch'
import { apiUpdateAdminPostStatus } from '../queries'
import type { Post, PostStatus } from '../schema'

interface PostStatusDialogProps {
  post: Post | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function PostStatusDialog({
  post,
  open,
  onOpenChange,
  onSuccess,
}: PostStatusDialogProps) {
  const { t } = useTranslation()
  const [status, setStatus] = useState<PostStatus>(post?.status || 'published')
  const [isPublic, setIsPublic] = useState<boolean>(post?.isPublic ?? true)
  const [isPending, setIsPending] = useState(false)

  // Sync state when post changes
  const handleOpen = (nextOpen: boolean) => {
    if (nextOpen && post) {
      setStatus(post.status)
      setIsPublic(post.isPublic)
    }
    onOpenChange(nextOpen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!post) return

    setIsPending(true)
    try {
      await apiUpdateAdminPostStatus({
        id: post.id,
        status,
        isPublic,
      })
      toast.success(
        t(
          'posts.messages.statusUpdated',
          'Cập nhật trạng thái bài viết thành công'
        )
      )
      onSuccess()
      onOpenChange(false)
    } catch {
      toast.error(
        t('posts.messages.updateFailed', 'Cập nhật trạng thái thất bại')
      )
    } finally {
      setIsPending(false)
    }
  }

  if (!post) return null

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {t('posts.dialog.moderateTitle', 'Kiểm duyệt bài đăng')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 pt-2'>
          <div className='space-y-1.5'>
            <Label>{t('posts.fields.title', 'Tiêu đề bài viết')}</Label>
            <p className='text-muted-foreground line-clamp-2 text-sm font-medium'>
              {post.title}
            </p>
          </div>

          <div className='space-y-1.5'>
            <Label>{t('posts.fields.status', 'Trạng thái bài viết')}</Label>
            <Select
              value={status}
              onValueChange={(val) => setStatus(val as PostStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='published'>
                  {t('posts.status.published', 'Đã xuất bản (Published)')}
                </SelectItem>
                <SelectItem value='pending_review'>
                  {t(
                    'posts.status.pending_review',
                    'Chờ duyệt (Pending Review)'
                  )}
                </SelectItem>
                <SelectItem value='hidden'>
                  {t('posts.status.hidden', 'Ẩn / Khóa vi phạm (Hidden)')}
                </SelectItem>
                <SelectItem value='draft'>
                  {t('posts.status.draft', 'Bản nháp (Draft)')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-center justify-between rounded-lg border p-3'>
            <div className='space-y-0.5'>
              <Label>{t('posts.fields.visibility', 'Chế độ công khai')}</Label>
              <p className='text-muted-foreground text-xs'>
                {t(
                  'posts.fields.visibilityHelp',
                  'Cho phép người dùng vãng lai và thành viên xem bài viết'
                )}
              </p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
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
                : t('common.save', 'Lưu thay đổi')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
