"use client";

import React, { useState, useMemo, useEffect } from "react";
import { CheckCircle2, Laptop, Loader2, Smartphone } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  useChangePassword,
  useProfile,
  useRevokeAllOtherSessions,
  useRevokeSession,
  useSessions,
  useSetupPassword,
  useUpdateProfile,
} from "@/hooks/use-profile";
import { createPasswordFormSchema, type PasswordFormValues } from "./schema";
import { z } from "zod";

const createAccountInfoSchema = (t: any) =>
  z.object({
    firstName: z.string().trim().min(1, t("account.valFirstName")),
    lastName: z.string().trim().optional(),
    username: z.string().trim().optional(),
  });
type AccountInfoValues = z.infer<ReturnType<typeof createAccountInfoSchema>>;

export function SecuritySettings() {
  const t = useTranslations("Security");
  const { data: profile } = useProfile();
  const hasPassword = profile?.hasPassword ?? true;

  const { data: sessions, isLoading: isSessionsLoading } = useSessions();
  const revokeSessionMutation = useRevokeSession();
  const revokeAllMutation = useRevokeAllOtherSessions();

  const changePasswordMutation = useChangePassword();
  const setupPasswordMutation = useSetupPassword();
  const updateProfileMutation = useUpdateProfile();

  const accountInfoSchema = useMemo(() => createAccountInfoSchema(t), [t]);

  const accountForm = useForm<AccountInfoValues>({
    resolver: zodResolver(accountInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
    },
  });

  useEffect(() => {
    if (profile) {
      accountForm.reset({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        username: profile.username || "",
      });
    }
  }, [profile, accountForm]);

  const onAccountSubmit = (values: AccountInfoValues) => {
    updateProfileMutation.mutate(
      {
        firstName: values.firstName.trim(),
        lastName: values.lastName?.trim() || undefined,
        username: values.username?.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success(t("account.updateSuccess"));
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || t("account.updateError"));
        },
      }
    );
  };

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const passwordSchema = useMemo(() => createPasswordFormSchema(t as any), [t]);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: PasswordFormValues) => {
    if (hasPassword) {
      if (!values.currentPassword) {
        form.setError("currentPassword", {
          message: t("password.validation.currentRequired"),
        });
        return;
      }
      changePasswordMutation.mutate(
        {
          password: values.currentPassword,
          newPassword: values.newPassword,
          confirmNewPassword: values.confirmPassword,
        },
        {
          onSuccess: () => {
            toast.success(t("password.changeSuccess"));
            form.reset();
          },
          onError: () => {
            toast.error(t("password.changeError"));
          },
        }
      );
    } else {
      setupPasswordMutation.mutate(
        {
          password: values.newPassword,
          confirmPassword: values.confirmPassword,
        },
        {
          onSuccess: () => {
            toast.success(t("password.setupSuccess"));
            form.reset();
          },
          onError: () => {
            toast.error(t("password.setupError"));
          },
        }
      );
    }
  };

  const handleRevokeSession = (sessionId: string) => {
    revokeSessionMutation.mutate(sessionId, {
      onSuccess: () => toast.success(t("devices.revokeSuccess")),
      onError: () => toast.error(t("session.signingOut")),
    });
  };

  const handleRevokeAllOther = () => {
    revokeAllMutation.mutate(undefined, {
      onSuccess: () => toast.success(t("devices.revokeAllSuccess")),
    });
  };

  const isPending =
    changePasswordMutation.isPending || setupPasswordMutation.isPending;

  return (
    <div className="space-y-6">
      {/* 0. Personal Account Information */}
      <Card className="rounded-xl shadow-none">
        <CardHeader className="px-4 sm:px-6">
          <h2 className="text-lg font-semibold">{t("account.title")}</h2>
          <CardDescription>{t("account.description")}</CardDescription>
        </CardHeader>

        <CardContent className="px-4 sm:px-6">
          <Form {...accountForm}>
            <form
              onSubmit={accountForm.handleSubmit(onAccountSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={accountForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-sm font-medium">
                        {t("account.firstName")}{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("account.firstNamePlaceholder")}
                          className="h-10 text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={accountForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-sm font-medium">
                        {t("account.lastName")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("account.lastNamePlaceholder")}
                          className="h-10 text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={accountForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-sm font-medium">
                        {t("account.username")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("account.usernamePlaceholder")}
                          className="h-10 text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="settings-email"
                      className="text-sm font-medium"
                    >
                      {t("account.email")}
                    </label>
                    {profile?.verifiedAt ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-500">
                        <CheckCircle2 className="size-3" />
                        {t("account.verified")}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-amber-500">
                        {t("account.unverified")}
                      </span>
                    )}
                  </div>
                  <Input
                    id="settings-email"
                    value={profile?.email || ""}
                    disabled
                    className="text-muted-foreground bg-muted/40 h-10 cursor-not-allowed text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="h-10"
                >
                  {updateProfileMutation.isPending && (
                    <Loader2 className="size-3.5 animate-spin" />
                  )}
                  <span>{t("account.save")}</span>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* 1. Change / Setup Password */}
      <Card className="rounded-xl shadow-none">
        <CardHeader className="px-4 sm:px-6">
          <h2 className="text-lg font-semibold">
            {hasPassword ? t("password.changeTitle") : t("password.setupTitle")}
          </h2>
          <CardDescription>
            {hasPassword
              ? t("password.changeDescription")
              : t("password.setupDescription")}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-4 sm:px-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="max-w-md space-y-4"
            >
              {hasPassword && (
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-sm font-medium">
                        {t("password.currentPassword")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={t("password.currentPasswordPlaceholder")}
                          className="h-10 text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-medium">
                      {t("password.newPassword")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t("password.newPasswordPlaceholder")}
                        className="h-10 text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-medium">
                      {t("password.confirmNewPassword")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t(
                          "password.confirmNewPasswordPlaceholder"
                        )}
                        className="h-10 text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isPending} className="h-10">
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : hasPassword ? (
                  t("password.submitChange")
                ) : (
                  t("password.submitSetup")
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* 2. Two-Factor Authentication (2FA) */}
      <Card className="rounded-xl shadow-none">
        <CardHeader className="px-4 sm:px-6">
          <h2 className="text-lg font-semibold">
            2FA (Two-Factor Authentication)
          </h2>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5 pr-4">
              <p className="text-foreground text-sm font-semibold">
                Google Authenticator / Authy
              </p>
              <p className="text-muted-foreground text-xs">TOTP 2FA</p>
            </div>
            <Switch
              aria-label="Google Authenticator / Authy"
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. Real Active Sessions */}
      <Card className="rounded-xl shadow-none">
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">{t("devices.title")}</h2>
            {sessions && sessions.filter((s) => !s.isCurrent).length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRevokeAllOther}
                disabled={revokeAllMutation.isPending}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-9"
              >
                {t("devices.revokeAllOther")}
              </Button>
            )}
          </div>
          <CardDescription>{t("devices.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 px-4 sm:px-6">
          {isSessionsLoading ? (
            <div className="text-muted-foreground flex items-center justify-center py-6">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : sessions && sessions.length > 0 ? (
            sessions.map((session) => {
              const isMobile =
                session.userAgent?.toLowerCase().includes("mobile") ||
                session.userAgent?.toLowerCase().includes("android") ||
                session.userAgent?.toLowerCase().includes("iphone");
              const Icon = isMobile ? Smartphone : Laptop;

              return (
                <div
                  key={session.id}
                  className="border-border flex flex-wrap items-center justify-between gap-3 border-b pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <p className="text-foreground text-sm font-medium wrap-anywhere">
                        {session.userAgent || t("devices.currentDevice")}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {session.ipAddress ? `${session.ipAddress} • ` : ""}
                        {session.isCurrent
                          ? t("devices.activeNow")
                          : session.createdAt
                            ? new Date(session.createdAt).toLocaleDateString()
                            : ""}
                      </p>
                    </div>
                  </div>
                  {session.isCurrent ? (
                    <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-500">
                      {t("devices.currentDevice")}
                    </span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeSession(session.id)}
                      disabled={revokeSessionMutation.isPending}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-9"
                    >
                      {t("devices.revoke")}
                    </Button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-muted-foreground py-3 text-sm">
              {t("devices.noOtherDevices")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
