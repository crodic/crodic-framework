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
import { AuthFormPanel } from "../auth-form-panel";
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
    <AuthFormPanel>
      <Card className="w-full min-w-0 gap-6 rounded-2xl py-6 shadow-none sm:py-8">
        <CardHeader className="sm:px-8">
          <div className="flex items-center gap-2">
            <RotateCcw className="text-primary size-5" />
            <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
              {t("title")}
            </h1>
          </div>
          <CardDescription className="leading-relaxed">
            {t("description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="min-w-0 sm:px-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        className="h-11"
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
                        className="h-11"
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
                className="h-11 w-full"
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
        <CardFooter className="justify-center sm:px-8">
          <Link
            href="/auth/login"
            className="text-primary text-sm font-medium underline-offset-4 hover:underline"
          >
            {t("backToSignIn")}
          </Link>
        </CardFooter>
      </Card>
    </AuthFormPanel>
  );
}
