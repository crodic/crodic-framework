"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertCircle, Laptop, Lock, UserCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile, useSignOut, useSocialAccounts } from "@/hooks/use-profile";
import { useAuthStore } from "@/store/use-auth-store";

import { ProfileHeader } from "./profile-header";
import { ProfileSidebar } from "./profile-sidebar";
import { GeneralInfoForm } from "./general-info-form";
import { ChangePasswordForm } from "./change-password-form";
import { SetupPasswordForm } from "./setup-password-form";
import { SocialAccountsCard } from "./social-accounts-card";
import { ActiveDevicesCard } from "./active-devices-card";
import { UnverifiedEmailBanner } from "./unverified-email-banner";

export function ProfileView() {
  const t = useTranslations("Profile");
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const { data: socialAccounts = [] } = useSocialAccounts();
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const signOutMutation = useSignOut();
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentTab =
    searchParams.get("tab") === "security"
      ? "security"
      : searchParams.get("tab") === "sessions"
        ? "sessions"
        : "general";

  const handleTabChange = (value: string) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (value === "general") {
      nextParams.delete("tab");
    } else {
      nextParams.set("tab", value);
    }
    const query = nextParams.toString();
    router.replace(query ? `/profile?${query}` : "/profile");
  };

  if (isLoading || isHydrating) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <ProfileHeader profile={undefined} isLoading={true} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="space-y-4 lg:col-span-4">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
          </div>
          <div className="space-y-4 lg:col-span-8">
            <Skeleton className="h-10 w-72 rounded-xl" />
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16">
        <Alert variant="destructive" className="rounded-2xl">
          <AlertCircle className="size-4" />
          <AlertTitle>{t("authRequired")}</AlertTitle>
          <AlertDescription className="mt-2 flex flex-col gap-3">
            <span>{t("errorLoading")}</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl"
                onClick={() => void refetch()}
              >
                {t("retry")}
              </Button>
              <Button
                size="sm"
                disabled={signOutMutation.isPending}
                className="rounded-xl"
                onClick={() => signOutMutation.mutate()}
              >
                {signOutMutation.isPending ? t("signingOut") : t("signIn")}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      {/* Elevated Header with Dynamic Cover */}
      <ProfileHeader profile={profile} isLoading={false} />

      {/* Unverified Email Alert Banner if needed */}
      {!profile.verifiedAt && <UnverifiedEmailBanner email={profile.email} />}

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Left Column: Security Health & Account Overview */}
        <div className="lg:col-span-4">
          <ProfileSidebar profile={profile} socialAccounts={socialAccounts} />
        </div>

        {/* Right Column: Tabbed Content */}
        <div className="lg:col-span-8">
          <Tabs
            value={currentTab}
            onValueChange={handleTabChange}
            className="w-full space-y-6"
          >
            <TabsList className="bg-muted/60 grid w-full grid-cols-3 rounded-2xl p-1 sm:inline-grid sm:w-auto">
              <TabsTrigger
                value="general"
                className="gap-2 rounded-xl text-xs font-medium sm:text-sm"
              >
                <UserCircle className="size-4" />
                <span>{t("tabs.general")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="gap-2 rounded-xl text-xs font-medium sm:text-sm"
              >
                <Lock className="size-4" />
                <span>{t("tabs.security")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="sessions"
                className="gap-2 rounded-xl text-xs font-medium sm:text-sm"
              >
                <Laptop className="size-4" />
                <span>{t("tabs.sessions")}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="general"
              className="space-y-6 focus-visible:outline-hidden"
            >
              <GeneralInfoForm profile={profile} />
            </TabsContent>

            <TabsContent
              value="security"
              className="space-y-6 focus-visible:outline-hidden"
            >
              {profile.hasPassword ? (
                <ChangePasswordForm />
              ) : (
                <SetupPasswordForm />
              )}
              <SocialAccountsCard />
            </TabsContent>

            <TabsContent
              value="sessions"
              className="space-y-6 focus-visible:outline-hidden"
            >
              <ActiveDevicesCard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
