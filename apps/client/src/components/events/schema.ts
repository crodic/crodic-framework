import { z } from "zod";

export const createApplyEventSchema = (tApply: (key: any) => string) =>
  z.object({
    fullName: z.string().min(1, tApply("valFullName")),
    stageName: z.string().min(1, tApply("valStageName")),
    category: z.string().min(1, tApply("valCategory")),
    phone: z.string().min(8, tApply("valPhone")),
    characterPlanned: z.string().min(1, tApply("valCharacter")),
    portfolioUrl: z.string().optional(),
    notes: z.string().optional(),
  });

export type ApplyEventFormValues = z.infer<
  ReturnType<typeof createApplyEventSchema>
>;
