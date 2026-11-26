"use client";

import React from "react";
import { useTranslations } from "next-intl";

export interface EventsFilterBarProps {
  categories: string[];
  selectedTagId: string;
  onSelectTag: (tagId: string) => void;
}

export function EventsFilterBar({
  categories,
  selectedTagId,
  onSelectTag,
}: EventsFilterBarProps) {
  const t = useTranslations("Events");

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onSelectTag("all")}
        aria-pressed={selectedTagId === "all"}
        className="filter-button"
      >
        {t("filterAll")}
      </button>
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onSelectTag(category)}
          aria-pressed={selectedTagId.toLowerCase() === category.toLowerCase()}
          className="filter-button"
        >
          {category}
        </button>
      ))}
    </div>
  );
}
