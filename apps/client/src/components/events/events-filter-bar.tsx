"use client";

import React from "react";
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
    <div className="flex flex-wrap gap-2">
      {FILTER_ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelectTag(item.id)}
          aria-pressed={selectedTagId === item.id}
          className="filter-button"
        >
          {t(item.labelKey)}
        </button>
      ))}
    </div>
  );
}
