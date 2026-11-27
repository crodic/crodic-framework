import { useState } from 'react'
import { Eye, Heart, MessageSquare, ShieldCheck, Tag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/layout/page-shell'
import type { Post } from '../schema'

interface PostDetailProps {
  post: Post | null
}

export function PostDetail({ post }: PostDetailProps) {
  const { t } = useTranslation()
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)

  if (!post) return null

  const videoItem = post.media?.find((m) => m.mediaType === 'video')
  const fallbackVideoUrl = post.videoUrl || videoItem?.mediaUrl || null
  const activeUrl =
    selectedUrl ||
    (post.postType === 'video' && fallbackVideoUrl
      ? fallbackVideoUrl
      : post.coverImageUrl)
  const selectedMedia = post.media?.find((m) => m.mediaUrl === activeUrl)
  const isActiveVideo =
    selectedMedia?.mediaType === 'video' ||
    (Boolean(fallbackVideoUrl) && activeUrl === fallbackVideoUrl)

  return (
    <>
      <div className='flex w-full min-w-0 flex-col gap-6'>
        <PageHeader
          title={
            <>
              {post.title}
              {post.isFeaturedWork && (
                <Badge
                  variant='default'
                  className='bg-primary hover:bg-primary'
                >
                  ★ {t('posts.featured', 'Nổi bật')}
                </Badge>
              )}
            </>
          }
        />

        <div className='min-w-0'>
          <div className='space-y-4'>
            {/* Main Preview Image or Video */}
            <div className='bg-muted/40 relative flex h-80 w-full items-center justify-center overflow-hidden rounded-lg border'>
              {isActiveVideo && activeUrl ? (
                <video
                  src={activeUrl}
                  poster={post.coverImageUrl}
                  controls
                  playsInline
                  className='h-full w-full bg-black object-contain'
                />
              ) : (
                <img
                  src={activeUrl}
                  alt={post.title}
                  className='h-full w-full object-contain'
                />
              )}
            </div>

            {/* Media Gallery Thumbnails if multiple */}
            {post.media && post.media.length > 1 && (
              <div className='flex gap-2 overflow-x-auto pb-2'>
                {post.media.map((m, idx) => (
                  <button
                    key={m.id || idx}
                    type='button'
                    onClick={() => setSelectedUrl(m.mediaUrl)}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded border transition-all ${
                      activeUrl === m.mediaUrl
                        ? 'ring-primary border-primary ring-2'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {m.mediaType === 'video' ? (
                      <video
                        src={m.mediaUrl}
                        muted
                        className='h-full w-full bg-black object-cover'
                      />
                    ) : (
                      <img
                        src={m.mediaUrl}
                        alt={m.caption || `photo-${idx}`}
                        className='h-full w-full object-cover'
                      />
                    )}
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
                      <ShieldCheck className='text-primary size-4' />
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
                  <Heart className='text-destructive size-3.5' />
                  {post.likesCount}
                </span>
                <span className='flex items-center gap-1'>
                  <MessageSquare className='text-primary size-3.5' />
                  {post.commentsCount}
                </span>
                <span className='flex items-center gap-1'>
                  <Eye className='text-primary size-3.5' />
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
                  {t(`posts.categories.${post.albumCategory}`, {
                    defaultValue: post.albumCategoryLabel || post.albumCategory,
                  })}
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
        </div>
      </div>
    </>
  )
}
