import { z } from "zod";

export const getAlbumSchema = (t: (key: string) => string) =>
  z.object({
    title: z.string().min(1, t("valTitle")),
    albumCategory: z.enum(["series", "general", "group", "premium"]),
    character: z.string().min(1, t("valCharacter")),
    fandom: z.string().min(1, t("valFandom")),
    tags: z.array(z.string()).min(1, t("valTags")),
    description: z.string(),
    isPublic: z.boolean(),
    enableWatermark: z.boolean(),
  });

export type CreateAlbumFormValues = z.infer<ReturnType<typeof getAlbumSchema>>;

export const getEditPostSchema = (t: (key: string) => string) =>
  z.object({
    title: z.string().trim().min(1, t("valTitle")),
    caption: z.string(),
    characterName: z.string(),
    fandomName: z.string(),
    albumCategory: z.enum(["series", "general", "group", "premium"]),
    tags: z.array(z.string()),
    isPublic: z.boolean(),
    enableWatermark: z.boolean(),
  });

export type EditPostFormValues = z.infer<ReturnType<typeof getEditPostSchema>>;
