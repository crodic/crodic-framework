"use client";

import React from "react";
import { Users } from "lucide-react";
import { CreatePostCard } from "./create-post-card";
import { TrendingTagsBar } from "./trending-tags-bar";
import { FeedPostCard } from "./feed-post-card";
import { SuggestedCosplayersWidget } from "./suggested-cosplayers-widget";
import { UpcomingEventsWidget } from "./upcoming-events-widget";
import { MOCK_FEED_POSTS } from "./feed-data";

export function FeedView() {
  return (
    <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 items-start gap-6 lg:gap-8 xl:grid-cols-12">
        {/* ======================================================== */}
        {/* CENTER FEED COLUMN (Left, ~58-66% on desktop)           */}
        {/* ======================================================== */}
        <div className="space-y-5 xl:col-span-7 2xl:col-span-8">
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
        {/* RIGHT SIDEBAR WIDGETS COLUMN (Desktop only, ~34-42%)    */}
        {/* ======================================================== */}
        <aside className="hidden space-y-5 lg:sticky lg:top-4 lg:flex lg:flex-col xl:col-span-5 2xl:col-span-4">
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
