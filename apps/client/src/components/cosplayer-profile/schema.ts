import { z } from "zod";

export const createMessageFormSchema = (t: (key: any) => string) =>
  z.object({
    message: z.string().min(1, t("sendMessagePlaceholder")),
  });

export type MessageFormValues = z.infer<
  ReturnType<typeof createMessageFormSchema>
>;

export const createProfileEditSchema = (t: (key: any) => string) =>
  z.object({
    displayName: z.string().min(1, t("valDisplayName")),
    handle: z.string().min(1, t("valHandle")),
    bio: z.string().optional(),
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
