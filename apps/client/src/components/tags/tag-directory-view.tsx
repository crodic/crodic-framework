"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
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
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion-primitives";
import { PaginationWithLinks } from "@/components/features/pagination-with-links";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 24;

export function TagDirectoryView() {
  const t = useTranslations("Tags");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const directoryTopRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Read current page from URL query params (default: 1)
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);

  // Debounce search query to prevent high API frequency
  const debouncedSearch = useDebounce(searchQuery.trim(), 400);

  // Categories list
  const categories = [
    { id: "all", label: t("allCategories"), icon: Tags },
    { id: "character", label: t("category.character"), icon: User },
    { id: "copyright", label: t("category.copyright"), icon: Film },
    { id: "artist", label: t("category.artist"), icon: Palette },
    { id: "general", label: t("category.general"), icon: Hash },
  ];

  // Fetch trending tags for the top bar
  const { data: trendingTags = [] } = useQuery<TagSummaryResDto[]>({
    queryKey: ["tags-trending-list", locale],
    queryFn: () => getTrendingTags(12, locale),
    staleTime: 60 * 1000,
  });

  // Fetch tags for directory grid with pagination
  const { data: tagsResponse, isLoading } = useQuery({
    queryKey: [
      "tags-directory",
      debouncedSearch,
      activeCategory,
      currentPage,
      locale,
    ],
    queryFn: () =>
      getTags({
        search: debouncedSearch || undefined,
        category: activeCategory !== "all" ? activeCategory : undefined,
        sort: "-usageCount",
        page: currentPage,
        limit: PAGE_SIZE,
      }),
    staleTime: 30 * 1000,
  });

  const tags: TagSummaryResDto[] = tagsResponse?.data || [];
  const totalItems = tagsResponse?.meta?.totalItems ?? tags.length;

  return (
    <div ref={directoryTopRef} className="space-y-8">
      {/* 1. Page Header & Hero Search with Landing Cosplay Background */}
      <div className="border-border/70 bg-card/70 relative space-y-4 overflow-hidden rounded-3xl border p-6 text-center shadow-md backdrop-blur-md sm:p-10">
        {/* Landing Hero Background Image with Atmospheric Overlays */}
        <div
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
          aria-hidden="true"
        >
          <Image
            src="/landing/hero-banner.png"
            alt="Tags Hero Background"
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1200px"
            className="object-cover object-[center_35%] opacity-35 dark:opacity-25"
          />
          {/* Subtle gradient fades into the card theme */}
          <div className="from-card/95 via-card/85 to-card/75 absolute inset-0 bg-gradient-to-t" />
          <div className="from-card to-card absolute inset-0 bg-gradient-to-r via-transparent opacity-90" />
          <div className="from-primary/10 to-primary/5 absolute inset-0 bg-radial via-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 space-y-4">
          <div className="mx-auto max-w-2xl space-y-2">
            <h1 className="text-foreground text-2xl font-black tracking-tight text-balance sm:text-4xl">
              {t("title")}
            </h1>
            <p className="text-muted-foreground text-xs leading-relaxed text-pretty sm:text-sm">
              {t("subtitle")}
            </p>
          </div>

          {/* Search Bar with Clear Button */}
          <div className="mx-auto max-w-xl pt-2">
            <div className="relative flex items-center">
              <Search className="text-muted-foreground pointer-events-none absolute left-3.5 size-4" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="bg-background/90 border-border/80 focus:border-primary/70 h-11 rounded-2xl pr-9 pl-10 text-xs shadow-xs backdrop-blur-md transition-all sm:text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-muted-foreground hover:text-foreground absolute right-3 cursor-pointer rounded p-0.5 transition-colors"
                  aria-label="Clear search"
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
                    className="bg-background/70 border-border/70 hover:border-primary/40 hover:text-primary text-muted-foreground inline-flex cursor-pointer items-center gap-1 rounded-xl border px-2.5 py-1 text-xs font-medium backdrop-blur-xs transition-colors select-none"
                  >
                    <span className="text-primary/70 font-bold">#</span>
                    <span>{tag.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
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

      {/* 3. Grid of Tag Cards (3 columns on larger screens) */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
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
          {(searchQuery || activeCategory !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
              className="mt-2 text-xs"
            >
              {t("clearFilters")}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tags.map((tag) => (
              <StaggerItem key={tag.id}>
                <TagCard tag={tag} />
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* 4. Pagination via shadcn-next-link-pagination (PaginationWithLinks) */}
          {totalItems > PAGE_SIZE && (
            <div className="border-border/60 border-t pt-4">
              <PaginationWithLinks
                page={currentPage}
                pageSize={PAGE_SIZE}
                totalCount={totalItems}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
