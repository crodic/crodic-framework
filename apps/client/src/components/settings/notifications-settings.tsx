"use client";

import React, { useState } from "react";
import { Bell, Mail } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
      <Card className="border-border/70 bg-card/60 rounded-2xl shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <Bell className="text-primary size-4" />
            <span>{t("systemTitle")}</span>
          </CardTitle>
          <CardDescription className="text-xs">
            {t("systemDesc")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3.5">
          <div className="bg-muted/40 border-border/50 flex items-center justify-between rounded-xl border p-3">
            <div className="space-y-0.5 pr-4">
              <p className="text-foreground text-xs font-semibold sm:text-sm">
                {t("newPostTitle")}
              </p>
              <p className="text-muted-foreground text-[11px]">
                {t("newPostDesc")}
              </p>
            </div>
            <Switch
              checked={notifyNewPost}
              onCheckedChange={setNotifyNewPost}
            />
          </div>

          <div className="bg-muted/40 border-border/50 flex items-center justify-between rounded-xl border p-3">
            <div className="space-y-0.5 pr-4">
              <p className="text-foreground text-xs font-semibold sm:text-sm">
                {t("interactionsTitle")}
              </p>
              <p className="text-muted-foreground text-[11px]">
                {t("interactionsDesc")}
              </p>
            </div>
            <Switch
              checked={notifyInteractions}
              onCheckedChange={setNotifyInteractions}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/60 rounded-2xl shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <Mail className="text-primary size-4" />
            <span>{t("emailTitle")}</span>
          </CardTitle>
          <CardDescription className="text-xs">
            {t("emailDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/40 border-border/50 flex items-center justify-between rounded-xl border p-3">
            <div className="space-y-0.5 pr-4">
              <p className="text-foreground text-xs font-semibold sm:text-sm">
                {t("eventsTitle")}
              </p>
              <p className="text-muted-foreground text-[11px]">
                {t("eventsDesc")}
              </p>
            </div>
            <Switch
              checked={notifyFestivals}
              onCheckedChange={setNotifyFestivals}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
