"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import xior, { XiorError } from "xior";
import { z } from "zod";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { WhiteLabelLogo } from "@/lib/white-label";

export default function ForgotPasswordForm() {
  const t = useTranslations("Auth.forgotPassword");

  const forgotPasswordFormSchema = z.object({
    email: z.email(t("email")),
  });

  type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    try {
      await xior.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/auth/forgot-password`,
        values
      );
      toast.success(t("successToast"));
      form.reset();
    } catch (error) {
      if (error instanceof XiorError) {
        toast.error(error.response?.data?.message || t("errorToast"));
      }
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="flex w-full flex-col justify-center px-4 py-8 sm:px-6 sm:py-12 md:max-w-md lg:px-4">
      {/* Mobile Brand Logo */}
      <div className="mb-6 flex justify-center lg:hidden">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-xl shadow-md shadow-purple-500/20">
            <svg
              className="size-4 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-foreground text-xl font-black tracking-tight">
            Kosume
          </span>
        </Link>
      </div>

      <Card className="border-border/70 bg-card/90 w-full gap-6 rounded-2xl py-8 shadow-2xl shadow-purple-950/20 backdrop-blur-xl sm:py-10">
        <CardHeader className="space-y-2 px-6 sm:px-8">
          <CardTitle className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("title")}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm leading-relaxed">
            {t("description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 sm:px-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4.5 sm:space-y-5"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      {t("email")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        autoComplete="email"
                        disabled={isSubmitting}
                        className="h-10 sm:h-10.5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="mt-2 h-10.5 w-full cursor-pointer gap-2 font-medium shadow-sm transition-all hover:shadow-md sm:h-11"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>{t("submitting")}</span>
                  </>
                ) : (
                  <span>{t("submit")}</span>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center px-6 pt-2 sm:px-8 sm:pt-3">
          <Link
            href="/auth/login"
            className="text-primary text-xs font-medium underline-offset-4 hover:underline sm:text-sm"
          >
            {t("backToSignIn")}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
