import z from 'zod'

export const ColumnKey = {
  id: 'id',
  email: 'email',
  username: 'username',
  role: 'role',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  avatar: 'avatar',
  status: 'status',
  verifiedAt: 'verifiedAt',
  fullName: 'fullName',
  all: 'all',
}

export const userCosplayerSummarySchema = z.object({
  id: z.string().optional(),
  slug: z.string(),
  displayName: z.string(),
  roleBadge: z.string().nullish(),
  tagline: z.string().nullish(),
  bio: z.string().nullish(),
  artisticBio: z.string().nullish(),
  avatarUrl: z.string().nullish(),
  coverUrl: z.string().nullish(),
  locationLabel: z.string().nullish(),
  workArea: z.string().nullish(),
  heightCm: z.number().nullish(),
  experienceYearsNum: z.number().nullish(),
  skills: z.array(z.string()).default([]),
  specialties: z.array(z.string()).default([]),
  awardsBadges: z.array(z.string()).default([]),
  contactEmail: z.string().nullish(),
  contactPhone: z.string().nullish(),
  facebookUrl: z.string().nullish(),
  instagramUrl: z.string().nullish(),
  tiktokUrl: z.string().nullish(),
  twitterUrl: z.string().nullish(),
  isVerified: z.boolean(),
  isCraftingCreator: z.boolean().default(false),
  rankingScore: z.number(),
})

export type UserCosplayerSummary = z.infer<typeof userCosplayerSummarySchema>

export const userSchema = z.object({
  id: z.string(),
  username: z.string().nullish(),
  role: z.string().default('fan'),
  email: z.string(),
  avatar: z.string().nullish(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  fullName: z.string(),
  verifiedAt: z.boolean(),
  cosplayerRequestPending: z.boolean().optional(),
  cosplayerProfile: userCosplayerSummarySchema.nullish(),
  notifications: z
    .object({
      system: z.boolean().default(true),
      security: z.boolean().default(true),
      email: z.boolean().default(true),
    })
    .catchall(z.boolean())
    .catch({
      system: true,
      security: true,
      email: true,
    }),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable().optional(),
})

export type UserSchema = z.infer<typeof userSchema>

const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .max(20, { message: 'Password must be at most 20 characters' })
  .refine((password) => /[A-Z]/.test(password), {
    message: 'Password must contain at least one uppercase letter',
  })
  .refine((password) => /[a-z]/.test(password), {
    message: 'Password must contain at least one lowercase letter',
  })
  .refine((password) => /[0-9]/.test(password), {
    message: 'Password must be contain at least one number letter',
  })
  .refine((password) => /[!@#$%^&*]/.test(password), {
    message: 'Password must contain at least one special character (!@#$%^&*)',
  })

export const adminCosplayerProfileFormSchema = z.object({
  displayName: z.string().optional(),
  slug: z.string().optional(),
  roleBadge: z.string().optional(),
  tagline: z.string().optional(),
  bio: z.string().optional(),
  artisticBio: z.string().optional(),
  avatarUrl: z.string().optional(),
  coverUrl: z.string().optional(),
  locationLabel: z.string().optional(),
  workArea: z.string().optional(),
  heightCm: z.union([z.number(), z.string()]).optional(),
  experienceYearsNum: z.union([z.number(), z.string()]).optional(),
  skillsText: z.string().optional(),
  specialtiesText: z.string().optional(),
  awardsBadgesText: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  isVerified: z.boolean().optional(),
  isCraftingCreator: z.boolean().optional(),
})

export type AdminCosplayerProfileFormSchema = z.infer<
  typeof adminCosplayerProfileFormSchema
>

const splitCommaList = (val?: string) =>
  val
    ? val
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : undefined

export function serializeCosplayerProfilePayload(
  profile?: AdminCosplayerProfileFormSchema
) {
  if (!profile) return undefined
  const payload: Record<string, unknown> = {}

  const stringKeys = [
    'displayName',
    'slug',
    'roleBadge',
    'tagline',
    'bio',
    'artisticBio',
    'avatarUrl',
    'coverUrl',
    'locationLabel',
    'workArea',
    'contactEmail',
    'contactPhone',
    'facebookUrl',
    'instagramUrl',
    'tiktokUrl',
    'twitterUrl',
  ] as const

  for (const key of stringKeys) {
    const val = profile[key]
    if (typeof val === 'string' && val.trim().length > 0) {
      payload[key] = val.trim()
    }
  }

  if (
    profile.heightCm !== undefined &&
    profile.heightCm !== '' &&
    Number.isFinite(Number(profile.heightCm))
  ) {
    payload.heightCm = Number(profile.heightCm)
  }

  if (
    profile.experienceYearsNum !== undefined &&
    profile.experienceYearsNum !== '' &&
    Number.isFinite(Number(profile.experienceYearsNum))
  ) {
    payload.experienceYearsNum = Number(profile.experienceYearsNum)
  }

  if (profile.skillsText !== undefined) {
    payload.skills = splitCommaList(profile.skillsText) ?? []
  }
  if (profile.specialtiesText !== undefined) {
    payload.specialties = splitCommaList(profile.specialtiesText) ?? []
  }
  if (profile.awardsBadgesText !== undefined) {
    payload.awardsBadges = splitCommaList(profile.awardsBadgesText) ?? []
  }
  if (profile.isVerified !== undefined) {
    payload.isVerified = Boolean(profile.isVerified)
  }
  if (profile.isCraftingCreator !== undefined) {
    payload.isCraftingCreator = Boolean(profile.isCraftingCreator)
  }

  return Object.keys(payload).length > 0 ? payload : undefined
}

export const userCreateSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().optional(),
    username: z.string().optional(),
    role: z.enum(['fan', 'cosplayer']).default('fan').optional(),
    email: z.email('Invalid email address'),
    password: passwordSchema,
    confirmPassword: z
      .string()
      .min(8, 'Confirm Password must be at least 8 characters'),
    cosplayerProfile: adminCosplayerProfileFormSchema.optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type UserCreateSchema = z.infer<typeof userCreateSchema>

export const userEditSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  username: z.string().optional(),
  role: z.string().optional(),
  email: z.email('Invalid email address').optional(),
  cosplayerProfile: adminCosplayerProfileFormSchema.optional(),
})

export type UserEditSchema = z.infer<typeof userEditSchema>
