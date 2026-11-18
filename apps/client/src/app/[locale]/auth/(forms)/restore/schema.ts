import { z } from "zod";

export const createRestoreFormSchema = (t: (key: any) => string) =>
  z
    .object({
      password: z.string().min(8, { message: t("validation.passwordMin") }),
      confirmPassword: z
        .string()
        .min(8, { message: t("validation.passwordMin") }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.passwordsMismatch"),
      path: ["confirmPassword"],
    });

export type RestoreFormValues = z.infer<
  ReturnType<typeof createRestoreFormSchema>
>;
