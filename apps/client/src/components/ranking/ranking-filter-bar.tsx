"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { RANKING_FILTERS } from "./ranking-data";
import { RankingTimeFilter } from "./ranking-types";

export interface RankingFilterBarProps {
  selectedFilter: RankingTimeFilter;
  onSelectFilter: (filter: RankingTimeFilter) => void;
}

export function RankingFilterBar({
  selectedFilter,
  onSelectFilter,
}: RankingFilterBarProps) {
  return (
    <div className="relative w-full">
      <div className="flex [scrollbar-width:none] scrollbar-none items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] sm:pb-0">
        {RANKING_FILTERS.map((tab) => {
          const isSelected = selectedFilter === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectFilter(tab.id)}
              className={cn(
                "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full px-4 py-1.5 text-xs font-semibold transition-all sm:text-sm",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-primary/30 scale-[1.02] shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border-border/50 border"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
