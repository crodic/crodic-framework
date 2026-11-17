import { describe, expect, it } from 'vitest'
import { kosumeSettingsFormSchema, kosumeSettingsSchema } from './schema'

describe('Kosume Platform Settings Schema', () => {
  it('validates default platform settings correctly', () => {
    const raw = {
      max_photos_per_album: 50,
      max_file_size_mb: 25,
      auto_approve_posts: true,
      auto_approve_jobs: false,
      commission_platform_rate_percent: 5,
      banned_keywords: 'nude, nsfw, spam, scam, lừa đảo, cờ bạc',
      support_email: 'support@kosume.com',
      support_hotline: '1900-KOSUME',
    }

    const parsed = kosumeSettingsSchema.safeParse(raw)
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.max_photos_per_album).toBe(50)
      expect(parsed.data.commission_platform_rate_percent).toBe(5)
      expect(parsed.data.support_email).toBe('support@kosume.com')
    }
  })

  it('rejects invalid email', () => {
    const invalid = kosumeSettingsFormSchema.safeParse({
      max_photos_per_album: 50,
      max_file_size_mb: 25,
      auto_approve_posts: true,
      auto_approve_jobs: false,
      commission_platform_rate_percent: 5,
      banned_keywords: 'test',
      support_email: 'not-an-email',
      support_hotline: '1900-KOSUME',
    })
    expect(invalid.success).toBe(false)
  })
})
