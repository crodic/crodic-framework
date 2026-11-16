"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { JobFilterId, JobFilterTag } from "./jobs-types";

export interface JobsFilterBarProps {
  selectedTagId: JobFilterId;
  onSelectTag: (tagId: JobFilterId) => void;
}

export function JobsFilterBar({
  selectedTagId,
  onSelectTag,
}: JobsFilterBarProps) {
  const t = useTranslations("Jobs.filter");

  const filterTags: JobFilterTag[] = [
    { id: "all", label: t("all") },
    { id: "lookbook", label: t("lookbook") },
    { id: "event", label: t("event") },
    { id: "crafting", label: t("crafting") },
    { id: "game_ads", label: t("game_ads") },
    { id: "hcm", label: t("hcm") },
    { id: "hanoi", label: t("hanoi") },
  ];

  return (
    <div className="relative w-full">
      <div className="flex [scrollbar-width:none] scrollbar-none items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] sm:pb-0">
        {filterTags.map((tag) => {
          const isSelected = selectedTagId === tag.id;

          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => onSelectTag(tag.id)}
              className={cn(
                "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full px-4 py-1.5 text-xs font-semibold transition-all sm:text-sm",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-primary/30 scale-[1.02] shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border-border/50 border"
              )}
            >
              {tag.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
