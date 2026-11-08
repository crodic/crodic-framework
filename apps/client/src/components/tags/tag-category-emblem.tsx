import React from "react";
import {
  Clapperboard,
  Layers,
  Paintbrush,
  ShieldCheck,
  Tag as TagIcon,
  User,
} from "lucide-react";
import type { TagCategory } from "@/services/tags";

const CATEGORY_ICONS: Record<
  TagCategory,
  React.ComponentType<{
    className?: string;
    "aria-hidden"?: boolean | "true" | "false";
  }>
> = {
  character: User,
  copyright: Clapperboard,
  artist: Paintbrush,
  meta: Layers,
  system: ShieldCheck,
  general: TagIcon,
};

const CATEGORY_ICON_COLORS: Record<TagCategory, string> = {
  character: "text-emerald-600 dark:text-emerald-400",
  copyright: "text-violet-600 dark:text-violet-400",
  artist: "text-amber-600 dark:text-amber-400",
  meta: "text-blue-600 dark:text-blue-400",
  system: "text-rose-600 dark:text-rose-400",
  general: "text-sky-600 dark:text-sky-400",
};

export function TagCategoryEmblem({
  category,
  className = "size-6",
}: {
  category?: string | null;
  className?: string;
}) {
  const cat =
    category && category in CATEGORY_ICONS
      ? (category as TagCategory)
      : "general";
  const Icon = CATEGORY_ICONS[cat];
  const color = CATEGORY_ICON_COLORS[cat];

  return <Icon className={`${className} ${color}`} aria-hidden="true" />;
}
