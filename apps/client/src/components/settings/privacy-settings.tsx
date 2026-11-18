"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Download,
  EyeOff,
  LogOut,
  Tag,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useTranslations } from "next-intl";
import { useSignOut } from "@/hooks/use-profile";

export function PrivacySettings() {
  const t = useTranslations("Settings.privacy");
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
      <Card className="border-border/70 bg-card/60 rounded-2xl shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <EyeOff className="text-primary size-4" />
            <span>{t("title")}</span>
          </CardTitle>
          <CardDescription className="text-xs">{t("desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/40 border-border/50 flex items-center justify-between rounded-xl border p-3.5">
            <div className="space-y-0.5 pr-4">
              <p className="text-foreground text-xs font-semibold sm:text-sm">
                {t("onlineStatus")}
              </p>
              <p className="text-muted-foreground text-[11px]">
                {t("onlineStatusDesc")}
              </p>
            </div>
            <Switch
              checked={showOnlineStatus}
              onCheckedChange={setShowOnlineStatus}
            />
          </div>

          {/* Muted Tags */}
          <div className="bg-muted/40 border-border/50 space-y-2.5 rounded-xl border p-3.5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-foreground flex items-center gap-1.5 text-xs font-semibold sm:text-sm">
                  <Tag className="text-primary size-3.5" />
                  <span>{t("mutedTags")}</span>
                </p>
                <p className="text-muted-foreground text-[11px]">
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
                    className="hover:text-destructive text-muted-foreground cursor-pointer text-xs"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Data Management */}
      <Card className="border-border/70 bg-card/60 rounded-2xl shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <Download className="text-primary size-4" />
            <span>{t("dataManagement")}</span>
          </CardTitle>
          <CardDescription className="text-xs">
            {t("dataManagementDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            size="sm"
            className="h-9 cursor-pointer gap-1.5 rounded-xl text-xs"
          >
            <Download className="size-3.5" />
            <span>{t("downloadData")}</span>
          </Button>
        </CardContent>
      </Card>

      {/* 3. Danger Zone */}
      <Card className="border-destructive/30 bg-destructive/5 rounded-2xl shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-destructive flex items-center gap-2 text-base font-bold">
            <AlertTriangle className="size-4" />
            <span>{t("dangerZone")}</span>
          </CardTitle>
          <CardDescription className="text-xs">
            {t("dangerZoneDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-background border-border/60 flex items-center justify-between rounded-xl border p-3">
            <div>
              <p className="text-foreground text-xs font-semibold sm:text-sm">
                {t("signOutThisDevice")}
              </p>
              <p className="text-muted-foreground text-[11px]">
                {t("signOutThisDeviceDesc")}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              disabled={signOutMutation.isPending}
              className="text-muted-foreground hover:text-foreground h-8 cursor-pointer gap-1.5 rounded-xl text-xs"
            >
              <LogOut className="size-3.5" />
              <span>{t("signOut")}</span>
            </Button>
          </div>

          <div className="bg-background border-destructive/30 flex items-center justify-between rounded-xl border p-3">
            <div>
              <p className="text-destructive text-xs font-semibold sm:text-sm">
                {t("deleteAccount")}
              </p>
              <p className="text-muted-foreground text-[11px]">
                {t("deleteAccountDesc")}
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="h-8 cursor-pointer gap-1.5 rounded-xl text-xs"
            >
              <Trash2 className="size-3.5" />
              <span>{t("deleteAccountBtn")}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
