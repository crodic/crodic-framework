"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Flame, Clock, Image as ImageIcon, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExploreCard } from "@/components/explore/explore-card";
import { getPosts, type PostSummaryResDto } from "@/services/posts";
import { useAuthStore } from "@/store/use-auth-store";
import { cn } from "@/lib/utils";

interface TagArtworksGridProps {
  tagName: string;
}

export function TagArtworksGrid({ tagName }: TagArtworksGridProps) {
  const t = useTranslations("Tags");
  const [filter, setFilter] = useState<"popular" | "latest">("popular");
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const sortParam = filter === "popular" ? "-trendingScore" : "-publishedAt";

  const { data: response, isLoading } = useQuery({
    queryKey: ["tag-artworks", tagName, filter, isAuthenticated],
    queryFn: () =>
      getPosts({
        search: tagName,
        sort: sortParam,
        limit: 40,
      }),
    enabled: !isHydrating && Boolean(tagName),
  });

  const posts: PostSummaryResDto[] = response?.data || [];

  return (
    <div className="space-y-5">
      {/* Filter Toolbar Header */}
      <div className="border-border/60 flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="text-primary size-4" />
          <h3 className="text-foreground text-sm font-bold">
            {t("tabArtworks")}
          </h3>
          {!isLoading && (
            <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 font-mono text-xs font-semibold tabular-nums">
              {posts.length}
            </span>
          )}
        </div>

        {/* Sort Pill Toggle */}
        <div className="border-border/70 bg-muted/40 flex items-center rounded-xl border p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => setFilter("popular")}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all select-none",
              filter === "popular"
                ? "bg-background text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Flame className="size-3.5 fill-amber-500 text-amber-500" />
            <span>{t("filterPopular")}</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter("latest")}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all select-none",
              filter === "latest"
                ? "bg-background text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Clock className="size-3.5 text-sky-500" />
            <span>{t("filterLatest")}</span>
          </button>
        </div>
      </div>

      {/* Grid or Skeletons or Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="bg-muted/50 aspect-[3/4] w-full animate-pulse rounded-2xl" />
              <div className="bg-muted/40 h-4 w-3/4 animate-pulse rounded" />
              <div className="bg-muted/30 h-3 w-1/2 animate-pulse rounded" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="border-border/70 text-muted-foreground flex flex-col items-center justify-center space-y-3 rounded-2xl border border-dashed p-10 text-center">
          <div className="bg-muted/60 text-muted-foreground flex size-12 items-center justify-center rounded-2xl">
            <ImageIcon className="size-6" />
          </div>
          <div className="max-w-sm space-y-1">
            <h4 className="text-foreground text-sm font-bold">
              {t("noArtworks", { tag: tagName })}
            </h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {t("noArtworksDesc")}
            </p>
          </div>
          <Button
            asChild
            size="sm"
            className="mt-2 gap-1.5 text-xs font-semibold shadow-xs"
          >
            <Link href="/studio">
              <Plus className="size-3.5" />
              <span>{t("postArtwork")}</span>
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {posts.map((post) => (
            <ExploreCard key={post.id} item={post} />
          ))}
        </div>
      )}
    </div>
  );
}
