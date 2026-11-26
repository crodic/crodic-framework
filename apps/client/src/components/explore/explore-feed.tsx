"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Check, Loader2, Search, SearchX, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListError } from "@/components/common/list-error";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  StaggerContainer,
  StaggerItem,
  HoverLiftCard,
} from "@/components/ui/motion-primitives";
import { ExploreCard } from "./explore-card";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { getPosts, type PostSummaryResDto } from "@/services/posts";
import { getTrendingTags, type TagSummaryResDto } from "@/services/tags";
import { useAuthStore } from "@/store/use-auth-store";
import {
  getCosplayers,
  type CosplayerSummaryResDto,
} from "@/services/cosplayer";

export function ExploreFeed() {
  const t = useTranslations("Explore");
  const tNav = useTranslations("Navigation");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [activeTab, setActiveTab] = useState<
    "all" | "works" | "cosplayers" | "characters"
  >("all");
  const [selectedTag, setSelectedTag] = useState("all");

  const { data: trendingFandoms = [] } = useQuery<TagSummaryResDto[]>({
    queryKey: ["explore-trending-fandoms", locale],
    queryFn: async () => {
      const trending = await getTrendingTags(8, locale);
      return trending.filter((item) => item.usageCount > 0);
    },
    staleTime: 60 * 1000,
  });

  const exploreTags = useMemo(() => {
    const list = [{ id: "all", label: t("all") }];
    trendingFandoms.forEach((item) => {
      list.push({ id: item.slug || String(item.id), label: item.name });
    });
    return list;
  }, [trendingFandoms, t]);

  const selectedTagObj = useMemo(() => {
    if (selectedTag === "all") return null;
    return (
      trendingFandoms.find(
        (t) =>
          t.slug === selectedTag ||
          String(t.id) === selectedTag ||
          t.name.toLowerCase() === selectedTag.toLowerCase()
      ) || null
    );
  }, [selectedTag, trendingFandoms]);

  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedTag("all");
    router.replace("/explore");
  };

  const isHydrating = useAuthStore((state) => state.isHydrating);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const effectiveSearch =
    searchQuery || (selectedTagObj ? selectedTagObj.name : undefined);

  const {
    data: postsResponse,
    isLoading: isLoadingPosts,
    isError: isPostsError,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: ["explore-posts", effectiveSearch, isAuthenticated],
    queryFn: () =>
      getPosts({ search: effectiveSearch || undefined, limit: 50 }),
    enabled: !isHydrating,
  });

  const {
    data: cosplayersResponse,
    isLoading: isLoadingCosplayers,
    isError: isCosplayersError,
    refetch: refetchCosplayers,
  } = useQuery({
    queryKey: ["explore-cosplayers", searchQuery],
    queryFn: () =>
      getCosplayers({ search: searchQuery || undefined, limit: 20 }),
  });

  const posts: PostSummaryResDto[] = useMemo(() => {
    return postsResponse?.data || [];
  }, [postsResponse]);

  const filteredItems = useMemo(() => {
    let result = posts;
    if (activeTab === "characters") {
      result = result.filter((item) => Boolean(item.characterName));
    } else if (activeTab === "works") {
      result = result.filter(
        (item) => item.postType === "photoset" || item.postType === "single"
      );
    }
    if (selectedTag !== "all" && selectedTagObj) {
      const lowerName = selectedTagObj.name.toLowerCase();
      const lowerSlug = (selectedTagObj.slug || "").toLowerCase();
      result = result.filter((item) => {
        const matchesTag = item.tagNamesCache?.some((t) => {
          const l = t.toLowerCase();
          return (
            l === lowerName ||
            (lowerSlug && l === lowerSlug) ||
            l.includes(lowerName)
          );
        });
        const matchesFandom =
          item.fandomName?.toLowerCase().includes(lowerName) ||
          (lowerSlug && item.fandomName?.toLowerCase().includes(lowerSlug));
        const matchesTitle = item.title.toLowerCase().includes(lowerName);
        const matchesChar = item.characterName
          ?.toLowerCase()
          .includes(lowerName);
        return matchesTag || matchesFandom || matchesTitle || matchesChar;
      });
    }
    return result;
  }, [selectedTag, selectedTagObj, activeTab, posts]);

  const cosplayers: CosplayerSummaryResDto[] = cosplayersResponse?.data || [];

  const filterTabs = [
    { id: "all" as const, label: t("tabs.all") },
    { id: "works" as const, label: t("tabs.works") },
    { id: "cosplayers" as const, label: t("tabs.cosplayers") },
    { id: "characters" as const, label: t("tabs.characters") },
  ];

  return (
    <div className="space-y-6">
      <h1 className="page-title">{tNav("explore")}</h1>
      {/* 1. CATEGORY TABS & TRENDING TAGS */}
      <div className="space-y-4">
        {/* Category Tabs */}
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label={tNav("explore")}
        >
          {filterTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-pressed={isActive}
                className="filter-button"
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Trending Fandoms / Tags Section */}
        {exploreTags.length > 1 && (
          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label={t("trendingFandoms")}
          >
            <span className="text-muted-foreground text-sm">
              {t("trendingFandoms")}
            </span>

            {exploreTags.map((tag) => {
              const isSelected = selectedTag === tag.id;
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setSelectedTag(tag.id)}
                  aria-pressed={isSelected}
                  className="filter-button"
                >
                  {tag.label}
                </button>
              );
            })}
          </div>
        )}
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
          ) : isCosplayersError && !cosplayersResponse ? (
            <ListError onRetry={() => void refetchCosplayers()} />
          ) : cosplayers.length > 0 ? (
            <StaggerContainer className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {cosplayers.map((cosplayer) => (
                <StaggerItem key={cosplayer.id}>
                  <HoverLiftCard yOffset={-4}>
                    <Link
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
                            className="object-cover"
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
                  </HoverLiftCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <p className="text-muted-foreground text-xs">{t("noResults")}</p>
          )}
        </section>
      )}

      {/* 3. MAIN EXPLORE GRID */}
      {activeTab !== "cosplayers" && (
        <section>
          {isLoadingPosts ? (
            <div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              role="status"
            >
              <span className="sr-only">{tCommon("loading")}</span>
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton
                  key={index}
                  className="aspect-[4/3] rounded-xl motion-reduce:animate-none"
                />
              ))}
            </div>
          ) : isPostsError && !postsResponse ? (
            <ListError onRetry={() => void refetchPosts()} />
          ) : filteredItems.length > 0 ? (
            <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              {filteredItems.map((item) => (
                <StaggerItem key={item.id}>
                  <ExploreCard item={item} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <Empty className="border-border gap-4 rounded-xl border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchX aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>{t("noResults")}</EmptyTitle>
              </EmptyHeader>
              {(searchQuery ||
                selectedTag !== "all" ||
                activeTab !== "all") && (
                <EmptyContent>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActiveTab("all");
                      handleClearSearch();
                    }}
                  >
                    {t("clearFilter")}
                  </Button>
                </EmptyContent>
              )}
            </Empty>
          )}
        </section>
      )}
    </div>
  );
}
