import { z } from "zod";

export const createSignUpFormSchema = (
  t: (key: any) => string,
  tOnboard?: (key: any) => string
) =>
  z
    .object({
      role: z.enum(["cosplayer", "photographer", "fan"]),
      displayName: z
        .string()
        .min(1, {
          message: tOnboard
            ? tOnboard("step2.validation.displayNameRequired")
            : "Display name is required",
        })
        .max(80),
      handle: z
        .string()
        .min(1, {
          message: tOnboard
            ? tOnboard("step2.validation.handleRequired")
            : "Handle is required",
        })
        .regex(/^[a-z0-9_-]{3,30}$/, {
          message: tOnboard
            ? tOnboard("step2.validation.handleInvalid")
            : "Handle must be 3-30 characters (a-z, 0-9, _, -)",
        }),
      locationKey: z.string().min(1, {
        message: tOnboard
          ? tOnboard("step2.validation.locationRequired")
          : "Location is required",
      }),
      specialties: z.array(z.string()),
      bio: z.string().max(300).optional(),

      firstName: z
        .string()
        .min(1, { message: t("validation.firstNameRequired") }),
      lastName: z.string().optional(),
      email: z.string().email({ message: t("validation.emailInvalid") }),
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
