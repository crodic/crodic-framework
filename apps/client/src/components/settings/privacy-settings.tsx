"use client";

import React, { useState } from "react";
import { Download, LogOut, Tag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useTranslations } from "next-intl";
import { useSignOut } from "@/hooks/use-profile";

export function PrivacySettings() {
  const t = useTranslations("Settings.privacy");
  const tStudio = useTranslations("Studio");
  const signOutMutation = useSignOut();
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [mutedTags, setMutedTags] = useState<string[]>([
    "Spoiler",
    "Gore",
    "HorrorCosplay",
  ]);

  const removeMutedTag = (tag: string) => {
    setMutedTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSignOut = () => {
    signOutMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* 1. Privacy Settings */}
      <Card className="rounded-xl shadow-none">
        <CardHeader className="px-4 sm:px-6">
          <h2 className="text-lg font-semibold">{t("title")}</h2>
          <CardDescription>{t("desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5 pr-4">
              <p className="text-foreground text-sm font-medium">
                {t("onlineStatus")}
              </p>
              <p className="text-muted-foreground text-xs">
                {t("onlineStatusDesc")}
              </p>
            </div>
            <Switch
              aria-label={t("onlineStatus")}
              checked={showOnlineStatus}
              onCheckedChange={setShowOnlineStatus}
            />
          </div>

          {/* Muted Tags */}
          <div className="border-border space-y-2 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-foreground flex items-center gap-1.5 text-sm font-medium">
                  <Tag className="text-primary size-3.5" />
                  <span>{t("mutedTags")}</span>
                </p>
                <p className="text-muted-foreground text-xs">
                  {t("mutedTagsDesc")}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {mutedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-background border-border/70 gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeMutedTag(tag)}
                    className="text-muted-foreground hover:text-destructive focus-visible:ring-ring flex size-6 cursor-pointer items-center justify-center rounded-md focus-visible:ring-2"
                    aria-label={tStudio("removeTag", { tag })}
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Data Management */}
      <Card className="rounded-xl shadow-none">
        <CardHeader className="px-4 sm:px-6">
          <h2 className="text-lg font-semibold">{t("dataManagement")}</h2>
          <CardDescription>{t("dataManagementDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <Button variant="outline" size="sm" className="h-9">
            <Download className="size-3.5" />
            <span>{t("downloadData")}</span>
          </Button>
        </CardContent>
      </Card>

      {/* 3. Danger Zone */}
      <Card className="border-destructive/30 rounded-xl shadow-none">
        <CardHeader className="px-4 sm:px-6">
          <h2 className="text-destructive text-lg font-semibold">
            {t("dangerZone")}
          </h2>
          <CardDescription>{t("dangerZoneDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-foreground text-sm font-medium">
                {t("signOutThisDevice")}
              </p>
              <p className="text-muted-foreground text-xs">
                {t("signOutThisDeviceDesc")}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              disabled={signOutMutation.isPending}
              className="text-muted-foreground hover:text-foreground h-9"
            >
              <LogOut className="size-3.5" />
              <span>{t("signOut")}</span>
            </Button>
          </div>

          <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <div>
              <p className="text-destructive text-sm font-medium">
                {t("deleteAccount")}
              </p>
              <p className="text-muted-foreground text-xs">
                {t("deleteAccountDesc")}
              </p>
            </div>
            <Button variant="destructive" size="sm" className="h-9">
              <Trash2 className="size-3.5" />
              <span>{t("deleteAccountBtn")}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
