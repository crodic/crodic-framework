"use client";

import { Check, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";

import { useThemeTransition } from "@/components/transitions/theme-transition";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function ModeToggle({ className }: { className?: string }) {
  const { mounted, theme, setTheme } = useThemeTransition();
  const t = useTranslations("Theme");

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={t("toggleTheme")}
          className={cn(
            "text-muted-foreground hover:text-foreground size-10 shrink-0 rounded-lg shadow-none",
            className
          )}
        >
          <Sun className="size-4 scale-100 rotate-0 motion-safe:transition-transform dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute size-4 scale-0 rotate-90 motion-safe:transition-transform dark:scale-100 dark:rotate-0" />
          <span className="sr-only">{t("toggleTheme")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onSelect={() => setTheme("light")}
          className="cursor-pointer"
        >
          <span>{t("light")}</span>
          {mounted && theme === "light" && (
            <Check className="ms-auto size-4" aria-hidden="true" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => setTheme("dark")}
          className="cursor-pointer"
        >
          <span>{t("dark")}</span>
          {mounted && theme === "dark" && (
            <Check className="ms-auto size-4" aria-hidden="true" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => setTheme("system")}
          className="cursor-pointer"
        >
          <span>{t("system")}</span>
          {mounted && theme === "system" && (
            <Check className="ms-auto size-4" aria-hidden="true" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
