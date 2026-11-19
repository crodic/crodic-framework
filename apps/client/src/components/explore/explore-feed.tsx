"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Check, Flame, Loader2, Search, SearchX, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExploreCard } from "./explore-card";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getPosts, type PostSummaryResDto } from "@/services/posts";
import { useAuthStore } from "@/store/use-auth-store";
import {
  getCosplayers,
  type CosplayerSummaryResDto,
} from "@/services/cosplayer";

const EXPLORE_TAGS = [
  { id: "all", label: "All" },
  { id: "honkai", label: "Honkai: Star Rail" },
  { id: "genshin", label: "Genshin Impact" },
  { id: "wuthering", label: "Wuthering Waves" },
  { id: "cyberpunk", label: "Cyberpunk 2077" },
  { id: "frieren", label: "Frieren" },
];

export function ExploreFeed() {
  const t = useTranslations("Explore");
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [activeTab, setActiveTab] = useState<
    "all" | "works" | "cosplayers" | "characters"
  >("all");
  const [selectedTag, setSelectedTag] = useState("all");

  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedTag("all");
    router.replace("/explore");
  };

  const isHydrating = useAuthStore((state) => state.isHydrating);

  const { data: postsResponse, isLoading: isLoadingPosts } = useQuery({
    queryKey: ["explore-posts", searchQuery],
    queryFn: () => getPosts({ search: searchQuery || undefined, limit: 50 }),
    enabled: !isHydrating,
  });

  const { data: cosplayersResponse, isLoading: isLoadingCosplayers } = useQuery(
    {
      queryKey: ["explore-cosplayers", searchQuery],
      queryFn: () =>
        getCosplayers({ search: searchQuery || undefined, limit: 20 }),
    }
  );

  const posts: PostSummaryResDto[] = useMemo(() => {
    return postsResponse?.data || [];
  }, [postsResponse]);

  const filteredItems = useMemo(() => {
    if (selectedTag === "all") return posts;
    const lower = selectedTag.toLowerCase();
    return posts.filter(
      (item) =>
        item.tagNamesCache?.some((t) => t.toLowerCase().includes(lower)) ||
        item.albumCategory?.toLowerCase().includes(lower) ||
        item.title.toLowerCase().includes(lower) ||
        item.characterName?.toLowerCase().includes(lower)
    );
  }, [selectedTag, posts]);

  const cosplayers: CosplayerSummaryResDto[] = cosplayersResponse?.data || [];

  const filterTabs = [
    { id: "all" as const, label: t("tabs.all") },
    { id: "works" as const, label: t("tabs.works") },
    { id: "cosplayers" as const, label: t("tabs.cosplayers") },
    { id: "characters" as const, label: t("tabs.characters") },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. CATEGORY TABS & TRENDING TAGS */}
      <div className="space-y-4">
        {/* Category Tabs */}
        <div className="border-border/60 flex scrollbar-none items-center gap-2 overflow-x-auto border-b pb-2">
          {filterTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all select-none sm:text-sm",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Trending Tags Section */}
        <div className="flex scrollbar-none items-center gap-2 overflow-x-auto pb-1">
          <div className="text-muted-foreground mr-1 flex items-center gap-1.5 text-xs font-bold uppercase select-none">
            <Flame className="size-3.5 fill-rose-500 text-rose-500" />
            <span className="hidden sm:inline">{t("trendingFandoms")}:</span>
          </div>

          {EXPLORE_TAGS.map((tag) => {
            const isSelected = selectedTag === tag.id;
            const label = tag.id === "all" ? t("all") : tag.label;
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => setSelectedTag(tag.id)}
                className={cn(
                  "cursor-pointer rounded-full px-3.5 py-1 text-xs font-semibold whitespace-nowrap transition-all select-none",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted border-border/40 border"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Search Result Announcement Banner */}
      {searchQuery && (
        <div className="border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-xs">
          <div className="flex items-center gap-2">
            <Search className="text-primary size-4" />
            <span>
              {t("searchResultsFor", {
                query: searchQuery,
                count: filteredItems.length,
              })}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClearSearch}
            className="text-primary cursor-pointer font-semibold hover:underline"
          >
            {t("clearSearch")}
          </button>
        </div>
      )}

      {/* 2. MATCHING COSPLAYERS STRIP */}
      {(activeTab === "cosplayers" ||
        (searchQuery && cosplayers.length > 0)) && (
        <section className="space-y-3">
          <div className="text-foreground flex items-center gap-2 text-sm font-bold">
            <Users className="text-primary size-4" />
            <span>{t("featuredCosplayers")}</span>
          </div>

          {isLoadingCosplayers ? (
            <div className="flex min-h-[100px] items-center justify-center">
              <Loader2 className="text-primary size-6 animate-spin" />
            </div>
          ) : cosplayers.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {cosplayers.map((cosplayer) => (
                <Link
                  key={cosplayer.id}
                  href={`/cosplayer/${cosplayer.slug || cosplayer.id}`}
                  className="border-border/70 bg-card/60 hover:border-primary/50 group flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors"
                >
                  <div className="border-border/70 relative size-10 shrink-0 overflow-hidden rounded-full border">
                    {cosplayer.avatarUrl ? (
                      <Image
                        src={cosplayer.avatarUrl}
                        alt={cosplayer.displayName}
                        fill
                        sizes="40px"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="bg-primary/20 text-primary flex size-full items-center justify-center font-bold">
                        {cosplayer.displayName.slice(0, 1)}
                      </div>
                    )}
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1">
                      <span className="text-foreground group-hover:text-primary truncate text-xs font-bold transition-colors">
                        {cosplayer.displayName}
                      </span>
                      {cosplayer.isVerified && (
                        <span className="bg-primary/20 text-primary flex size-3 shrink-0 items-center justify-center rounded-full">
                          <Check className="size-2 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <span className="text-muted-foreground text-[10px]">
                      {cosplayer.handle}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-xs">{t("noResults")}</p>
          )}
        </section>
      )}

      {/* 3. MAIN EXPLORE GRID */}
      {activeTab !== "cosplayers" && (
        <section>
          {isLoadingPosts ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <Loader2 className="text-primary size-8 animate-spin" />
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {filteredItems.map((item) => (
                <ExploreCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="border-border/70 bg-card/40 flex flex-col items-center justify-center rounded-2xl border p-12 text-center">
              <div className="bg-muted/60 text-muted-foreground mb-3 flex size-12 items-center justify-center rounded-full">
                <SearchX className="size-6" />
              </div>
              <h3 className="text-foreground text-base font-bold">
                {t("noResults")}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSearch}
                className="mt-4 cursor-pointer rounded-xl text-xs font-semibold"
              >
                {t("clearSearch")}
              </Button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
