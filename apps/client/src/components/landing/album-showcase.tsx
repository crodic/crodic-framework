"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Images } from "lucide-react";
import { getPosts, type PostSummaryResDto } from "@/services/posts";
import { AlbumCard } from "./album-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface AlbumShowcaseProps {
  initialAlbums?: PostSummaryResDto[];
}

const CATEGORY_PILLS = [
  { id: "all", key: "all" },
  { id: "series", key: "series" },
  { id: "general", key: "general" },
  { id: "group", key: "group" },
  { id: "premium", key: "premium" },
] as const;

export function AlbumShowcase({ initialAlbums }: AlbumShowcaseProps) {
  const t = useTranslations("Landing.albums");
  const tStudio = useTranslations("Studio");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const { data: postsResponse, isLoading } = useQuery({
    queryKey: ["landing-albums", activeCategory],
    queryFn: () =>
      getPosts({
        limit: 4,
        ...(activeCategory !== "all" ? { albumCategory: activeCategory } : {}),
      }),
    initialData:
      activeCategory === "all" && initialAlbums
        ? {
            data: initialAlbums,
            meta: {
              itemsPerPage: 4,
              totalItems: initialAlbums.length,
              currentPage: 1,
              totalPages: 1,
              sortBy: [],
            },
          }
        : undefined,
    staleTime: 5 * 60 * 1000,
  });

  const albums =
    postsResponse?.data ||
    (activeCategory === "all" ? initialAlbums : []) ||
    [];

  return (
    <section
      id="albums"
      className="border-border/60 relative scroll-mt-16 overflow-hidden border-t py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Watermarked Editorial Header */}
        <div className="relative mb-8 flex flex-col justify-between gap-6 sm:mb-10 lg:flex-row lg:items-end">
          <div className="relative">
            <span
              className="text-foreground/[0.04] dark:text-foreground/[0.06] pointer-events-none absolute -top-6 left-0 text-6xl font-black tracking-widest whitespace-nowrap uppercase select-none sm:text-8xl"
              aria-hidden="true"
            >
              PORTFOLIO
            </span>

            <div className="relative z-10 space-y-2.5">
              <span className="border-primary/25 bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-xs font-semibold tracking-wider uppercase">
                <Images className="size-3.5" aria-hidden="true" />
                {t("badge")}
              </span>

              <h2 className="text-foreground relative block text-3xl font-extrabold tracking-tight text-balance uppercase sm:text-4xl">
                {t("title")}
                <span className="bg-primary mt-2 block h-1 w-20 rounded-full" />
              </h2>
              <p className="text-muted-foreground max-w-2xl pt-1 text-sm leading-relaxed text-pretty sm:text-base">
                {t("subtitle")}
              </p>
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            className="w-fit shrink-0 gap-2 font-semibold"
          >
            <Link href="/explore">
              <span>{t("viewAll")}</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        {/* Interactive Category Pills (Inspired by Coser.ID Popular Projects Tag Filter) */}
        <div className="mb-8 flex scrollbar-none items-center gap-2 overflow-x-auto pb-1">
          {CATEGORY_PILLS.map((pill) => {
            const isActive = activeCategory === pill.id;
            const label =
              pill.id === "all" ? "Tất cả" : tStudio(`categories.${pill.id}`);
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setActiveCategory(pill.id)}
                className={`cursor-pointer rounded-md px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors sm:text-sm ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border-border/70 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* 4 Album Cards Grid */}
        {isLoading && albums.length === 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className="aspect-[3/4] rounded-xl sm:aspect-[9/13]"
              />
            ))}
          </div>
        ) : albums.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
