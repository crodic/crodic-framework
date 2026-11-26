"use client";

import React, { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import {
  ArrowLeft,
  Bell,
  EyeOff,
  Link as LinkIcon,
  Palette,
  ShieldCheck,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SecuritySettings } from "./security-settings";
import { AppearanceSettings } from "./appearance-settings";
import { NotificationsSettings } from "./notifications-settings";
import { ConnectedAccountsSettings } from "./connected-accounts-settings";
import { PrivacySettings } from "./privacy-settings";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type SettingsSection =
  "security" | "appearance" | "notifications" | "connected" | "privacy";

interface NavItem {
  id: SettingsSection;
  labelKey:
    "security" | "appearance" | "notifications" | "connected" | "privacy";
  icon: React.ComponentType<{ className?: string }>;
}

const SETTINGS_NAV: NavItem[] = [
  { id: "security", labelKey: "security", icon: ShieldCheck },
  { id: "appearance", labelKey: "appearance", icon: Palette },
  { id: "notifications", labelKey: "notifications", icon: Bell },
  { id: "connected", labelKey: "connected", icon: LinkIcon },
  { id: "privacy", labelKey: "privacy", icon: EyeOff },
];

export function SettingsView() {
  const router = useRouter();
  const t = useTranslations("Settings");
  const tNav = useTranslations("Navigation");
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("security");

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/profile");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleBack}
            aria-label={t("back")}
            className="size-10"
          >
            <ArrowLeft aria-hidden="true" />
          </Button>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("title")}
          </h1>
        </div>

        <Button asChild variant="outline" className="h-10">
          <Link href="/profile">
            <User aria-hidden="true" />
            {tNav("profile")}
          </Link>
        </Button>
      </header>

      <div className="grid items-start gap-6 md:grid-cols-[12rem_minmax(0,1fr)] lg:gap-8">
        <nav
          aria-label={t("title")}
          className="border-border flex flex-wrap gap-1 border-b pb-3 md:flex-col md:border-b-0 md:pb-0"
        >
          {SETTINGS_NAV.map(({ id, labelKey, icon: Icon }) => {
            const isActive = activeSection === id;

            return (
              <Button
                key={id}
                type="button"
                variant={isActive ? "secondary" : "ghost"}
                aria-pressed={isActive}
                onClick={() => setActiveSection(id)}
                className={cn(
                  "h-10 justify-start",
                  !isActive && "text-muted-foreground"
                )}
              >
                <Icon aria-hidden="true" />
                {t(`nav.${labelKey}`)}
              </Button>
            );
          })}
        </nav>

        <div className="min-w-0">
          {activeSection === "security" && <SecuritySettings />}
          {activeSection === "appearance" && <AppearanceSettings />}
          {activeSection === "notifications" && <NotificationsSettings />}
          {activeSection === "connected" && <ConnectedAccountsSettings />}
          {activeSection === "privacy" && <PrivacySettings />}
        </div>
      </div>
    </div>
  );
}
