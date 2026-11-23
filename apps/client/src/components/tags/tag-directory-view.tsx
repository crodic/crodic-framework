"use client";

import React, { useState, useTransition, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import {
  Flame,
  Search,
  SearchX,
  Tags,
  X,
  Film,
  User,
  Palette,
  Hash,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getTags,
  getTrendingTags,
  type TagSummaryResDto,
} from "@/services/tags";
import { TagCard } from "./tag-card";
import { cn } from "@/lib/utils";

export function TagDirectoryView() {
  const t = useTranslations("Tags");
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  // Fetch trending tags for the top bar
  const { data: trendingTags = [] } = useQuery<TagSummaryResDto[]>({
    queryKey: ["tags-trending-list", locale],
    queryFn: () => getTrendingTags(12, locale),
    staleTime: 60 * 1000,
  });

  // Fetch tags for directory grid
  const { data: tagsResponse, isLoading } = useQuery({
    queryKey: ["tags-directory", searchQuery, activeCategory, locale],
    queryFn: () =>
      getTags({
        search: searchQuery || undefined,
        category: activeCategory !== "all" ? activeCategory : undefined,
        sort: "-usageCount",
        limit: 36,
      }),
    staleTime: 30 * 1000,
  });

  const tags: TagSummaryResDto[] = tagsResponse?.data || [];

  const categories = [
    { id: "all", label: t("allCategories"), icon: Tags },
    { id: "character", label: t("category.character"), icon: User },
    { id: "copyright", label: t("category.copyright"), icon: Film },
    { id: "artist", label: t("category.artist"), icon: Palette },
    { id: "general", label: t("category.general"), icon: Hash },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Page Header & Hero Search */}
      <div className="border-border/70 bg-card/60 relative space-y-4 overflow-hidden rounded-3xl border p-6 text-center shadow-xs backdrop-blur-xs sm:p-10">
        <div className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold">
          <Tags className="size-3.5" />
          <span>Folksonomy & Community Wiki</span>
        </div>

        <div className="mx-auto max-w-2xl space-y-2">
          <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-4xl">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
            {t("subtitle")}
          </p>
        </div>

        {/* Search Bar with Clear Button */}
        <div className="mx-auto max-w-xl pt-2">
          <div className="relative flex items-center">
            <Search className="text-muted-foreground pointer-events-none absolute left-3.5 size-4" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                startTransition(() => {
                  setSearchQuery(val);
                });
              }}
              placeholder={t("searchPlaceholder")}
              className="bg-background/80 h-11 rounded-2xl pr-9 pl-10 text-xs shadow-2xs sm:text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-muted-foreground hover:text-foreground absolute right-3 cursor-pointer rounded p-0.5"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* Trending Tags Row */}
        {trendingTags.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold">
              <Flame className="size-3.5 fill-amber-500 text-amber-500" />
              <span>{t("trendingTitle")}:</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {trendingTags.slice(0, 8).map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setSearchQuery(tag.name)}
                  className="bg-background/60 border-border/70 hover:border-primary/40 hover:text-primary text-muted-foreground inline-flex cursor-pointer items-center gap-1 rounded-xl border px-2.5 py-1 text-xs font-medium transition-colors select-none"
                >
                  <span className="text-primary/70 font-bold">#</span>
                  <span>{tag.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Category Filter Tabs */}
      <div className="flex [scrollbar-width:none] items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-2xl px-4 py-2 text-xs font-semibold transition-all select-none",
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/50 border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted border"
              )}
            >
              <Icon className="size-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Grid of Tag Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="border-border/70 bg-card space-y-3 rounded-2xl border p-4"
            >
              <Skeleton className="aspect-[16/9] w-full rounded-xl" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : tags.length === 0 ? (
        <div className="border-border/70 text-muted-foreground flex flex-col items-center justify-center space-y-3 rounded-3xl border border-dashed p-12 text-center">
          <div className="bg-muted/60 text-muted-foreground flex size-14 items-center justify-center rounded-2xl">
            <SearchX className="size-7" />
          </div>
          <div className="max-w-sm space-y-1">
            <h3 className="text-foreground text-base font-bold">
              {t("noTagsFound")}
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {t("noTagsFoundDesc")}
            </p>
          </div>
          {searchQuery && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="mt-2 text-xs"
            >
              Xóa bộ lọc tìm kiếm
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tags.map((tag) => (
            <TagCard key={tag.id} tag={tag} />
          ))}
        </div>
      )}
    </div>
  );
}
