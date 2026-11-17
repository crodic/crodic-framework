import { describe, expect, it } from 'vitest'
import {
  bookingSchema,
  bookingUserSchema,
  updateBookingStatusSchema,
} from './schema'

describe('Booking Admin Schemas', () => {
  it('validates a valid booking object correctly', () => {
    const rawBooking = {
      id: '1',
      targetCosplayerId: '5',
      targetCosplayer: {
        id: '5',
        fullName: 'Hana Cosplay',
        email: 'hana@kosume.com',
        role: 'user',
      },
      requesterUserId: '10',
      requesterUser: {
        id: '10',
        fullName: 'Nguyen Studio',
        email: 'studio@nguyen.vn',
      },
      bookingType: 'Studio Photoshoot',
      fullName: 'Studio Nguyen Producer',
      contactInfo: '0901234567 - studio@nguyen.vn',
      targetDateLabel: '2026-12-01',
      budgetLabel: '5,000,000 VND',
      details: 'Commercial photoshoot for anime merch campaign',
      status: 'pending',
      responseNote: null,
      respondedAt: null,
      createdAt: '2026-11-15T00:00:00.000Z',
    }

    const parsed = bookingSchema.safeParse(rawBooking)
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.fullName).toBe('Studio Nguyen Producer')
      expect(parsed.data.targetCosplayer?.fullName).toBe('Hana Cosplay')
      expect(parsed.data.status).toBe('pending')
    }
  })

  it('validates update booking status schema', () => {
    const valid = updateBookingStatusSchema.safeParse({
      status: 'completed',
      responseNote: 'Admin closed dispute amicably',
    })
    expect(valid.success).toBe(true)

    const invalid = updateBookingStatusSchema.safeParse({
      status: 'invalid_status',
    })
    expect(invalid.success).toBe(false)
  })

  it('validates bookingUserSchema', () => {
    const user = bookingUserSchema.safeParse({
      id: '1',
      fullName: 'Test User',
      email: 'test@example.com',
    })
    expect(user.success).toBe(true)
  })
})
