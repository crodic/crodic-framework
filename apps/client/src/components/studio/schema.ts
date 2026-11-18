import { z } from "zod";

export const getAlbumSchema = (t: (key: string) => string) =>
  z.object({
    title: z.string().min(1, t("valTitle")),
    character: z.string().min(1, t("valCharacter")),
    fandom: z.string().min(1, t("valFandom")),
    tags: z.array(z.string()).min(1, t("valTags")),
    description: z.string(),
    isPublic: z.boolean(),
    enableWatermark: z.boolean(),
  });

export type CreateAlbumFormValues = z.infer<ReturnType<typeof getAlbumSchema>>;
