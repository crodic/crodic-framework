"use client";

import React from "react";
import { ShieldCheck, AlertCircle, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface TagSafetyBadgeProps {
  safetyRating?: "safe" | "sensitive" | "r18" | "r18g" | string;
  className?: string;
  showIcon?: boolean;
}

const SAFETY_CONFIG: Record<
  string,
  {
    badge: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  safe: {
    badge:
      "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300",
    icon: ShieldCheck,
  },
  sensitive: {
    badge:
      "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300",
    icon: AlertCircle,
  },
  r18: {
    badge:
      "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300",
    icon: ShieldAlert,
  },
  r18g: {
    badge:
      "border-red-600/30 bg-red-600/15 text-red-800 dark:border-red-500/40 dark:bg-red-950/60 dark:text-red-200 font-bold",
    icon: ShieldAlert,
  },
};

const DEFAULT_SAFETY_STYLE = {
  badge:
    "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300",
  icon: ShieldCheck,
};

export function TagSafetyBadge({
  safetyRating = "safe",
  className,
  showIcon = true,
}: TagSafetyBadgeProps) {
  const t = useTranslations("Tags.safety");
  const normalizedKey = safetyRating.toLowerCase();
  const config = SAFETY_CONFIG[normalizedKey] ?? DEFAULT_SAFETY_STYLE;
  const Icon = config.icon;

  const label = (() => {
    switch (normalizedKey) {
      case "sensitive":
        return t("sensitive");
      case "r18":
        return t("r18");
      case "r18g":
        return t("r18g");
      default:
        return t("safe");
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
