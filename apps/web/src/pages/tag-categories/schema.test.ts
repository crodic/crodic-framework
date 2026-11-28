import i18n from '@/i18n'
import en from '@/i18n/locales/en.json'
import vi from '@/i18n/locales/vi.json'
import { beforeEach, describe, expect, it } from 'vitest'
import { tagCategoryFormSchema } from './schema'

const validCategory = {
  name: 'General',
  slug: 'general',
  description: '',
  color: '#64748b',
  icon: 'Tag',
  sortOrder: 0,
  isActive: true,
}

describe('Tag category localization', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('translates validation when the active language changes', async () => {
    const input = { ...validCategory, name: '' }
    const english = tagCategoryFormSchema.safeParse(input)
    expect(english.error?.issues[0]?.message).toBe(
      en['tagCategories.validation.nameRequired']
    )
    await i18n.changeLanguage('vi')
    const vietnamese = tagCategoryFormSchema.safeParse(input)
    expect(vietnamese.error?.issues[0]?.message).toBe(
      vi['tagCategories.validation.nameRequired']
    )
  })

  it('provides both languages for every category label and error', () => {
    const keys = new Set(
      [...Object.keys(en), ...Object.keys(vi)].filter((key) =>
        key.startsWith('tagCategories.')
      )
    )
    for (const key of keys) {
      expect((en as unknown as Record<string, string>)[key], key).toBeTruthy()
      expect((vi as unknown as Record<string, string>)[key], key).toBeTruthy()
    }
  })
})
