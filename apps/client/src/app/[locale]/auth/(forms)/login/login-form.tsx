"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createLoginFormSchema, type LoginFormValues } from "./schema";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { GoogleIcon } from "@/components/icons/google-icon";
import { AuthFormPanel } from "../auth-form-panel";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginResponseData } from "@/types/apis";
import xior, { XiorError } from "xior";
import { http } from "@/lib/http";
import { useTranslations } from "next-intl";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AUTH_CODE, AUTH_QUERY_PARAM, AuthCode } from "@/constants/auth";
import { Link } from "@/i18n/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PROFILE_QUERY_KEY } from "@/hooks/use-profile";
import { useAuthStore } from "@/store/use-auth-store";

export default function LoginForm() {
  const t = useTranslations("Auth.login");
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const handledMessageRef = useRef<string | null>(null);
  const [isVerificationFailed, setIsVerificationFailed] = useState(false);
  const [deletedAccountEmail, setDeletedAccountEmail] = useState<string | null>(
    null
  );
  const [restoreRequested, setRestoreRequested] = useState(false);

  const rawCode = searchParams.get(AUTH_QUERY_PARAM.CODE);
  const code = (
    rawCode && Object.values(AUTH_CODE).includes(rawCode as AuthCode)
      ? rawCode
      : null
  ) as AuthCode | null;

  const loginFormSchema = useMemo(() => createLoginFormSchema(t), [t]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const { data } = await http.post<LoginResponseData>(
        "api/v1/user/auth/login",
        values
      );
      const { accessToken, refreshToken } = data;

      await xior.post("/api/auth/tokens", {
        accessToken,
        refreshToken,
      });

      useAuthStore.getState().setTokens({ accessToken });

      // Clear the cached null profile so /profile fetches fresh user data
      await queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      return data;
    },
    onSuccess: () => {
      const from = searchParams.get(AUTH_QUERY_PARAM.FROM);
      const redirectTarget =
        from && from.startsWith("/") && !from.startsWith("//")
          ? from
          : "/profile";
      router.push(redirectTarget);
    },
    onError: (error) => {
      if (error instanceof XiorError) {
        const errorData = error.response?.data;
        if (
          errorData?.errorCode === "ACCOUNT_DELETED" ||
          errorData?.canRestore
        ) {
          setDeletedAccountEmail(form.getValues("email"));
          setRestoreRequested(false);
          toast.error(errorData?.message || t("toasts.accountDeleted"));
          return;
        }
        toast.error(error.response?.data?.message || t("toasts.loginError"));
      } else {
        toast.error(t("toasts.loginError"));
      }
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (email: string) => {
      return http.post("api/v1/user/auth/restore-request", { email });
    },
    onSuccess: () => {
      setRestoreRequested(true);
      toast.success(t("toasts.restoreRequestSuccess"));
    },
    onError: (err) => {
      if (err instanceof XiorError) {
        toast.error(
          err.response?.data?.message || t("toasts.restoreRequestFailed")
        );
      } else {
        toast.error(t("toasts.restoreRequestFailed"));
      }
    },
  });

  useEffect(() => {
    const verification = searchParams.get("verification");
    const reset = searchParams.get("reset");
    const social = searchParams.get("social");
    const restore = searchParams.get("restore");

    const messageKey = [verification, reset, social, restore]
      .filter(Boolean)
      .join(":");

    if (!messageKey || handledMessageRef.current === messageKey) {
      return;
    }

    handledMessageRef.current = messageKey;

    if (verification === "success") {
      toast.success(t("toasts.verificationSuccess"));
    }

    if (verification === "failed") {
      toast.error(t("toasts.verificationFailed"));
      setIsVerificationFailed(true);
    }

    if (reset === "success") {
      toast.success(t("toasts.resetSuccess"));
    }

    if (restore === "success") {
      toast.success(t("toasts.restoreSuccess"));
    }

    if (social === "failed") {
      toast.error(t("toasts.socialFailed"));
    }

    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.delete("verification");
    nextSearchParams.delete("reset");
    nextSearchParams.delete("social");
    nextSearchParams.delete("restore");
    const nextQuery = nextSearchParams.toString();

    router.replace(nextQuery ? `/auth/login?${nextQuery}` : "/auth/login");
  }, [router, searchParams, t]);

  function onSubmit(values: LoginFormValues) {
    loginMutation.mutate(values);
  }

  function handleRequestRestore() {
    if (!deletedAccountEmail) return;
    restoreMutation.mutate(deletedAccountEmail);
  }

  const isSubmitting = loginMutation.isPending || form.formState.isSubmitting;
  const isRestoring = restoreMutation.isPending;

  return (
    <AuthFormPanel>
      <Card className="w-full min-w-0 gap-6 rounded-2xl py-6 shadow-none sm:py-8">
        <CardHeader className="sm:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
            {t("title")}
          </h1>
          <CardDescription className="leading-relaxed">
            {t("description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="min-w-0 sm:px-8">
          {deletedAccountEmail && (
            <Alert className="mb-6 border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-200">
              <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" />
              <AlertTitle className="font-semibold">
                {t("alerts.accountDeleted.title")}
              </AlertTitle>
              <AlertDescription className="mt-1 space-y-2 text-sm">
                <p>{t("alerts.accountDeleted.description")}</p>
                {restoreRequested ? (
                  <p className="font-medium text-emerald-600 dark:text-emerald-400">
                    {t("alerts.accountDeleted.sent")}
                  </p>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isRestoring}
                    onClick={handleRequestRestore}
                    className="mt-2"
                  >
                    {isRestoring && (
                      <Loader2 className="mr-2 size-3.5 animate-spin" />
                    )}
                    {t("alerts.accountDeleted.action")}
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}
          {isVerificationFailed && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="size-4" />
              <AlertTitle>{t("alerts.verification_failed.title")}</AlertTitle>
              <AlertDescription>
                {t("alerts.verification_failed.description")}
              </AlertDescription>
            </Alert>
          )}
          {code && !isVerificationFailed && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="size-4" />
              <AlertTitle>{t(`alerts.${code}.title`)}</AlertTitle>
              <AlertDescription>
                {t(`alerts.${code}.description`)}
              </AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                name="password"
                render={({ field }) => (
                  <FormItem className="relative">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <FormLabel className="text-sm font-medium">
                        {t("password")}
                      </FormLabel>
                      <Link
                        href="/auth/forgot-password"
                        className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
                      >
                        {t("forgotPassword")}
                      </Link>
                    </div>
                    <FormControl>
                      <PasswordInput
                        placeholder={t("passwordPlaceholder")}
                        autoComplete="current-password"
                        disabled={isSubmitting}
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="h-11 w-full"
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

              <hr className="border-border" />

              <Button
                type="button"
                className="h-11 w-full shadow-none"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => {
                  window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/auth/social/google`;
                }}
              >
                <GoogleIcon className="size-4 shrink-0" />
                <span>{t("continueGoogle")}</span>
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center sm:px-8">
          <p className="text-muted-foreground text-center text-sm">
            {t("noAccount")}{" "}
            <Link
              href="/auth/sign-up"
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              {t("signUp")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthFormPanel>
  );
}
