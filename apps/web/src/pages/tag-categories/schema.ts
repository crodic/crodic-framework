import { z } from 'zod'
import i18n from '@/i18n'

export const tagCategorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  color: z.string(),
  icon: z.string(),
  sortOrder: z.number(),
  isSystem: z.boolean(),
  isActive: z.boolean(),
  tagCount: z.number().nullish(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type TagCategorySchema = z.infer<typeof tagCategorySchema>

export const tagCategoryFormSchema = z.object({
  name: z
    .string()
    .min(1, { error: () => i18n.t('tagCategories.validation.nameRequired') })
    .max(100, { error: () => i18n.t('tagCategories.validation.nameMax') }),
  slug: z
    .string()
    .max(60, { error: () => i18n.t('tagCategories.validation.slugMax') })
    .regex(/^[a-z0-9_-]*$/, {
      error: () => i18n.t('tagCategories.validation.slugInvalid'),
    })
    .optional()
    .or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  color: z.string().regex(/^#([0-9a-fA-F]{3,8})$/, {
    error: () => i18n.t('tagCategories.validation.colorInvalid'),
  }),
  icon: z
    .string()
    .min(1, { error: () => i18n.t('tagCategories.validation.iconRequired') })
    .max(50, { error: () => i18n.t('tagCategories.validation.iconMax') }),
  sortOrder: z
    .number()
    .min(0, { error: () => i18n.t('tagCategories.validation.sortOrderMin') }),
  isActive: z.boolean(),
})

export type TagCategoryFormValues = z.infer<typeof tagCategoryFormSchema>
