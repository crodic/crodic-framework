"use client";

import React from "react";
import { Hash, User, Film, Palette, Info, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface TagCategoryBadgeProps {
  category?: string;
  className?: string;
  showIcon?: boolean;
}

const CATEGORY_CONFIG: Record<
  string,
  {
    badge: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  general: {
    badge:
      "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-300",
    icon: Hash,
  },
  copyright: {
    badge:
      "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/15 dark:text-violet-300",
    icon: Film,
  },
  character: {
    badge:
      "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300",
    icon: User,
  },
  artist: {
    badge:
      "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300",
    icon: Palette,
  },
  meta: {
    badge:
      "border-indigo-500/25 bg-indigo-500/10 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-300",
    icon: Info,
  },
  system: {
    badge:
      "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300",
    icon: ShieldAlert,
  },
};

const DEFAULT_CATEGORY_STYLE = {
  badge:
    "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-300",
  icon: Hash,
};

export function TagCategoryBadge({
  category = "general",
  className,
  showIcon = true,
}: TagCategoryBadgeProps) {
  const t = useTranslations("Tags.category");
  const normalizedKey = category.toLowerCase();
  const config = CATEGORY_CONFIG[normalizedKey] ?? DEFAULT_CATEGORY_STYLE;
  const Icon = config.icon;

  const label = (() => {
    switch (normalizedKey) {
      case "character":
        return t("character");
      case "copyright":
        return t("copyright");
      case "artist":
        return t("artist");
      case "meta":
        return t("meta");
      case "system":
        return t("system");
      default:
        return t("general");
    }
  })();

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap shadow-2xs transition-colors",
        config.badge,
        className
      )}
    >
      {showIcon && <Icon className="size-3 shrink-0 opacity-80" />}
      <span>{label}</span>
    </Badge>
  );
}
