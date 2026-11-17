import { describe, expect, it } from 'vitest'
import {
  postAuthorSchema,
  postMediaSchema,
  postSchema,
  updatePostStatusSchema,
} from './schema'

describe('Post Admin Schemas', () => {
  it('validates a valid post object correctly', () => {
    const rawPost = {
      id: '1',
      slug: 'acheron-cosplay-album',
      title: 'Acheron - Honkai Star Rail',
      caption: 'Full cosplay photoshoot in Ho Chi Minh City',
      postType: 'photoset',
      albumCategory: 'series',
      albumCategoryLabel: 'Bộ ảnh',
      characterName: 'Acheron',
      fandomName: 'Honkai: Star Rail',
      coverImageUrl: 'https://cdn.kosume.com/posts/acheron.jpg',
      isCollage: false,
      collagePreviewUrls: [],
      tagNamesCache: ['cosplay', 'acheron', 'hsr'],
      isPublic: true,
      isFeaturedWork: true,
      status: 'published',
      photosCount: 5,
      likesCount: 120,
      commentsCount: 15,
      viewsCount: 1500,
      trendingScore: 95,
      publishedAt: '2026-11-15T00:00:00.000Z',
      author: {
        id: '10',
        displayName: 'Miu Cosplay',
        handle: '@miucos',
        avatarUrl: 'https://cdn.kosume.com/avatars/miu.jpg',
        isVerified: true,
      },
    }

    const parsed = postSchema.safeParse(rawPost)
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.title).toBe('Acheron - Honkai Star Rail')
      expect(parsed.data.isFeaturedWork).toBe(true)
      expect(parsed.data.author.displayName).toBe('Miu Cosplay')
    }
  })

  it('validates update post status schema', () => {
    const valid = updatePostStatusSchema.safeParse({
      status: 'hidden',
      isPublic: false,
    })
    expect(valid.success).toBe(true)

    const invalid = updatePostStatusSchema.safeParse({
      status: 'invalid_status',
    })
    expect(invalid.success).toBe(false)
  })

  it('validates post author and media schema', () => {
    const author = postAuthorSchema.safeParse({
      id: '1',
      displayName: 'Kafka',
      handle: '@kafka',
      isVerified: true,
    })
    expect(author.success).toBe(true)

    const media = postMediaSchema.safeParse({
      id: '1',
      postId: '1',
      mediaUrl: 'https://cdn.kosume.com/media/1.jpg',
      mediaType: 'image',
      sortOrder: 1,
      isCover: true,
    })
    expect(media.success).toBe(true)
  })
})
