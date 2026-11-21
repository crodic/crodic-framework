import { z } from 'zod'

export const cosplayerApplicationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  user: z
    .object({
      id: z.string(),
      email: z.string(),
      fullName: z.string().nullish(),
      username: z.string().nullish(),
      avatar: z.string().nullish(),
    })
    .nullish(),
  stageName: z.string(),
  bio: z.string(),
  socialLinks: z.record(z.string(), z.string()).nullish(),
  portfolioUrls: z.array(z.string()).nullish(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  rejectionReason: z.string().nullish(),
  reviewedById: z.string().nullish(),
  reviewedBy: z
    .object({
      id: z.string(),
      fullName: z.string().nullish(),
      username: z.string().nullish(),
    })
    .nullish(),
  reviewedAt: z.string().nullish(),
  adminNotes: z.string().nullish(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type CosplayerApplicationSchema = z.infer<
  typeof cosplayerApplicationSchema
>
