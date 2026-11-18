import { describe, expect, it } from 'vitest'
import { contentReportSchema, resolveReportSchema } from './schema'

describe('Content Report Zod Schemas', () => {
  it('validates a valid content report payload', () => {
    const report = contentReportSchema.safeParse({
      id: '1',
      reporterUserId: '10',
      reporterName: 'Reporter One',
      reporterEmail: 'reporter@example.com',
      targetType: 'post',
      targetId: '5',
      reason: 'Inappropriate content',
      description: 'Contains sensitive imagery without warning',
      status: 'pending',
      createdAt: new Date().toISOString(),
    })

    expect(report.success).toBe(true)
  })

  it('validates resolve report form submission', () => {
    const valid = resolveReportSchema.safeParse({
      status: 'resolved',
      resolutionNote: 'Post was hidden per community standards',
    })

    expect(valid.success).toBe(true)
  })
})
