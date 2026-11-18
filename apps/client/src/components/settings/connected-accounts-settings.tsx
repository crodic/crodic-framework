"use client";

import React from "react";
import { Check, Link as LinkIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
      <Card className="border-border/70 bg-card/60 rounded-2xl shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <LinkIcon className="text-primary size-4" />
            <span>{t("title")}</span>
          </CardTitle>
          <CardDescription className="text-xs">
            {t("description")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Google Account */}
          <div className="bg-muted/40 border-border/50 flex items-center justify-between rounded-xl border p-3.5">
            <div className="flex items-center gap-3">
              <div className="bg-background border-border/80 flex size-8 items-center justify-center rounded-lg border text-xs font-bold">
                G
              </div>
              <div>
                <p className="text-foreground text-xs font-semibold sm:text-sm">
                  {t("google")}
                </p>
                <p className="text-muted-foreground text-[11px]">
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
                className="h-8 rounded-xl text-xs"
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
          <div className="bg-muted/40 border-border/50 flex items-center justify-between rounded-xl border p-3.5 opacity-80">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                f
              </div>
              <div>
                <p className="text-foreground text-xs font-semibold sm:text-sm">
                  {t("facebook")}
                </p>
                <p className="text-muted-foreground text-[11px]">
                  {t("notLinked")}
                </p>
              </div>
            </div>
            <span className="bg-muted text-muted-foreground rounded-md px-2.5 py-1 text-[11px] font-medium">
              {t("comingSoon")}
            </span>
          </div>

          {/* Discord */}
          <div className="bg-muted/40 border-border/50 flex items-center justify-between rounded-xl border p-3.5 opacity-80">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-[#5865F2] text-xs font-bold text-white">
                D
              </div>
              <div>
                <p className="text-foreground text-xs font-semibold sm:text-sm">
                  {t("discord")}
                </p>
                <p className="text-muted-foreground text-[11px]">
                  {t("notLinked")}
                </p>
              </div>
            </div>
            <span className="bg-muted text-muted-foreground rounded-md px-2.5 py-1 text-[11px] font-medium">
              {t("comingSoon")}
            </span>
          </div>

          {/* X / Twitter */}
          <div className="bg-muted/40 border-border/50 flex items-center justify-between rounded-xl border p-3.5 opacity-80">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg border border-white/20 bg-black text-xs font-bold text-white">
                𝕏
              </div>
              <div>
                <p className="text-foreground text-xs font-semibold sm:text-sm">
                  {t("x")}
                </p>
                <p className="text-muted-foreground text-[11px]">
                  {t("notLinked")}
                </p>
              </div>
            </div>
            <span className="bg-muted text-muted-foreground rounded-md px-2.5 py-1 text-[11px] font-medium">
              {t("comingSoon")}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
