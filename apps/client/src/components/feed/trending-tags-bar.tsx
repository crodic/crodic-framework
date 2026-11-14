"use client";

import React from "react";
import { Flame } from "lucide-react";
import { MOCK_TRENDING_TAGS } from "./feed-data";

export function TrendingTagsBar() {
  return (
    <div className="space-y-2">
      <div className="text-foreground flex items-center gap-1.5 text-xs font-bold">
        <span>Thẻ xu hướng</span>
        <Flame className="size-3.5 fill-amber-500 text-amber-500" />
      </div>

      <div className="flex scrollbar-none items-center gap-2 overflow-x-auto pb-1">
        {MOCK_TRENDING_TAGS.map((tag) => (
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
