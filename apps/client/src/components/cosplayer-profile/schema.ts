import { z } from "zod";

export const createProfileEditSchema = (t: (key: any) => string) =>
  z.object({
    displayName: z.string().min(1, t("valDisplayName")),
    handle: z.string().min(1, t("valHandle")),
    roleBadge: z.string().optional(),
    tagline: z.string().optional(),
    bio: z.string().optional(),
    artisticBio: z.string().optional(),
    locationLabel: z.string().optional(),
    workArea: z.string().optional(),
    heightCm: z.union([z.number(), z.string()]).optional(),
    experienceYearsNum: z.union([z.number(), z.string()]).optional(),
    skillsText: z.string().optional(),
    specialtiesText: z.string().optional(),
    awardsBadgesText: z.string().optional(),
    contactEmail: z.string().optional(),
    contactPhone: z.string().optional(),
    isCraftingCreator: z.boolean().optional(),
    facebookUrl: z.string().optional(),
    instagramUrl: z.string().optional(),
    tiktokUrl: z.string().optional(),
    twitterUrl: z.string().optional(),
  });

export type ProfileEditFormValues = z.infer<
  ReturnType<typeof createProfileEditSchema>
>;

export const createCollectionSchema = (t: (key: any) => string) =>
  z.object({
    title: z.string().min(1, t("collectionPlaceholder")),
  });

export type CreateCollectionFormValues = z.infer<
  ReturnType<typeof createCollectionSchema>
>;
