import { z } from "zod";

export const createLoginFormSchema = (t: (key: any) => string) =>
  z.object({
    email: z.string().min(1, t("email")),
    password: z.string().min(1, t("password")),
  });

export type LoginFormValues = z.infer<ReturnType<typeof createLoginFormSchema>>;
