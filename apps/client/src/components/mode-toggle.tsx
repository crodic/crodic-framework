"use client";

import { useEffect, useState } from "react";
import { Check, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function ModeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("Theme");

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={t("toggleTheme")}
          className={cn("size-9 shrink-0", className)}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">{t("toggleTheme")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="cursor-pointer"
        >
          <span>{t("light")}</span>
          {mounted && theme === "light" && (
            <Check className="ms-auto size-4" aria-hidden="true" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="cursor-pointer"
        >
          <span>{t("dark")}</span>
          {mounted && theme === "dark" && (
            <Check className="ms-auto size-4" aria-hidden="true" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
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
