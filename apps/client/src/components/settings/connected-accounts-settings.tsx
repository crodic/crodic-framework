"use client";

import React from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  useProfile,
  useSocialAccounts,
  useLinkGoogle,
} from "@/hooks/use-profile";
import { useTranslations } from "next-intl";

export function ConnectedAccountsSettings() {
  const t = useTranslations("Settings.connected");
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { data: socialAccounts, isLoading: isSocialLoading } =
    useSocialAccounts();
  const linkGoogleMutation = useLinkGoogle();

  const googleAccount = socialAccounts?.find(
    (acc) => acc.provider === "google"
  );
  const isGoogleLinked = !!googleAccount;
  const googleEmail = googleAccount?.email || profile?.email;

  const handleLinkGoogle = () => {
    linkGoogleMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-xl shadow-none">
        <CardHeader className="px-4 sm:px-6">
          <h2 className="text-lg font-semibold">{t("title")}</h2>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>

        <CardContent className="divide-border divide-y px-4 sm:px-6">
          {/* Google Account */}
          <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <div className="flex min-w-0 items-center gap-3">
              <div className="bg-background border-border/80 flex size-9 shrink-0 items-center justify-center rounded-lg border text-xs font-bold">
                G
              </div>
              <div>
                <p className="text-foreground text-sm font-medium">
                  {t("google")}
                </p>
                <p className="text-muted-foreground text-xs wrap-anywhere">
                  {isGoogleLinked && googleEmail ? googleEmail : t("notLinked")}
                </p>
              </div>
            </div>
            {isSocialLoading || isProfileLoading ? (
              <Loader2 className="text-muted-foreground size-4 animate-spin" />
            ) : isGoogleLinked ? (
              <span className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-500">
                <Check className="size-3" />
                {t("linked")}
              </span>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={handleLinkGoogle}
                disabled={linkGoogleMutation.isPending}
                className="h-9"
              >
                {linkGoogleMutation.isPending ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  t("link")
                )}
              </Button>
            )}
          </div>

          {/* Facebook */}
          <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                f
              </div>
              <div>
                <p className="text-foreground text-sm font-medium">
                  {t("facebook")}
                </p>
                <p className="text-muted-foreground text-xs wrap-anywhere">
                  {t("notLinked")}
                </p>
              </div>
            </div>
            <span className="bg-muted text-muted-foreground shrink-0 rounded-md px-2 py-1 text-xs font-medium">
              {t("comingSoon")}
            </span>
          </div>

          {/* Discord */}
          <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#5865F2] text-xs font-bold text-white">
                D
              </div>
              <div>
                <p className="text-foreground text-sm font-medium">
                  {t("discord")}
                </p>
                <p className="text-muted-foreground text-xs wrap-anywhere">
                  {t("notLinked")}
                </p>
              </div>
            </div>
            <span className="bg-muted text-muted-foreground shrink-0 rounded-md px-2 py-1 text-xs font-medium">
              {t("comingSoon")}
            </span>
          </div>

          {/* X / Twitter */}
          <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-black text-xs font-bold text-white">
                𝕏
              </div>
              <div>
                <p className="text-foreground text-sm font-medium">{t("x")}</p>
                <p className="text-muted-foreground text-xs wrap-anywhere">
                  {t("notLinked")}
                </p>
              </div>
            </div>
            <span className="bg-muted text-muted-foreground shrink-0 rounded-md px-2 py-1 text-xs font-medium">
              {t("comingSoon")}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
