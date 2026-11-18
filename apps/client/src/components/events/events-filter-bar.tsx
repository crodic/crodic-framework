"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export interface EventsFilterBarProps {
  selectedTagId: string;
  onSelectTag: (tagId: string) => void;
}

const FILTER_ITEMS = [
  { id: "all", labelKey: "filterAll" },
  { id: "festival", labelKey: "filterFestival" },
  { id: "photoshoot", labelKey: "filterPhotoshoot" },
  { id: "contest", labelKey: "filterContest" },
  { id: "workshop", labelKey: "filterWorkshop" },
] as const;

export function EventsFilterBar({
  selectedTagId,
  onSelectTag,
}: EventsFilterBarProps) {
  const t = useTranslations("Events");

  return (
    <div className="relative w-full">
      <div className="flex [scrollbar-width:none] scrollbar-none items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] sm:pb-0">
        {FILTER_ITEMS.map((item) => {
          const isSelected = selectedTagId === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTag(item.id)}
              className={cn(
                "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all sm:text-sm",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-primary/25 scale-[1.02] shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border-border/50 border"
              )}
            >
              {t(item.labelKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
