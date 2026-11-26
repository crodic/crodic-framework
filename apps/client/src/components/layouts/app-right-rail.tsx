"use client";

import React from "react";
import { SuggestedCosplayersWidget } from "@/components/feed/suggested-cosplayers-widget";
import { UpcomingEventsWidget } from "@/components/feed/upcoming-events-widget";
import { TrendingTagsWidget } from "./trending-tags-widget";
import { useTranslations } from "next-intl";

export function AppRightRail() {
  const tCommon = useTranslations("Common");

  return (
    <div className="space-y-4">
      {/* 1. Cosplayer gợi ý với 1-click Follow */}
      <SuggestedCosplayersWidget />

      {/* 2. Sự kiện sắp diễn ra */}
      <UpcomingEventsWidget />

      {/* 3. Thẻ thịnh hành (Fandom/Character) */}
      <TrendingTagsWidget />

      {/* Mini Footer */}
      <div className="text-muted-foreground px-1 text-xs leading-relaxed">
        <p>{tCommon("copyright", { year: "2026" })}</p>
      </div>
    </div>
  );
}
