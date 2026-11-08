import { z } from 'zod'

export const tagCategorySchema = z.enum([
  'general',
  'copyright',
  'character',
  'artist',
  'meta',
  'system',
])

export const tagSafetyRatingSchema = z.enum([
  'safe',
  'sensitive',
  'r18',
  'r18g',
])

export const tagStatusSchema = z.enum(['active', 'pending', 'merged', 'banned'])

export const tagAliasTypeSchema = z.enum([
  'synonym',
  'abbreviation',
  'typo',
  'legacy_merge',
])

export const tagRelationTypeSchema = z.enum([
  'hierarchy',
  'related',
  'disambiguation',
])

export const taggableEntityTypeSchema = z.enum([
  'cms_page',
  'artwork',
  'file',
  'post',
])

export type TagCategory = z.infer<typeof tagCategorySchema>
export type TagSafetyRating = z.infer<typeof tagSafetyRatingSchema>
export type TagStatus = z.infer<typeof tagStatusSchema>
export type TagAliasType = z.infer<typeof tagAliasTypeSchema>
export type TagRelationType = z.infer<typeof tagRelationTypeSchema>
export type TaggableEntityType = z.infer<typeof taggableEntityTypeSchema>

export const TAG_LOCALES = [
  { value: 'en', label: 'English' },
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'jp', label: '日本語' },
] as const

export const tagTranslationSchema = z.object({
  id: z.string(),
  locale: z.string(),
  translatedName: z.string(),
  shortSummary: z.string().nullish(),
  source: z.string().optional(),
})

export const tagAliasSchema = z.object({
  id: z.string(),
  aliasName: z.string(),
  aliasType: tagAliasTypeSchema,
  locale: z.string().nullish(),
})

export const tagSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  translatedName: z.string().nullish(),
  shortSummary: z.string().nullish(),
  featuredImageUrl: z.string().nullish(),
  category: tagCategorySchema,
  safetyRating: tagSafetyRatingSchema,
  status: tagStatusSchema,
  isOfficial: z.boolean(),
  isSystem: z.boolean(),
  usageCount: z.number(),
  trendingScore: z.number(),
  translations: z.array(tagTranslationSchema).optional(),
  aliases: z.array(tagAliasSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const tagGraphSchema = z.object({
  parents: z.array(tagSummarySchema),
  children: z.array(tagSummarySchema),
  siblings: z.array(tagSummarySchema),
  related: z.array(tagSummarySchema),
  disambiguations: z.array(tagSummarySchema),
})

export const tagDetailSchema = tagSummarySchema.extend({
  redirectSlug: z.string().nullish(),
  mergedIntoId: z.string().nullish(),
  isMutedByCurrentUser: z.boolean().optional(),
  hasEncyclopedia: z.boolean().optional(),
  graph: tagGraphSchema,
})

export const tagAutocompleteItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  translatedName: z.string().nullish(),
  matchedAlias: z.string().nullish(),
  category: tagCategorySchema,
  safetyRating: tagSafetyRatingSchema,
  isOfficial: z.boolean(),
  usageCount: z.number(),
})

export const mergeTagPreviewSchema = z.object({
  sourceTag: tagSummarySchema,
  targetTag: tagSummarySchema,
  affectedEntityTagsCount: z.number(),
  aliasesToTransferCount: z.number(),
  relationsToRewireCount: z.number(),
})

export const tagEncyclopediaRevisionSchema = z.object({
  id: z.string(),
  revisionNumber: z.number(),
  summary: z.string(),
  body: z.string(),
  changeNote: z.string().nullish(),
  editorName: z.string().nullish(),
  createdAt: z.string(),
})

export const tagEncyclopediaSchema = z.object({
  id: z.coerce.string(),
  tagId: z.coerce.string(),
  locale: z.string(),
  summary: z.string(),
  body: z.string().optional().default(''),
  featuredImageUrl: z.string().nullish(),
  featuredFileId: z.string().nullish(),
  isEditLocked: z.boolean(),
  currentRevision: z.number(),
  viewCount: z.number(),
  tag: tagSummarySchema.extend({
    redirectSlug: z.string().nullish(),
    mergedIntoId: z.string().nullish(),
    isMutedByCurrentUser: z.boolean().optional(),
    hasEncyclopedia: z.boolean().optional(),
    graph: tagGraphSchema.optional(),
  }),
  revisions: z.array(tagEncyclopediaRevisionSchema).optional(),
  updatedAt: z.string(),
})

export const entityTagLogSchema = z.object({
  id: z.string(),
  entityType: taggableEntityTypeSchema,
  entityId: z.string(),
  tagId: z.string().nullish(),
  tagNameSnapshot: z.string().nullish(),
  action: z.string(),
  actorName: z.string().nullish(),
  isAdminAction: z.boolean(),
  createdAt: z.string(),
})

export const entityTagItemSchema = z.object({
  id: z.string(),
  tagId: z.string(),
  slug: z.string(),
  name: z.string(),
  translatedName: z.string().nullish(),
  category: tagCategorySchema,
  safetyRating: tagSafetyRatingSchema,
  isOfficial: z.boolean(),
  isAuthorTag: z.boolean(),
  locked: z.boolean(),
  deletable: z.boolean(),
  sortOrder: z.number(),
  usageCount: z.number(),
})

export const entityTagListSchema = z.object({
  entityType: taggableEntityTypeSchema,
  entityId: z.coerce.string(),
  tagEditLocked: z.boolean(),
  maxTags: z.number(),
  totalCount: z.number().optional(),
  canEdit: z.boolean(),
  isOwner: z.boolean(),
  tags: z.array(entityTagItemSchema),
})

export const tagTranslationFormSchema = z.object({
  locale: z.string().min(2).max(10),
  translatedName: z.string().max(120),
  shortSummary: z.string().max(280).optional(),
})

export const tagAliasFormSchema = z.object({
  aliasName: z.string().trim().min(1, 'Alias keyword is required').max(120),
  aliasType: tagAliasTypeSchema,
  locale: z.string().max(10).optional(),
})

export const tagFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Canonical tag name is required')
    .max(100, 'Tag name must be at most 100 characters')
    .refine((val) => !val.startsWith('-'), {
      message: 'Tag name cannot start with "-"',
    }),
  slug: z.string().trim().max(160).optional(),
  category: tagCategorySchema,
  safetyRating: tagSafetyRatingSchema,
  status: tagStatusSchema,
  isOfficial: z.boolean(),
  isSystem: z.boolean(),
  translations: z.array(tagTranslationFormSchema),
  aliases: z.array(tagAliasFormSchema),
})

export const tagEncyclopediaFormSchema = z.object({
  locale: z.string().min(2).max(10),
  summary: z.string().trim().min(1, 'Summary is required').max(500),
  body: z.string().min(1, 'Wiki article body is required'),
  featuredImageUrl: z.string().max(500).optional(),
  featuredFileId: z.string().nullish(),
  changeNote: z.string().max(255).optional(),
  isEditLocked: z.boolean(),
})

export type TagSummary = z.infer<typeof tagSummarySchema>
export type TagDetail = z.infer<typeof tagDetailSchema>
export type TagTranslation = NonNullable<TagDetail['translations']>[number]
export type TagAlias = NonNullable<TagDetail['aliases']>[number]
export type TagAutocompleteItem = z.infer<typeof tagAutocompleteItemSchema>
export type MergeTagPreview = z.infer<typeof mergeTagPreviewSchema>
export type TagEncyclopedia = z.infer<typeof tagEncyclopediaSchema>
export type TagEncyclopediaRevision = z.infer<
  typeof tagEncyclopediaRevisionSchema
>
export type EntityTagLog = z.infer<typeof entityTagLogSchema>
export type EntityTagItem = z.infer<typeof entityTagItemSchema>
export type EntityTagList = z.infer<typeof entityTagListSchema>
export type TagFormValues = z.infer<typeof tagFormSchema>
export type TagEncyclopediaFormValues = z.infer<
  typeof tagEncyclopediaFormSchema
>

export const TagColumnKey = {
  name: 'name',
  category: 'category',
  safetyRating: 'safetyRating',
  status: 'status',
  usageCount: 'usageCount',
  trendingScore: 'trendingScore',
  updatedAt: 'updatedAt',
} as const
