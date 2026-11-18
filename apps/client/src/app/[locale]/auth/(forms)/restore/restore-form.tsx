"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RotateCcw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import xior, { XiorError } from "xior";
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
import { PasswordInput } from "@/components/ui/password-input";
import { WhiteLabelLogo } from "@/lib/white-label";
import { createRestoreFormSchema, type RestoreFormValues } from "./schema";

export default function RestoreForm() {
  const t = useTranslations("Auth.restore");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const restoreFormSchema = useMemo(() => createRestoreFormSchema(t), [t]);

  const form = useForm<RestoreFormValues>({
    resolver: zodResolver(restoreFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RestoreFormValues) {
    if (!token) {
      toast.error(t("tokenMissingToast"));
      return;
    }

    try {
      await xior.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/auth/restore?token=${encodeURIComponent(
          token
        )}`,
        values
      );
      router.push("/auth/login?restore=success");
    } catch (error) {
      if (error instanceof XiorError) {
        toast.error(error.response?.data?.message || t("errorToast"));
      } else {
        toast.error(t("errorToast"));
      }
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="flex w-full flex-col justify-center px-4 py-8 sm:px-6 sm:py-12 md:max-w-md lg:px-4">
      {/* Mobile Brand Logo */}
      <div className="mb-6 flex justify-center lg:hidden">
        <Link href="/" className="inline-flex items-center gap-2">
          <WhiteLabelLogo className="h-8 w-auto object-contain" />
        </Link>
      </div>

      <Card className="border-border/70 bg-card/90 w-full gap-6 rounded-2xl py-8 shadow-2xl shadow-purple-950/20 backdrop-blur-xl sm:py-10">
        <CardHeader className="space-y-2 px-6 sm:px-8">
          <div className="flex items-center gap-2">
            <RotateCcw className="text-primary size-5" />
            <CardTitle className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("title")}
            </CardTitle>
          </div>
          <CardDescription className="text-muted-foreground text-sm leading-relaxed">
            {t("description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 sm:px-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 sm:space-y-4.5"
            >
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      {t("newPassword")}
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="••••••••"
                        autoComplete="new-password"
                        disabled={!token || isSubmitting}
                        className="h-10 sm:h-10.5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      {t("confirmPassword")}
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="••••••••"
                        autoComplete="new-password"
                        disabled={!token || isSubmitting}
                        className="h-10 sm:h-10.5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!token ? (
                <p className="text-destructive text-sm">{t("missingToken")}</p>
              ) : null}
              <Button
                type="submit"
                className="mt-2 h-10.5 w-full cursor-pointer gap-2 font-medium shadow-sm transition-all hover:shadow-md sm:h-11"
                disabled={!token || isSubmitting}
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
