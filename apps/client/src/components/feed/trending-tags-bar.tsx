"use client";

import React from "react";
import { Flame } from "lucide-react";
import { useTranslations } from "next-intl";

const POPULAR_TAGS = [
  { name: "HonkaiStarRail", count: "12.4K", isHot: true },
  { name: "GenshinImpact", count: "28.5K", isHot: true },
  { name: "Acheron", count: "8.2K", isHot: true },
  { name: "Cyberpunk2077", count: "5.1K" },
  { name: "CosplayFestival", count: "14.2K", isHot: true },
  { name: "PropCrafting", count: "3.8K" },
];

export function TrendingTagsBar() {
  const t = useTranslations("Feed");

  return (
    <div className="space-y-2">
      <div className="text-foreground flex items-center gap-1.5 text-xs font-bold">
        <span>{t("trendingTags")}</span>
        <Flame className="size-3.5 fill-amber-500 text-amber-500" />
      </div>

      <div className="flex scrollbar-none items-center gap-2 overflow-x-auto pb-1">
        {POPULAR_TAGS.map((tag) => (
          <button
            key={tag.name}
            type="button"
            className="border-border/70 bg-card/60 hover:bg-primary/15 hover:border-primary/40 hover:text-primary text-muted-foreground inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors select-none"
          >
            <span>#{tag.name}</span>
            {tag.count && (
              <span className="text-muted-foreground/80 text-[10px]">
                {tag.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
