"use client";

import React, { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  CalendarIcon,
  Camera,
  CheckCircle2,
  Clock,
  Copy,
  LogOut,
  Mail,
  ShieldAlert,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getUserInitials } from "@/lib/utils";
import { useSignOut } from "@/hooks/use-profile";
import { User } from "@/types/apis";
import { AvatarCropDialog } from "./avatar-crop-dialog";

interface ProfileHeaderProps {
  profile: User | null | undefined;
  isLoading: boolean;
}

export function ProfileHeader({ profile, isLoading }: ProfileHeaderProps) {
  const t = useTranslations("Profile");
  const tSecurity = useTranslations("Security.session");
  const format = useFormatter();
  const signOutMutation = useSignOut();
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-card border-border/60 flex flex-col gap-4 rounded-2xl border p-6 shadow-xs sm:flex-row sm:items-center sm:gap-6">
        <Skeleton className="size-20 rounded-full sm:size-24" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const initials = getUserInitials(profile);

  const memberSinceFormatted = profile.createdAt
    ? format.dateTime(new Date(profile.createdAt), {
        year: "numeric",
        month: "short",
      })
    : null;

  const lastUpdatedFormatted = profile.updatedAt
    ? format.dateTime(new Date(profile.updatedAt), {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const handleCopyId = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(String(profile.id));
      toast.success(t("idCopied"));
    }
  };

  return (
    <div className="bg-card border-border/60 overflow-hidden rounded-2xl border shadow-xs">
      {/* Dynamic Cover Backdrop */}
      <div className="border-border/40 from-primary/20 via-primary/5 to-card relative h-28 w-full overflow-hidden border-b bg-gradient-to-br sm:h-36">
        <div className="from-primary/15 absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] via-transparent to-transparent opacity-80" />
      </div>

      {/* Identity & Actions Container */}
      <div className="relative px-6 pt-0 pb-6 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          {/* Avatar & Main Info */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
            <div className="relative -mt-12 inline-block sm:-mt-16">
              <Avatar className="border-card ring-border/60 size-20 rounded-full border-4 shadow-md ring-2 sm:size-24">
                {profile.avatar && (
                  <AvatarImage src={profile.avatar} alt={profile.fullName} />
                )}
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold sm:text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span
                className={`border-card absolute bottom-1 left-1 size-3.5 rounded-full border-2 ${
                  profile.verifiedAt ? "bg-emerald-500" : "bg-amber-500"
                }`}
                title={profile.verifiedAt ? t("verified") : t("unverified")}
              />

              {/* Camera Trigger for Uploading Avatar */}
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                title={t("avatar.title")}
                className="bg-card hover:bg-muted text-foreground border-border/80 absolute -right-1 -bottom-1 flex size-7 cursor-pointer items-center justify-center rounded-full border shadow-md transition-transform hover:scale-110"
              >
                <Camera className="text-primary size-3.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
                  {profile.fullName || profile.email}
                </h1>

                <Badge variant="secondary" className="text-xs font-medium">
                  {t("role")}
                </Badge>

                {profile.verifiedAt ? (
                  <Badge
                    variant="outline"
                    className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                  >
                    <CheckCircle2 className="size-3" />
                    <span>{t("verified")}</span>
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="gap-1 border-amber-500/30 bg-amber-500/10 text-xs font-medium text-amber-600 dark:text-amber-400"
                  >
                    <ShieldAlert className="size-3" />
                    <span>{t("unverified")}</span>
                  </Badge>
                )}

                <button
                  type="button"
                  onClick={handleCopyId}
                  title={t("copyId")}
                  className="bg-secondary/70 hover:bg-secondary text-secondary-foreground inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-0.5 font-mono text-xs transition-colors"
                >
                  <Copy className="text-muted-foreground size-3" />
                  <span>#{profile.id}</span>
                </button>
              </div>

              {/* Meta row */}
              <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                <span className="flex items-center gap-1.5">
                  <Mail className="text-muted-foreground size-3.5" />
                  <span>{profile.email}</span>
                </span>

                {memberSinceFormatted && (
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon className="text-muted-foreground size-3.5" />
                    <span>
                      {t("memberSince")} {memberSinceFormatted}
                    </span>
                  </span>
                )}

                {lastUpdatedFormatted && (
                  <span className="hidden items-center gap-1.5 sm:flex">
                    <Clock className="text-muted-foreground size-3.5" />
                    <span>
                      {t("lastUpdated")} {lastUpdatedFormatted}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Sign Out Action */}
          <div className="pt-2 sm:pt-0">
            <AlertDialog open={isSignOutOpen} onOpenChange={setIsSignOutOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={signOutMutation.isPending}
                  className="border-border/70 hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive gap-2 rounded-xl text-xs transition-all"
                >
                  <LogOut className="size-3.5" />
                  <span>{t("signOutButton")}</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {tSecurity("confirmTitle")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {tSecurity("confirmDescription")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{tSecurity("cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() => signOutMutation.mutate()}
                  >
                    {tSecurity("confirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Avatar Crop & Rotate Dialog */}
      <AvatarCropDialog
        open={isAvatarModalOpen}
        onOpenChange={setIsAvatarModalOpen}
        currentAvatarUrl={profile.avatar}
      />
    </div>
  );
}
