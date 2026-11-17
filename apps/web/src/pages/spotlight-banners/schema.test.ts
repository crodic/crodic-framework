import { describe, expect, it } from 'vitest'
import { spotlightBannerFormSchema, spotlightBannerSchema } from './schema'

describe('Spotlight Banner Zod Schemas', () => {
  it('validates a valid spotlight banner payload', () => {
    const banner = spotlightBannerSchema.safeParse({
      id: '1',
      name: 'KIRIKO',
      badge: 'Cosplayer Tiêu Điểm',
      tagline: 'Vinh danh thành thương hiệu chuyên nghiệp',
      bannerImageUrl: '/landing/hero-banner.png',
      portfolioHref: '/cosplayer/kiriko',
      bookingHref: '/booking?cosplayer=kiriko',
      sortOrder: 0,
      isVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
    })

    expect(banner.success).toBe(true)
  })

  it('validates spotlight banner form submission values', () => {
    const valid = spotlightBannerFormSchema.safeParse({
      name: 'KIRIKO',
      badge: 'Cosplayer Tiêu Điểm',
      tagline: 'Vinh danh thành thương hiệu chuyên nghiệp',
      bannerImageUrl: '/landing/hero-banner.png',
      portfolioHref: '/cosplayer/kiriko',
      sortOrder: 0,
      isVerified: true,
      isActive: true,
    })

    expect(valid.success).toBe(true)
  })
})
