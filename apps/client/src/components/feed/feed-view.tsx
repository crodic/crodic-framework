"use client";

import React, { useMemo } from "react";
import { Compass, Loader2, LogIn, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { CreatePostCard } from "./create-post-card";
import { TrendingTagsBar } from "./trending-tags-bar";
import { FeedPostCard } from "./feed-post-card";
import { SuggestedCosplayersWidget } from "./suggested-cosplayers-widget";
import { UpcomingEventsWidget } from "./upcoming-events-widget";
import { getFollowingFeed, type PostSummaryResDto } from "@/services/posts";
import { useAuthStore } from "@/store/use-auth-store";

export function FeedView() {
  const t = useTranslations("Feed");
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrating = useAuthStore((state) => state.isHydrating);

  const { data: postsResponse, isLoading } = useQuery({
    queryKey: ["following-feed-posts", isAuthenticated],
    queryFn: () => getFollowingFeed({ limit: 30 }),
    enabled: !isHydrating && isAuthenticated,
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
            <div className="border-border/70 bg-card/50 flex flex-col items-center justify-center rounded-2xl border border-dashed p-8 py-16 text-center">
              <div className="bg-muted/80 text-muted-foreground flex size-14 items-center justify-center rounded-2xl">
                {!isAuthenticated ? (
                  <LogIn className="size-7" />
                ) : (
                  <Users className="size-7" />
                )}
              </div>
              <h3 className="text-foreground mt-4 text-sm font-bold sm:text-base">
                {!isAuthenticated
                  ? t("emptyFeedGuestTitle") || "Sign in to view your feed"
                  : t("emptyFeedAuthTitle") || "Your feed is waiting for you"}
              </h3>
              <p className="text-muted-foreground mt-1.5 max-w-sm text-xs leading-relaxed">
                {!isAuthenticated
                  ? t("emptyFeedGuestDesc") ||
                    "Log in to follow creators and see their latest albums and photosets here."
                  : t("emptyFeedAuthDesc") ||
                    "You haven't followed any creators yet. Follow creators from the suggestions or check out Explore!"}
              </p>
              {!isAuthenticated ? (
                <div className="mt-5 flex items-center gap-3">
                  <Button
                    asChild
                    size="sm"
                    className="rounded-xl px-4 text-xs font-semibold"
                  >
                    <Link href="/auth/login?from=/feed">
                      <LogIn className="mr-1.5 size-3.5" />
                      {t("signInBtn") || "Sign In"}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="rounded-xl px-4 text-xs"
                  >
                    <Link href="/explore">
                      <Compass className="mr-1.5 size-3.5" />
                      {t("exploreBtn") || "Explore Community"}
                    </Link>
                  </Button>
                </div>
              ) : (
                <Button
                  asChild
                  variant="default"
                  size="sm"
                  className="mt-5 rounded-xl px-4 text-xs font-semibold"
                >
                  <Link href="/explore">
                    <Compass className="mr-1.5 size-3.5" />
                    {t("exploreBtn") || "Explore Creators"}
                  </Link>
                </Button>
              )}
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
