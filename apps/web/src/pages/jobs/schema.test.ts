import { describe, expect, it } from 'vitest'
import { jobFormSchema, jobSchema } from './schema'

describe('Job Zod Schemas', () => {
  it('validates a valid job payload', () => {
    const job = jobSchema.safeParse({
      id: '1',
      slug: 'hoyoverse-cosplay-model',
      title: 'Tuyển Cosplayer Acheron Festival',
      brandName: 'HoYoverse VN',
      categoryCode: 'event',
      categoryLabel: 'Sự kiện / Guest Festival',
      budgetLabel: '5.000.000đ - 8.000.000đ / ngày',
      locationLabel: 'TP.HCM',
      deadlineLabel: 'Còn 30 ngày',
      status: 'open',
      isFeatured: true,
      applicationsCount: 5,
      createdAt: new Date().toISOString(),
    })

    expect(job.success).toBe(true)
  })

  it('validates job form creation values', () => {
    const valid = jobFormSchema.safeParse({
      title: 'Tuyển Cosplayer Acheron Festival',
      brandName: 'HoYoverse VN',
      categoryCode: 'event',
      categoryLabel: 'Sự kiện',
      budgetLabel: '5.000.000đ - 8.000.000đ / ngày',
      locationLabel: 'TP.HCM',
      deadlineLabel: 'Còn 30 ngày',
      requirements: 'Yêu cầu chiều cao từ 1m65 trở lên',
      description: 'Hóa thân nhân vật tại gian hàng triển lãm',
      contactEmail: 'hr@hoyoverse.com',
      status: 'open',
      isFeatured: true,
    })

    expect(valid.success).toBe(true)
  })
})
