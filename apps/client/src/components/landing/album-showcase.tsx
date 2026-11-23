"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { getPosts, type PostSummaryResDto } from "@/services/posts";
import { AlbumCard } from "./album-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal } from "./scroll-reveal";

interface AlbumShowcaseProps {
  initialAlbums?: PostSummaryResDto[];
}

export function AlbumShowcase({ initialAlbums }: AlbumShowcaseProps) {
  const t = useTranslations("Landing.albums");
  const { data: postsResponse, isLoading } = useQuery({
    queryKey: ["landing-albums"],
    queryFn: () => getPosts({ limit: 4 }),
    initialData: initialAlbums
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

  const albums = postsResponse?.data || initialAlbums || [];

  return (
    <section id="albums" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <ScrollReveal className="mb-10 flex flex-col justify-between gap-4 sm:mb-12 sm:flex-row sm:items-end">
          <div>
            <div className="border-primary/30 bg-primary/10 text-primary mb-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="size-3.5" />
              <span>{t("badge")}</span>
            </div>
            <h2 className="text-foreground text-3xl font-black tracking-tight sm:text-4xl">
              {t("title")}
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm sm:text-base">
              {t("subtitle")}
            </p>
          </div>

          <Link
            href="/explore"
            className="group text-primary hover:text-primary/80 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors sm:shrink-0"
          >
            <span>{t("viewAll")}</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </ScrollReveal>

        {/* 4 Album Cards Grid */}
        {isLoading && albums.length === 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className="aspect-[3/4] rounded-2xl sm:aspect-[9/13]"
              />
            ))}
          </div>
        ) : albums.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {albums.map((album, idx) => (
              <ScrollReveal key={album.id} delay={idx * 0.08}>
                <AlbumCard album={album} />
              </ScrollReveal>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
