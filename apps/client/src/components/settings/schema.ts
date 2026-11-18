import { z } from "zod";

export const createPasswordFormSchema = (t: (key: string) => string) =>
  z
    .object({
      currentPassword: z.string().optional(),
      newPassword: z.string().min(6, t("password.validation.min")),
      confirmPassword: z.string().min(1, t("password.validation.match")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("password.validation.match"),
      path: ["confirmPassword"],
    });

export type PasswordFormValues = z.infer<
  ReturnType<typeof createPasswordFormSchema>
>;
