"use client";

import React, { useMemo } from "react";
import { Loader2, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { CreatePostCard } from "./create-post-card";
import { TrendingTagsBar } from "./trending-tags-bar";
import { FeedPostCard } from "./feed-post-card";
import { SuggestedCosplayersWidget } from "./suggested-cosplayers-widget";
import { UpcomingEventsWidget } from "./upcoming-events-widget";
import { getPosts, type PostSummaryResDto } from "@/services/posts";
import { useAuthStore } from "@/store/use-auth-store";

export function FeedView() {
  const t = useTranslations("Feed");
  const isHydrating = useAuthStore((state) => state.isHydrating);

  const { data: postsResponse, isLoading } = useQuery({
    queryKey: ["public-feed-posts"],
    queryFn: () => getPosts({ limit: 30 }),
    enabled: !isHydrating,
  });

  const posts: PostSummaryResDto[] = useMemo(() => {
    return postsResponse?.data || [];
  }, [postsResponse]);

  return (
    <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 items-start gap-6 lg:gap-8 xl:grid-cols-12">
        {/* CENTER FEED COLUMN */}
        <div className="space-y-5 xl:col-span-7 2xl:col-span-8">
          {/* 1. Create Post Status Box */}
          <CreatePostCard />

          {/* 2. Trending Tags Bar */}
          <TrendingTagsBar />

          {/* 3. Section Title */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <div className="bg-primary/20 text-primary flex size-7 items-center justify-center rounded-lg">
                <Users className="size-4" />
              </div>
              <h2 className="text-foreground text-base font-bold sm:text-lg">
                {t("recentActivity")}
              </h2>
            </div>
            <span className="text-muted-foreground text-xs">
              {t("fromFollowing")}
            </span>
          </div>

          {/* 4. List of Feed Post Cards */}
          {isLoading || isHydrating ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <Loader2 className="text-primary size-8 animate-spin" />
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4 sm:space-y-5">
              {posts.map((post) => (
                <FeedPostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="border-border/70 bg-card/50 flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
              <div className="bg-muted/80 text-muted-foreground flex size-14 items-center justify-center rounded-2xl">
                <Users className="size-7" />
              </div>
              <p className="text-muted-foreground mt-4 text-xs font-medium">
                {t("emptyFeed")}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR WIDGETS COLUMN */}
        <aside className="hidden space-y-5 lg:sticky lg:top-4 lg:flex lg:flex-col xl:col-span-5 2xl:col-span-4">
          {/* Widget 1: Gợi ý theo dõi */}
          <SuggestedCosplayersWidget />

          {/* Widget 2: Sự kiện sắp diễn ra */}
          <UpcomingEventsWidget />

          {/* Mini Footer */}
          <div className="text-muted-foreground/60 px-2 text-[11px] leading-relaxed">
            <p>© 2026 Kosume Platform.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
