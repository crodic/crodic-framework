"use client";

import React from "react";
import { useFormatter, useTranslations } from "next-intl";
import {
  CalendarIcon,
  CheckCircle2,
  Clock,
  KeyRound,
  Laptop,
  Mail,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SocialAccount, User } from "@/types/apis";
import { useSessions } from "@/hooks/use-profile";

interface ProfileSidebarProps {
  profile: User;
  socialAccounts?: SocialAccount[];
}

export function ProfileSidebar({
  profile,
  socialAccounts = [],
}: ProfileSidebarProps) {
  const t = useTranslations("Profile.securityScore");
  const tOverview = useTranslations("Profile.accountOverview");
  const format = useFormatter();
  const { data: sessions = [] } = useSessions();

  const isVerified = !!profile.verifiedAt;
  const hasPassword = !!profile.hasPassword;
  const hasGoogle = socialAccounts.some((a) => a.provider === "google");

  // Calculate score based purely on real security configurations (3 key factors)
  const items = [
    { key: "email", passed: isVerified, weight: 34, label: t("emailVerified") },
    {
      key: "password",
      passed: hasPassword,
      weight: 33,
      label: t("passwordSet"),
    },
    { key: "social", passed: hasGoogle, weight: 33, label: t("socialLinked") },
  ];

  const score = items.reduce(
    (acc, cur) => (cur.passed ? acc + cur.weight : acc),
    0
  );

  const getScoreStatus = () => {
    if (score >= 90)
      return { label: t("statusExcellent"), color: "text-emerald-500" };
    if (score >= 50) return { label: t("statusGood"), color: "text-primary" };
    return { label: t("statusNeedsAttention"), color: "text-amber-500" };
  };

  const status = getScoreStatus();

  const memberSinceFormatted = profile.createdAt
    ? format.dateTime(new Date(profile.createdAt), {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const lastUpdatedFormatted = profile.updatedAt
    ? format.dateTime(new Date(profile.updatedAt), {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="space-y-6">
      {/* Security Health Score Card */}
      <Card className="border-border/60 rounded-2xl shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                <ShieldCheck className="size-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">
                  {t("title")}
                </CardTitle>
                <p className="text-muted-foreground text-xs">{t("subtitle")}</p>
              </div>
            </div>
            <span className={`text-xs font-bold ${status.color}`}>
              {status.label}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-1">
          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">
                {score}%
              </span>
              <span className="text-foreground font-mono font-semibold">
                {items.filter((i) => i.passed).length}/{items.length}
              </span>
            </div>
            <Progress value={score} className="bg-secondary h-2" />
          </div>

          {/* Checklist Items */}
          <div className="space-y-2.5 pt-2 text-xs">
            {/* Email Verified */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="text-muted-foreground size-3.5" />
                <span
                  className={
                    isVerified ? "text-foreground" : "text-muted-foreground"
                  }
                >
                  {t("emailVerified")}
                </span>
              </div>
              {isVerified ? (
                <CheckCircle2 className="size-4 text-emerald-500" />
              ) : (
                <ShieldAlert className="size-4 text-amber-500" />
              )}
            </div>

            {/* Password Set */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="text-muted-foreground size-3.5" />
                <span
                  className={
                    hasPassword ? "text-foreground" : "text-muted-foreground"
                  }
                >
                  {t("passwordSet")}
                </span>
              </div>
              {hasPassword ? (
                <CheckCircle2 className="size-4 text-emerald-500" />
              ) : (
                <ShieldAlert className="size-4 text-amber-500" />
              )}
            </div>

            {/* Google Linked */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="text-muted-foreground size-3.5" />
                <span
                  className={
                    hasGoogle ? "text-foreground" : "text-muted-foreground"
                  }
                >
                  {t("socialLinked")}
                </span>
              </div>
              {hasGoogle ? (
                <CheckCircle2 className="size-4 text-emerald-500" />
              ) : (
                <span className="text-muted-foreground text-[10px]">
                  Optional
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Overview Metadata Card - Strictly Real Data from DB */}
      <Card className="border-border/60 rounded-2xl shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            {tOverview("title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0 text-xs">
          {/* User ID - Real ID value from database */}
          <div className="border-border/40 flex items-center justify-between border-b pb-2.5">
            <span className="text-muted-foreground">{tOverview("userId")}</span>
            <span className="text-foreground font-mono font-medium">
              #{profile.id}
            </span>
          </div>

          {/* Email Verification Status */}
          <div className="border-border/40 flex items-center justify-between border-b pb-2.5">
            <span className="text-muted-foreground">
              {tOverview("emailStatus")}
            </span>
            {isVerified ? (
              <Badge
                variant="outline"
                className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-[11px] font-medium text-emerald-600 dark:text-emerald-400"
              >
                <CheckCircle2 className="size-3" />
                <span>Verified</span>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="gap-1 border-amber-500/30 bg-amber-500/10 text-[11px] font-medium text-amber-600 dark:text-amber-400"
              >
                <ShieldAlert className="size-3" />
                <span>Unverified</span>
              </Badge>
            )}
          </div>

          {/* Active Sessions Count */}
          <div className="border-border/40 flex items-center justify-between border-b pb-2.5">
            <span className="text-muted-foreground">
              {tOverview("activeDevices")}
            </span>
            <div className="text-foreground flex items-center gap-1.5 font-medium">
              <Laptop className="text-muted-foreground size-3.5" />
              <span>{sessions.length || 1}</span>
            </div>
          </div>

          {/* Joined Date */}
          {memberSinceFormatted && (
            <div className="border-border/40 flex items-center justify-between border-b pb-2.5">
              <span className="text-muted-foreground">
                {tOverview("registered")}
              </span>
              <span className="text-foreground font-medium">
                {memberSinceFormatted}
              </span>
            </div>
          )}

          {/* Last Profile Update */}
          {lastUpdatedFormatted && (
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-muted-foreground">
                {tOverview("lastUpdated")}
              </span>
              <span className="text-foreground font-medium">
                {lastUpdatedFormatted}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
