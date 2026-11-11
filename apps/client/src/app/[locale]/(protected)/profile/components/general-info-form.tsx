"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { z } from "zod";
import {
  Bell,
  Check,
  Copy,
  Info,
  Loader2,
  Mail,
  ShieldAlert,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { extractErrorMessage, useUpdateProfile } from "@/hooks/use-profile";
import { User } from "@/types/apis";

interface GeneralInfoFormProps {
  profile: User;
}

export function GeneralInfoForm({ profile }: GeneralInfoFormProps) {
  const t = useTranslations("GeneralInfo");
  const updateProfileMutation = useUpdateProfile();
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Local notification toggles based on profile.notifications
  const [notifications, setNotifications] = useState({
    email: profile.notifications?.email ?? true,
    system: profile.notifications?.system ?? true,
    security: profile.notifications?.security ?? true,
  });

  const generalInfoSchema = React.useMemo(
    () =>
      z.object({
        firstName: z
          .string()
          .trim()
          .min(1, t("validation.firstNameRequired"))
          .max(100, t("validation.firstNameMax")),
        lastName: z
          .string()
          .trim()
          .min(1, t("validation.lastNameRequired"))
          .max(100, t("validation.lastNameMax")),
      }),
    [t]
  );

  type GeneralInfoValues = z.infer<typeof generalInfoSchema>;

  const form = useForm<GeneralInfoValues>({
    resolver: zodResolver(generalInfoSchema),
    defaultValues: {
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
    },
  });

  useEffect(() => {
    if (!form.formState.isDirty) {
      form.reset({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
      });
    }
  }, [profile.firstName, profile.lastName, form]);

  const onSubmit = async (values: GeneralInfoValues) => {
    try {
      await updateProfileMutation.mutateAsync(values);
      toast.success(t("success"));
    } catch (error) {
      const msg = extractErrorMessage(error, t("error"));
      toast.error(msg);
    }
  };

  const handleCopyEmail = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(profile.email);
      setCopiedEmail(true);
      toast.success(t("copiedEmail"));
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const isSubmitting = updateProfileMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Personal Details Card */}
      <Card className="border-border/60 rounded-2xl shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserIcon className="text-primary size-5" />
            <CardTitle className="text-lg font-semibold sm:text-xl">
              {t("title")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm">
            {t("description")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("firstName")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("firstNamePlaceholder")}
                          disabled={isSubmitting}
                          className="rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("lastName")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("lastNamePlaceholder")}
                          disabled={isSubmitting}
                          className="rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormLabel>{t("email")}</FormLabel>
                <div className="relative flex items-center">
                  <Input
                    value={profile.email}
                    disabled
                    className="bg-muted/50 text-muted-foreground cursor-not-allowed rounded-xl pr-10 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="text-muted-foreground hover:text-foreground absolute right-2.5 cursor-pointer p-1 transition-colors"
                    title={t("copiedEmail")}
                  >
                    {copiedEmail ? (
                      <Check className="size-4 text-emerald-500" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </button>
                </div>
                <FormDescription className="text-xs">
                  {t("emailReadonlyHint")}
                </FormDescription>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || !form.formState.isDirty}
                  className="rounded-xl"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      {t("saving")}
                    </>
                  ) : (
                    t("saveChanges")
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Notification Preferences Card */}
      <Card className="border-border/60 rounded-2xl shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="text-primary size-5" />
            <CardTitle className="text-lg font-semibold sm:text-xl">
              {t("notifications.title")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm">
            {t("notifications.description")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Security Alert Channel */}
          <div className="border-border/50 bg-background/50 flex items-center justify-between rounded-xl border p-4 transition-colors">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 text-primary mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg">
                <ShieldAlert className="size-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-foreground text-sm font-medium">
                  {t("notifications.security")}
                </p>
                <p className="text-muted-foreground text-xs">
                  {t("notifications.securityDesc")}
                </p>
              </div>
            </div>
            <Switch
              checked={notifications.security}
              onCheckedChange={(val) =>
                setNotifications((prev) => ({ ...prev, security: val }))
              }
            />
          </div>

          {/* Product News Channel */}
          <div className="border-border/50 bg-background/50 flex items-center justify-between rounded-xl border p-4 transition-colors">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 text-primary mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg">
                <Mail className="size-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-foreground text-sm font-medium">
                  {t("notifications.email")}
                </p>
                <p className="text-muted-foreground text-xs">
                  {t("notifications.emailDesc")}
                </p>
              </div>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={(val) =>
                setNotifications((prev) => ({ ...prev, email: val }))
              }
            />
          </div>

          {/* System Notices Channel */}
          <div className="border-border/50 bg-background/50 flex items-center justify-between rounded-xl border p-4 transition-colors">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 text-primary mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg">
                <Info className="size-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-foreground text-sm font-medium">
                  {t("notifications.system")}
                </p>
                <p className="text-muted-foreground text-xs">
                  {t("notifications.systemDesc")}
                </p>
              </div>
            </div>
            <Switch
              checked={notifications.system}
              onCheckedChange={(val) =>
                setNotifications((prev) => ({ ...prev, system: val }))
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
