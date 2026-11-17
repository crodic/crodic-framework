import { useState } from 'react'
import { Eye, Heart, MessageSquare, ShieldCheck, Tag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Post } from '../schema'

interface PostDetailDialogProps {
  post: Post | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PostDetailDialog({
  post,
  open,
  onOpenChange,
}: PostDetailDialogProps) {
  const { t } = useTranslation()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  if (!post) return null

  const activeImage = selectedImage || post.coverImageUrl

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[90vh] max-w-3xl flex-col p-6'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-xl font-bold'>
            {post.title}
            {post.isFeaturedWork && (
              <Badge
                variant='default'
                className='bg-amber-500 hover:bg-amber-600'
              >
                ★ {t('posts.featured', 'Nổi bật')}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className='flex-1 pr-3'>
          <div className='space-y-4'>
            {/* Main Preview Image */}
            <div className='bg-muted/40 relative flex h-80 w-full items-center justify-center overflow-hidden rounded-lg border'>
              <img
                src={activeImage}
                alt={post.title}
                className='h-full w-full object-contain'
              />
            </div>

            {/* Media Gallery Thumbnails if multiple */}
            {post.media && post.media.length > 1 && (
              <div className='flex gap-2 overflow-x-auto pb-2'>
                {post.media.map((m, idx) => (
                  <button
                    key={m.id || idx}
                    type='button'
                    onClick={() => setSelectedImage(m.mediaUrl)}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded border transition-all ${
                      activeImage === m.mediaUrl
                        ? 'ring-primary border-primary ring-2'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={m.mediaUrl}
                      alt={m.caption || `photo-${idx}`}
                      className='h-full w-full object-cover'
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Author info & metrics */}
            <div className='bg-muted/30 flex items-center justify-between rounded-lg border p-3'>
              <div className='flex items-center gap-3'>
                <div className='bg-muted flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-sm font-bold'>
                  {post.author.avatarUrl ? (
                    <img
                      src={post.author.avatarUrl}
                      alt={post.author.displayName}
                      className='h-full w-full object-cover'
                    />
                  ) : (
                    post.author.displayName.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className='flex items-center gap-1 text-sm font-semibold'>
                    {post.author.displayName}
                    {post.author.isVerified && (
                      <ShieldCheck className='size-4 text-sky-500' />
                    )}
                  </div>
                  <div className='text-muted-foreground text-xs'>
                    {post.author.handle}
                  </div>
                </div>
              </div>

              {/* Engagement metrics */}
              <div className='text-muted-foreground flex items-center gap-4 text-xs'>
                <span className='flex items-center gap-1'>
                  <Heart className='size-3.5 text-rose-500' />
                  {post.likesCount}
                </span>
                <span className='flex items-center gap-1'>
                  <MessageSquare className='size-3.5 text-blue-500' />
                  {post.commentsCount}
                </span>
                <span className='flex items-center gap-1'>
                  <Eye className='size-3.5 text-emerald-500' />
                  {post.viewsCount}
                </span>
              </div>
            </div>

            {/* Post Metadata details */}
            <div className='grid grid-cols-2 gap-3 text-sm'>
              <div className='bg-card space-y-1 rounded border p-3'>
                <span className='text-muted-foreground text-xs'>
                  {t('posts.fields.category', 'Danh mục')}
                </span>
                <p className='font-medium capitalize'>
                  {post.albumCategoryLabel || post.albumCategory}
                </p>
              </div>

              <div className='bg-card space-y-1 rounded border p-3'>
                <span className='text-muted-foreground text-xs'>
                  {t('posts.fields.character', 'Nhân vật / Tác phẩm')}
                </span>
                <p className='font-medium'>
                  {post.characterName || 'N/A'}{' '}
                  {post.fandomName ? `(${post.fandomName})` : ''}
                </p>
              </div>

              <div className='bg-card space-y-1 rounded border p-3'>
                <span className='text-muted-foreground text-xs'>
                  {t('posts.fields.status', 'Trạng thái kiểm duyệt')}
                </span>
                <div>
                  <Badge
                    variant={
                      post.status === 'published' ? 'default' : 'secondary'
                    }
                  >
                    {post.status}
                  </Badge>
                </div>
              </div>

              <div className='bg-card space-y-1 rounded border p-3'>
                <span className='text-muted-foreground text-xs'>
                  {t('posts.fields.visibility', 'Chế độ hiển thị')}
                </span>
                <p className='font-medium'>
                  {post.isPublic
                    ? t('posts.public', 'Công khai')
                    : t('posts.private', 'Riêng tư')}
                </p>
              </div>
            </div>

            {/* Caption */}
            {post.caption && (
              <div className='bg-card space-y-1 rounded border p-3'>
                <span className='text-muted-foreground text-xs'>
                  {t('posts.fields.caption', 'Nội dung bài viết')}
                </span>
                <p className='text-sm whitespace-pre-wrap'>{post.caption}</p>
              </div>
            )}

            {/* Tags */}
            {post.tagNamesCache && post.tagNamesCache.length > 0 && (
              <div className='flex flex-wrap items-center gap-1.5'>
                <Tag className='text-muted-foreground size-3.5' />
                {post.tagNamesCache.map((tag) => (
                  <Badge key={tag} variant='outline' className='text-xs'>
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
