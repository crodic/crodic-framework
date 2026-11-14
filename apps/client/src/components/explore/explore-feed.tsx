"use client";

import React, { useState } from "react";
import { EXPLORE_ITEMS, EXPLORE_TAGS } from "./explore-data";
import { ExploreCard } from "./explore-card";
import { cn } from "@/lib/utils";

export function ExploreFeed() {
  const [selectedTag, setSelectedTag] = useState<string>("all");

  const filteredItems =
    selectedTag === "all"
      ? EXPLORE_ITEMS
      : EXPLORE_ITEMS.filter((item) => item.tag === selectedTag);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Trending Tags Section ("Thẻ xu hướng 🔥") */}
      <section className="space-y-3">
        <div className="flex items-center gap-1.5">
          <h2 className="text-foreground flex items-center gap-1.5 text-base font-bold tracking-tight sm:text-lg">
            <span>Thẻ xu hướng</span>
            <span role="img" aria-label="Xu hướng">
              🔥
            </span>
          </h2>
        </div>

        {/* Tags Bar */}
        <div className="flex scrollbar-none items-center gap-2 overflow-x-auto pb-1">
          {EXPLORE_TAGS.map((tag) => {
            const isActive = selectedTag === tag.id;

            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => setSelectedTag(tag.id)}
                className={cn(
                  "cursor-pointer rounded-full px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-all select-none sm:text-sm",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-primary/25 font-semibold shadow-xs"
                    : "bg-card/80 border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted border"
                )}
              >
                {tag.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Explore Grid (4 cols on desktop, 2 cols on mobile) */}
      <section>
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {filteredItems.map((item) => (
            <ExploreCard key={item.id} item={item} />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-muted-foreground py-12 text-center text-sm">
            Không có tác phẩm nào phù hợp với thẻ này.
          </div>
        )}
      </section>
    </div>
  );
}
