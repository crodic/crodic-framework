import { describe, expect, it } from 'vitest'
import {
  tagEncyclopediaFormSchema,
  tagEncyclopediaSchema,
  tagFormSchema,
  tagSummarySchema,
} from './schema'

describe('Tag Admin Zod Schemas', () => {
  it('validates canonical tag payload and rejects leading exclusion minus', () => {
    const valid = tagFormSchema.safeParse({
      name: '葬送のフリーレン',
      slug: 'frieren-beyond-journeys-end',
      category: 'copyright',
      safetyRating: 'safe',
      status: 'active',
      isOfficial: true,
      isSystem: false,
      translations: [
        {
          locale: 'en',
          translatedName: "Frieren: Beyond Journey's End",
          shortSummary: 'Fantasy series',
        },
      ],
      aliases: [{ aliasName: 'Frieren', aliasType: 'synonym', locale: 'en' }],
    })
    expect(valid.success).toBe(true)

    const invalid = tagFormSchema.safeParse({
      name: '-AI-Generated',
      category: 'system',
      safetyRating: 'safe',
      status: 'active',
      isOfficial: false,
      isSystem: true,
      translations: [],
      aliases: [],
    })
    expect(invalid.success).toBe(false)
  })

  it('validates encyclopedia form values including featuredImageUrl and featuredFileId', () => {
    const parsed = tagEncyclopediaFormSchema.safeParse({
      locale: 'vi',
      summary: 'Tóm tắt bách khoa toàn thư',
      body: '<p>Nội dung bài viết</p>',
      featuredImageUrl:
        'https://example.com/storage/uploads/image/tags/cover.webp',
      featuredFileId: '42',
      changeNote: 'Added featured header image',
      isEditLocked: false,
    })
    expect(parsed.success).toBe(true)
  })

  it('parses legacy_merge aliasType returned after atomic tag merges', () => {
    const summary = tagSummarySchema.safeParse({
      id: '1',
      slug: 'original',
      name: 'Original',
      translatedName: 'Original Creation',
      shortSummary: 'Original works',
      category: 'system',
      safetyRating: 'safe',
      status: 'active',
      isOfficial: true,
      isSystem: true,
      usageCount: 5,
      trendingScore: 42.5,
      aliases: [
        { id: '10', aliasName: 'OC', aliasType: 'abbreviation', locale: null },
        {
          id: '11',
          aliasName: 'MergedOldTag',
          aliasType: 'legacy_merge',
          locale: null,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    expect(summary.success).toBe(true)
  })

  it('parses lightweight encyclopedia listing rows without body or tag.graph', () => {
    const now = new Date().toISOString()
    const row = tagEncyclopediaSchema.safeParse({
      id: '1',
      tagId: '4',
      locale: 'en',
      summary: "Frieren: Beyond Journey's End overview",
      isEditLocked: false,
      currentRevision: 1,
      viewCount: 12,
      updatedAt: now,
      tag: {
        id: '4',
        slug: 'frieren-beyond-journeys-end',
        name: '葬送のフリーレン',
        translatedName: "Frieren: Beyond Journey's End",
        shortSummary: 'Fantasy series',
        category: 'copyright',
        safetyRating: 'safe',
        status: 'active',
        isOfficial: true,
        isSystem: false,
        usageCount: 3,
        trendingScore: 30,
        createdAt: now,
        updatedAt: now,
      },
    })
    expect(row.success).toBe(true)
    if (row.success) {
      expect(row.data.body).toBe('')
    }
  })
})
