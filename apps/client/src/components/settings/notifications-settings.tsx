"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useTranslations } from "next-intl";

export function NotificationsSettings() {
  const t = useTranslations("Settings.notifications");
  const [notifyNewPost, setNotifyNewPost] = useState(true);
  const [notifyInteractions, setNotifyInteractions] = useState(true);
  const [notifyFestivals, setNotifyFestivals] = useState(false);

  return (
    <div className="space-y-6">
      <Card className="rounded-xl shadow-none">
        <CardHeader className="px-4 sm:px-6">
          <h2 className="text-lg font-semibold">{t("systemTitle")}</h2>
          <CardDescription>{t("systemDesc")}</CardDescription>
        </CardHeader>

        <CardContent className="divide-border divide-y px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div className="space-y-0.5 pr-4">
              <p className="text-foreground text-sm font-medium">
                {t("newPostTitle")}
              </p>
              <p className="text-muted-foreground text-xs">
                {t("newPostDesc")}
              </p>
            </div>
            <Switch
              aria-label={t("newPostTitle")}
              checked={notifyNewPost}
              onCheckedChange={setNotifyNewPost}
            />
          </div>

          <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div className="space-y-0.5 pr-4">
              <p className="text-foreground text-sm font-medium">
                {t("interactionsTitle")}
              </p>
              <p className="text-muted-foreground text-xs">
                {t("interactionsDesc")}
              </p>
            </div>
            <Switch
              aria-label={t("interactionsTitle")}
              checked={notifyInteractions}
              onCheckedChange={setNotifyInteractions}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-none">
        <CardHeader className="px-4 sm:px-6">
          <h2 className="text-lg font-semibold">{t("emailTitle")}</h2>
          <CardDescription>{t("emailDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div className="space-y-0.5 pr-4">
              <p className="text-foreground text-sm font-medium">
                {t("eventsTitle")}
              </p>
              <p className="text-muted-foreground text-xs">{t("eventsDesc")}</p>
            </div>
            <Switch
              aria-label={t("eventsTitle")}
              checked={notifyFestivals}
              onCheckedChange={setNotifyFestivals}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
