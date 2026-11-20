import { z } from 'zod'

export const PostColumnKey = {
  id: 'id',
  cover: 'cover',
  title: 'title',
  author: 'author',
  albumCategory: 'albumCategory',
  postType: 'postType',
  metrics: 'metrics',
  status: 'status',
  isFeaturedWork: 'isFeaturedWork',
  isPublic: 'isPublic',
  publishedAt: 'publishedAt',
  createdAt: 'createdAt',
} as const

export const postStatusEnum = z.enum([
  'published',
  'pending_review',
  'hidden',
  'draft',
])
export type PostStatus = z.infer<typeof postStatusEnum>

export const postAuthorSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  handle: z.string(),
  avatarUrl: z.string().nullable().optional(),
  isVerified: z.boolean().default(false),
  role: z.string().optional(),
})

export const postMediaSchema = z.object({
  id: z.string(),
  postId: z.string(),
  fileId: z.string().nullable().optional(),
  mediaUrl: z.string(),
  mediaType: z.string().default('image'),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  sortOrder: z.number().default(0),
  isCover: z.boolean().default(false),
  caption: z.string().nullable().optional(),
})

export const postSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  caption: z.string().nullable().optional(),
  postType: z.string(),
  albumCategory: z.string(),
  albumCategoryLabel: z.string().nullable().optional(),
  characterName: z.string().nullable().optional(),
  fandomName: z.string().nullable().optional(),
  coverImageUrl: z.string(),
  videoUrl: z.string().nullable().optional(),
  isCollage: z.boolean().default(false),
  collagePreviewUrls: z.array(z.string()).default([]),
  tagNamesCache: z.array(z.string()).default([]),
  isPublic: z.boolean().default(true),
  isFeaturedWork: z.boolean().default(false),
  status: postStatusEnum,
  photosCount: z.number().default(1),
  likesCount: z.number().default(0),
  commentsCount: z.number().default(0),
  viewsCount: z.number().default(0),
  trendingScore: z.number().default(0),
  publishedAt: z.string().nullable().optional(),
  author: postAuthorSchema,
  media: z.array(postMediaSchema).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type Post = z.infer<typeof postSchema>

export const updatePostStatusSchema = z.object({
  status: postStatusEnum,
  isPublic: z.boolean().optional(),
})

export type UpdatePostStatusValues = z.infer<typeof updatePostStatusSchema>
