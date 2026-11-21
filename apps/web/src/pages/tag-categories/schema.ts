import { z } from 'zod'

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
  name: z.string().min(1, 'Tên danh mục là bắt buộc').max(100),
  slug: z
    .string()
    .max(60)
    .regex(
      /^[a-z0-9_-]*$/,
      'Slug chỉ gồm chữ thường, số, dấu gạch nối và gạch dưới'
    )
    .optional()
    .or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{3,8})$/, 'Mã màu hex không hợp lệ (ví dụ: #3b82f6)'),
  icon: z.string().min(1, 'Vui lòng chọn hoặc nhập icon').max(50),
  sortOrder: z.number().min(0, 'Thứ tự sắp xếp phải lớn hơn hoặc bằng 0'),
  isActive: z.boolean(),
})

export type TagCategoryFormValues = z.infer<typeof tagCategoryFormSchema>
