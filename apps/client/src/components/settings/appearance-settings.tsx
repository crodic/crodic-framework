"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Check, Globe, Moon, Palette, Sun, Monitor } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/language-switcher";
import { cn } from "@/lib/utils";

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("Settings.appearance");

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. Theme Selection */}
      <Card className="border-border/70 bg-card/60 rounded-2xl shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <Palette className="text-primary size-4" />
            <span>{t("themeTitle")}</span>
          </CardTitle>
          <CardDescription className="text-xs">
            {t("themeDesc")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {/* Light Mode Card */}
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={cn(
                "group bg-card hover:border-primary/50 relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 text-center transition-all",
                mounted && theme === "light"
                  ? "border-primary ring-primary/30 shadow-primary/10 shadow-md ring-2"
                  : "border-border/60 opacity-80 hover:opacity-100"
              )}
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 transition-transform group-hover:scale-110">
                <Sun className="size-5" />
              </div>
              <span className="text-foreground text-xs font-bold">
                {t("light")}
              </span>
              {mounted && theme === "light" && (
                <span className="bg-primary text-primary-foreground absolute top-2 right-2 flex size-4 items-center justify-center rounded-full">
                  <Check className="size-2.5" />
                </span>
              )}
            </button>

            {/* Dark Mode Card */}
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={cn(
                "group bg-card hover:border-primary/50 relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 text-center transition-all",
                mounted && theme === "dark"
                  ? "border-primary ring-primary/30 shadow-primary/10 shadow-md ring-2"
                  : "border-border/60 opacity-80 hover:opacity-100"
              )}
            >
              <div className="bg-primary/15 text-primary flex size-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
                <Moon className="size-5" />
              </div>
              <span className="text-foreground text-xs font-bold">
                {t("dark")}
              </span>
              {mounted && theme === "dark" && (
                <span className="bg-primary text-primary-foreground absolute top-2 right-2 flex size-4 items-center justify-center rounded-full">
                  <Check className="size-2.5" />
                </span>
              )}
            </button>

            {/* System Mode Card */}
            <button
              type="button"
              onClick={() => setTheme("system")}
              className={cn(
                "group bg-card hover:border-primary/50 relative col-span-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 text-center transition-all sm:col-span-1",
                mounted && theme === "system"
                  ? "border-primary ring-primary/30 shadow-primary/10 shadow-md ring-2"
                  : "border-border/60 opacity-80 hover:opacity-100"
              )}
            >
              <div className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
                <Monitor className="size-5" />
              </div>
              <span className="text-foreground text-xs font-bold">
                {t("system")}
              </span>
              {mounted && theme === "system" && (
                <span className="bg-primary text-primary-foreground absolute top-2 right-2 flex size-4 items-center justify-center rounded-full">
                  <Check className="size-2.5" />
                </span>
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 2. Interactive Language Selection with Pills variant */}
      <Card className="border-border/70 bg-card/60 rounded-2xl shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <Globe className="text-primary size-4" />
            <span>{t("languageTitle")}</span>
          </CardTitle>
          <CardDescription className="text-xs">
            {t("languageDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LanguageSwitcher variant="pills" />
        </CardContent>
      </Card>
    </div>
  );
}
