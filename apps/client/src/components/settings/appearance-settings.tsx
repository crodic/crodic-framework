"use client";

import { Check, Moon, Monitor, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useThemeTransition } from "@/components/transitions/theme-transition";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";

const THEME_OPTIONS = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
  { value: "system", icon: Monitor },
] as const;

export function AppearanceSettings() {
  const { mounted, theme, setTheme } = useThemeTransition();
  const t = useTranslations("Settings.appearance");

  return (
    <div className="space-y-6">
      <Card className="rounded-xl shadow-none">
        <CardHeader className="px-4 sm:px-6">
          <h2 className="text-lg font-semibold">{t("themeTitle")}</h2>
          <CardDescription>{t("themeDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="grid gap-2 sm:grid-cols-3">
            {THEME_OPTIONS.map(({ value, icon: Icon }) => {
              const selected = mounted && theme === value;

              return (
                <Button
                  key={value}
                  type="button"
                  variant={selected ? "secondary" : "outline"}
                  aria-pressed={selected}
                  onClick={() => setTheme(value)}
                  className="h-10 justify-start"
                >
                  <Icon aria-hidden="true" />
                  {t(value)}
                  {selected && <Check aria-hidden="true" className="ms-auto" />}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-none">
        <CardHeader className="px-4 sm:px-6">
          <h2 className="text-lg font-semibold">{t("languageTitle")}</h2>
          <CardDescription>{t("languageDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <LanguageSwitcher variant="pills" />
        </CardContent>
      </Card>
    </div>
  );
}
