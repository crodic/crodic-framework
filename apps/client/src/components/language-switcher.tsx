"use client";

import React, { useTransition } from "react";
import { useParams } from "next/navigation";
import { Locale, useLocale, useTranslations } from "next-intl";
import { US, VN } from "country-flag-icons/react/3x2";
import { Check, Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getCookieDomain } from "@/lib/cookies";
import { cn } from "@/lib/utils";

const flags: Record<Locale, typeof US> = {
  en: US,
  vi: VN,
};

function stripLocalePrefix(pathname: string, locale: string): string {
  if (pathname.startsWith(`/${locale}/`)) {
    return pathname.replace(`/${locale}`, "");
  }
  if (pathname === `/${locale}`) {
    return "/";
  }
  return pathname;
}

export interface LanguageSwitcherProps {
  variant?: "dropdown" | "select" | "pills";
  className?: string;
  triggerClassName?: string;
  align?: "start" | "end" | "center";
}

export function LanguageSwitcher({
  variant = "dropdown",
  className,
  triggerClassName,
  align = "end",
}: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const params = useParams();
  const t = useTranslations("Languages");

  function onSelectChange(selectedLocale: string) {
    if (selectedLocale === locale) return;
    const nextLocale = selectedLocale as Locale;
    const cleanPathname = stripLocalePrefix(pathname, locale);

    // Save cookie explicitly across subdomains & root domain
    const cookieDomain = getCookieDomain();
    const domainPart = cookieDomain ? `; domain=${cookieDomain}` : "";
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=${
      200 * 24 * 60 * 60
    }; SameSite=Lax${domainPart}`;

    startTransition(() => {
      router.replace(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        { pathname: cleanPathname, params },
        { locale: nextLocale }
      );
    });
  }

  const CurrentFlag = flags[locale as "en" | "vi"];

  if (variant === "pills") {
    return (
      <div className={cn("flex flex-wrap gap-2.5", className)}>
        {routing.locales.map((cur) => {
          const Flag = flags[cur as "en" | "vi"];
          const isSelected = locale === cur;
          return (
            <button
              key={cur}
              type="button"
              disabled={isPending}
              onClick={() => onSelectChange(cur)}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold shadow-xs transition-all select-none",
                isSelected
                  ? "bg-primary text-primary-foreground ring-primary/30 shadow-2xs ring-2"
                  : "border-border/70 bg-card hover:bg-muted text-muted-foreground hover:text-foreground border opacity-80 hover:opacity-100",
                isPending && "pointer-events-none opacity-60"
              )}
            >
              {Flag && <Flag className="size-4 shrink-0 rounded-xs" />}
              <span>{t(cur as "en" | "vi")}</span>
              {isSelected && <Check className="size-3.5" />}
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === "select") {
    return (
      <Select
        value={locale}
        onValueChange={onSelectChange}
        disabled={isPending}
      >
        <SelectTrigger className={cn("w-full max-w-48", triggerClassName)}>
          <SelectValue placeholder={t("selectLanguage")} />
        </SelectTrigger>
        <SelectContent position="popper" align={align}>
          {routing.locales.map((cur) => {
            const Flag = flags[cur as "en" | "vi"];
            return (
              <SelectItem value={cur} key={cur}>
                {Flag && <Flag title={cur} className="size-4" />}
                {t(cur as "en" | "vi")}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          aria-label={t(locale as "en" | "vi")}
          className={cn(
            "border-border/70 bg-background/80 hover:bg-muted/60 h-9 shrink-0 cursor-pointer gap-1.5 rounded-xl px-2.5 text-xs font-semibold transition-colors",
            className,
            triggerClassName
          )}
        >
          {CurrentFlag ? (
            <CurrentFlag className="size-4 shrink-0 rounded-xs" />
          ) : (
            <Globe className="size-4 shrink-0" />
          )}
          <span className="text-[11px] font-bold tracking-wider uppercase">
            {locale}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-[150px]">
        {routing.locales.map((cur) => {
          const Flag = flags[cur as "en" | "vi"];
          const isSelected = locale === cur;
          return (
            <DropdownMenuItem
              key={cur}
              onClick={() => onSelectChange(cur)}
              className="flex cursor-pointer items-center gap-2.5 py-2 text-xs font-medium"
            >
              {Flag && (
                <Flag title={cur} className="size-4 shrink-0 rounded-xs" />
              )}
              <span>{t(cur as "en" | "vi")}</span>
              {isSelected && (
                <Check
                  className="text-primary ms-auto size-3.5"
                  aria-hidden="true"
                />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LanguageSwitcher;
