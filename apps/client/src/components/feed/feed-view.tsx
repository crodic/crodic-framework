"use client";

import React from "react";
import { Sparkles, Users } from "lucide-react";
import { CreatePostCard } from "./create-post-card";
import { TrendingTagsBar } from "./trending-tags-bar";
import { FeedPostCard } from "./feed-post-card";
import { SuggestedCosplayersWidget } from "./suggested-cosplayers-widget";
import { UpcomingEventsWidget } from "./upcoming-events-widget";
import { MOCK_FEED_POSTS } from "./feed-data";

export function FeedView() {
  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* ======================================================== */}
        {/* CENTER FEED COLUMN (Left, ~68%)                         */}
        {/* ======================================================== */}
        <div className="w-full flex-1 space-y-5 lg:max-w-2xl xl:max-w-3xl">
          {/* 1. Create Post Status Box */}
          <CreatePostCard />

          {/* 2. Trending Tags Bar (Mobile & Desktop) */}
          <TrendingTagsBar />

          {/* 3. Section Title: Hoạt động gần đây */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <div className="bg-primary/20 text-primary flex size-7 items-center justify-center rounded-lg">
                <Users className="size-4" />
              </div>
              <h2 className="text-foreground text-base font-bold sm:text-lg">
                Hoạt động gần đây
              </h2>
            </div>
            <span className="text-muted-foreground text-xs">
              Từ người bạn đang theo dõi
            </span>
          </div>

          {/* 4. List of Feed Post Cards */}
          <div className="space-y-4 sm:space-y-5">
            {MOCK_FEED_POSTS.map((post) => (
              <FeedPostCard key={post.id} post={post} />
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT SIDEBAR WIDGETS COLUMN (Desktop only, ~32%)       */}
        {/* ======================================================== */}
        <aside className="hidden w-80 shrink-0 flex-col space-y-5 lg:sticky lg:top-20 lg:flex xl:w-88">
          {/* Widget 1: Gợi ý theo dõi */}
          <SuggestedCosplayersWidget />

          {/* Widget 2: Sự kiện sắp diễn ra */}
          <UpcomingEventsWidget />

          {/* Mini Footer / Disclaimer */}
          <div className="text-muted-foreground/60 px-2 text-[11px] leading-relaxed">
            <p>
              © 2026 CosSpace Platform. Dành riêng cho cộng đồng cosplay & nghệ
              thuật số.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
