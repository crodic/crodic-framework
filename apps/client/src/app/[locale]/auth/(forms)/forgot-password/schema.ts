import { z } from "zod";

export const createForgotPasswordFormSchema = (t: (key: any) => string) =>
  z.object({
    email: z.string().email(t("email")),
  });

export type ForgotPasswordFormValues = z.infer<
  ReturnType<typeof createForgotPasswordFormSchema>
>;
