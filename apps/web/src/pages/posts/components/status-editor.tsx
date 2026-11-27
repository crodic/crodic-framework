import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { FormActions } from '@/components/layout/form-actions'
import { PageHeader } from '@/components/layout/page-shell'
import { apiUpdateAdminPostStatus } from '../queries'
import type { Post, PostStatus } from '../schema'

interface PostStatusEditorProps {
  post: Post | null
  onClose: () => void
  onSuccess: () => void
}

export function PostStatusEditor({
  post,
  onClose,
  onSuccess,
}: PostStatusEditorProps) {
  const { t } = useTranslation()
  const [status, setStatus] = useState<PostStatus>(post?.status || 'published')
  const [isPublic, setIsPublic] = useState<boolean>(post?.isPublic ?? true)
  const [reason, setReason] = useState('')
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!post) return

    setIsPending(true)
    try {
      await apiUpdateAdminPostStatus({
        id: post.id,
        status,
        isPublic,
        reason: reason.trim() ? reason.trim() : undefined,
      })
      toast.success(
        t(
          'posts.messages.statusUpdated',
          'Cập nhật trạng thái bài viết thành công'
        )
      )
      onSuccess()
      onClose()
    } catch {
      toast.error(
        t('posts.messages.updateFailed', 'Cập nhật trạng thái thất bại')
      )
    } finally {
      setIsPending(false)
    }
  }

  if (!post) return null

  const pageActions = (
    <>
      <Button
        type='button'
        variant='outline'
        onClick={() => onClose()}
        disabled={isPending}
      >
        {t('common.cancel', 'Hủy')}
      </Button>
      <Button type='submit' disabled={isPending}>
        {isPending
          ? t('common.saving', 'Đang lưu...')
          : t('common.save', 'Lưu thay đổi')}
      </Button>
    </>
  )

  return (
    <>
      <div className='flex w-full min-w-0 flex-col gap-6'>
        <PageHeader
          title={<>{t('posts.dialog.moderateTitle', 'Kiểm duyệt bài đăng')}</>}
        />

        <form onSubmit={handleSubmit} className='space-y-4 pt-2'>
          {pageActions}

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

          {status !== 'published' && (
            <div className='space-y-1.5'>
              <Label htmlFor='moderation-reason'>
                {t(
                  'posts.fields.moderationReason',
                  'Lý do từ chối / Ghi chú kiểm duyệt'
                )}
              </Label>
              <Textarea
                id='moderation-reason'
                rows={3}
                placeholder={t(
                  'posts.fields.moderationReasonPlaceholder',
                  'Nhập lý do gửi thông báo cho tác giả (VD: Hình ảnh không liên quan đến cosplay nhân vật anime/game, vi phạm bản quyền...)'
                )}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <p className='text-muted-foreground text-xs'>
                {t(
                  'posts.fields.moderationReasonHelp',
                  'Lý do này sẽ được gửi trực tiếp qua thông báo hệ thống đến tác giả bài viết.'
                )}
              </p>
            </div>
          )}

          <FormActions footer>{pageActions}</FormActions>
        </form>
      </div>
    </>
  )
}
