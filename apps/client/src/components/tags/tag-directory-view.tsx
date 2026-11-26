"use client";

import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Search, SearchX, Tags, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ListError } from "@/components/common/list-error";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getTagCategories,
  getTags,
  getTrendingTags,
  type TagCategoryResDto,
  type TagSummaryResDto,
} from "@/services/tags";
import { TagCard } from "./tag-card";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion-primitives";
import { PaginationWithLinks } from "@/components/features/pagination-with-links";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

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

  // Fetch active categories dynamically from backend
  const { data: tagCategories = [] } = useQuery<TagCategoryResDto[]>({
    queryKey: ["tags-active-categories"],
    queryFn: getTagCategories,
    staleTime: 60 * 1000,
  });

  // Fetch trending tags for the top bar
  const { data: trendingTags = [] } = useQuery<TagSummaryResDto[]>({
    queryKey: ["tags-trending-list", locale],
    queryFn: () => getTrendingTags(12, locale),
    staleTime: 60 * 1000,
  });

  // Fetch tags for directory grid with pagination
  const {
    data: tagsResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
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
    <div ref={directoryTopRef} className="space-y-6">
      <header className="space-y-4">
        <div className="space-y-2">
          <h1 className="page-title">{t("title")}</h1>
          <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        <div className="relative flex max-w-xl items-center">
          <Search
            className="text-muted-foreground pointer-events-none absolute left-3 size-4"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            className="h-11 rounded-lg pr-11 pl-9 [&::-webkit-search-cancel-button]:hidden"
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setSearchQuery("")}
              className="text-muted-foreground absolute right-1.5"
              aria-label={t("clearFilters")}
            >
              <X aria-hidden="true" />
            </Button>
          )}
        </div>

        {trendingTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-sm">
              {t("trendingTitle")}
            </span>
            {trendingTags.slice(0, 8).map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => setSearchQuery(tag.name)}
                className="filter-button"
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}
      </header>

      {tagCategories.length > 0 && (
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label={t("allCategories")}
        >
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            aria-pressed={activeCategory === "all"}
            className="filter-button"
          >
            <Tags className="size-4" aria-hidden="true" />
            {t("allCategories")}
          </button>
          {tagCategories.map((cat) => {
            const label = t.has(`category.${cat.slug}` as any)
              ? t(`category.${cat.slug}` as any)
              : cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.slug)}
                aria-pressed={activeCategory === cat.slug}
                className="filter-button"
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

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
      ) : isError && !tagsResponse ? (
        <ListError onRetry={() => void refetch()} />
      ) : tags.length === 0 ? (
        <Empty className="border-border gap-4 rounded-xl border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>{t("noTagsFound")}</EmptyTitle>
            <EmptyDescription>{t("noTagsFoundDesc")}</EmptyDescription>
          </EmptyHeader>
          {(searchQuery || activeCategory !== "all") && (
            <EmptyContent>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
              >
                {t("clearFilters")}
              </Button>
            </EmptyContent>
          )}
        </Empty>
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
