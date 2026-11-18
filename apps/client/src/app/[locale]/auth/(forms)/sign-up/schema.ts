import { z } from "zod";

export const createSignUpFormSchema = (t: (key: any) => string) =>
  z
    .object({
      firstName: z
        .string()
        .min(1, { message: t("validation.firstNameRequired") }),
      lastName: z.string().optional(),
      email: z.string().email(t("validation.emailInvalid")),
      password: z.string().min(8, { message: t("validation.passwordMin") }),
      confirmPassword: z
        .string()
        .min(8, { message: t("validation.passwordMin") }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.passwordsMismatch"),
      path: ["confirmPassword"],
    });

export type SignUpFormValues = z.infer<
  ReturnType<typeof createSignUpFormSchema>
>;
