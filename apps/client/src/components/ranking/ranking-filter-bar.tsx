"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { RankingTimeFilter } from "./ranking-types";

export interface RankingFilterBarProps {
  selectedFilter: RankingTimeFilter;
  onSelectFilter: (filter: RankingTimeFilter) => void;
}

const FILTER_TABS: Array<{
  id: RankingTimeFilter;
  labelKey: "week" | "month" | "all" | "projects" | "crafting";
}> = [
  { id: "week", labelKey: "week" },
  { id: "month", labelKey: "month" },
  { id: "all", labelKey: "all" },
  { id: "projects", labelKey: "projects" },
  { id: "crafting", labelKey: "crafting" },
];

export function RankingFilterBar({
  selectedFilter,
  onSelectFilter,
}: RankingFilterBarProps) {
  const t = useTranslations("Ranking.filter");

  return (
    <div className="flex flex-wrap gap-2">
      {FILTER_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onSelectFilter(tab.id)}
          aria-pressed={selectedFilter === tab.id}
          className="filter-button"
        >
          {t(tab.labelKey)}
        </button>
      ))}
    </div>
  );
}
