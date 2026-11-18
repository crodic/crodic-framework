import { describe, expect, it } from 'vitest'
import { eventFormSchema, eventSchema } from './schema'

describe('Event Zod Schemas', () => {
  it('validates a valid event payload', () => {
    const event = eventSchema.safeParse({
      id: '1',
      slug: 'vietnam-cosplay-expo-2026',
      title: 'Vietnam Cosplay Expo 2026',
      dayLabel: '28',
      monthLabel: 'THÁNG 12',
      yearLabel: '2026',
      dateString: '28 - 29 Tháng 12, 2026',
      startAt: new Date().toISOString(),
      locationLabel: 'TP.HCM',
      venue: 'SECC Q.7, TP.HCM',
      imageUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857',
      status: 'upcoming',
      isFeaturedFestival: true,
      isRecruiting: true,
      participantsCount: 15,
      interestedCount: 240,
      applicationsCount: 8,
      createdAt: new Date().toISOString(),
    })

    expect(event.success).toBe(true)
  })

  it('validates event form submission values', () => {
    const valid = eventFormSchema.safeParse({
      title: 'Vietnam Cosplay Expo 2026',
      startAt: new Date().toISOString(),
      locationLabel: 'TP.HCM',
      venue: 'SECC Q.7, TP.HCM',
      imageUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857',
      description: 'Lễ hội anime cosplay hoành tráng nhất năm',
      status: 'upcoming',
      isFeaturedFestival: true,
      isRecruiting: true,
    })

    expect(valid.success).toBe(true)
  })
})
