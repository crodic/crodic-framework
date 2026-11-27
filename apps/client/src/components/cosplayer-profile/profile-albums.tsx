"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Images, Eye, Calendar, Video, ArrowRight, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PostSummaryResDto } from "@/services/posts";
import { useTranslations } from "next-intl";

type FilterKey =
  | "allFilters"
  | "seriesFilter"
  | "generalFilter"
  | "groupFilter"
  | "premiumFilter";

const PROFILE_ALBUM_FILTERS: { id: string; labelKey: FilterKey }[] = [
  { id: "all", labelKey: "allFilters" },
  { id: "series", labelKey: "seriesFilter" },
  { id: "general", labelKey: "generalFilter" },
  { id: "group", labelKey: "groupFilter" },
  { id: "premium", labelKey: "premiumFilter" },
];

interface ProfileAlbumsProps {
  albums: PostSummaryResDto[];
  cosplayerName: string;
}

export function ProfileAlbums({ albums, cosplayerName }: ProfileAlbumsProps) {
  const t = useTranslations("Profile");
  const tStudio = useTranslations("Studio");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedAlbum, setSelectedAlbum] = useState<PostSummaryResDto | null>(
    null
  );

  const getCategoryLabel = (category?: string) => {
    if (
      category === "series" ||
      category === "general" ||
      category === "group" ||
      category === "premium"
    ) {
      return tStudio(`categories.${category}`);
    }
    return category || "";
  };

  // Only show category filters that exist in the user's albums (if more than 1 category exists)
  const existingCategories = new Set(
    albums.map((a) => a.albumCategory).filter(Boolean)
  );
  const visibleFilters = PROFILE_ALBUM_FILTERS.filter(
    (f) => f.id === "all" || existingCategories.has(f.id)
  );

  const filteredAlbums = albums.filter((album) => {
    if (activeFilter === "all") return true;
    return album.albumCategory === activeFilter;
  });

  const isAllFilter = activeFilter === "all";
  const featuredAlbum =
    isAllFilter && filteredAlbums.length > 0 ? filteredAlbums[0] : null;
  const gridAlbums = featuredAlbum ? filteredAlbums.slice(1) : filteredAlbums;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Sub-filter pills (only shown when user has multiple distinct categories) */}
      {visibleFilters.length > 2 && (
        <div className="flex scrollbar-none items-center gap-2 overflow-x-auto pb-2">
          {visibleFilters.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={`rounded-md px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all sm:text-sm ${
                  isActive
                    ? "bg-foreground text-background font-semibold shadow-xs"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border-border/50 border"
                }`}
              >
                {t(filter.labelKey)}
              </button>
            );
          })}
        </div>
      )}

      {/* 2. Spotlight Masterpiece Banner (Only when filter is "all" and there are albums) */}
      {featuredAlbum && (
        <div className="group border-border/50 bg-card relative overflow-hidden rounded-xl border shadow-sm transition-all duration-300 hover:shadow-xl">
          <Link
            href={`/posts/${encodeURIComponent(String(featuredAlbum.slug || featuredAlbum.id).trim())}`}
            className="relative block aspect-[16/9] w-full overflow-hidden sm:aspect-[21/9] md:aspect-[2.5/1]"
          >
            {featuredAlbum.coverImageUrl ? (
              <Image
                src={featuredAlbum.coverImageUrl}
                alt={featuredAlbum.title}
                fill
                priority
                sizes="(max-width: 1440px) 100vw, 1440px"
                className="object-cover object-center"
              />
            ) : (
              <div className="bg-muted size-full" />
            )}

            {/* Cinematic Vignette Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />

            {/* Top Badges */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2 sm:top-5 sm:left-5">
              <Badge className="bg-primary text-primary-foreground gap-1.5 px-2.5 py-1 text-xs font-semibold shadow-sm">
                <Award className="size-3.5" />
                <span>Tác phẩm tiêu biểu</span>
              </Badge>
              {(featuredAlbum.postType === "video" ||
                Boolean(featuredAlbum.videoUrl)) && (
                <Badge
                  variant="secondary"
                  className="gap-1 border-white/20 bg-black/60 text-xs text-white backdrop-blur-md"
                >
                  <Video className="size-3 text-pink-400" />
                  <span>Video</span>
                </Badge>
              )}
            </div>

            {/* Bottom Content Info */}
            <div className="absolute inset-x-4 bottom-4 z-10 flex flex-col justify-between gap-3 text-white sm:inset-x-6 sm:bottom-6 sm:flex-row sm:items-end">
              <div className="max-w-2xl space-y-1 sm:space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-white/80 sm:text-sm">
                  <span className="font-medium">
                    {getCategoryLabel(featuredAlbum.albumCategory)}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Images className="size-3.5" />
                    {t("photosCount", { count: featuredAlbum.photosCount })}
                  </span>
                  {featuredAlbum.publishedAt && (
                    <>
                      <span>•</span>
                      <span
                        className="inline-flex items-center gap-1"
                        suppressHydrationWarning
                      >
                        <Calendar className="size-3" />
                        {new Date(
                          featuredAlbum.publishedAt
                        ).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </div>
                <h2 className="line-clamp-2 text-lg font-extrabold text-white drop-shadow-md sm:text-2xl md:text-3xl">
                  {featuredAlbum.title}
                </h2>
                {featuredAlbum.caption && (
                  <p className="line-clamp-1 max-w-xl text-xs text-white/75 sm:text-sm">
                    {featuredAlbum.caption}
                  </p>
                )}
              </div>

              <div className="group-hover:bg-primary group-hover:text-primary-foreground inline-flex shrink-0 items-center gap-1.5 self-start rounded-md bg-white/95 px-3.5 py-2 text-xs font-semibold text-black shadow-lg backdrop-blur-md transition-all sm:self-end sm:text-sm">
                <span>{t("viewAlbum")}</span>
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* 3. Responsive Album Grid */}
      {gridAlbums.length > 0 && (
        <div className="space-y-4">
          {featuredAlbum && (
            <h3 className="text-muted-foreground text-sm font-bold tracking-wider uppercase">
              {t("allAlbumsTab") || "Bộ sưu tập"}
            </h3>
          )}
          <div className="grid grid-cols-2 gap-3.5 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {gridAlbums.map((album) => {
              return (
                <Link
                  key={album.id}
                  href={`/posts/${encodeURIComponent(String(album.slug || album.id).trim())}`}
                  className="group flex cursor-pointer flex-col space-y-2 rounded-xl transition-all duration-300"
                >
                  {/* Cover Image Container */}
                  <div className="bg-muted/50 border-border/40 group-hover:border-primary/50 relative aspect-[4/5] w-full overflow-hidden rounded-xl border shadow-xs transition-all duration-300 group-hover:shadow-md">
                    {/* Video Badge */}
                    {(album.postType === "video" ||
                      Boolean(album.videoUrl)) && (
                      <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 rounded-full border border-white/20 bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white shadow-xs backdrop-blur-md select-none">
                        <Video className="size-3 text-pink-400" />
                        <span>Video</span>
                      </div>
                    )}
                    {album.coverImageUrl && (
                      <Image
                        src={album.coverImageUrl}
                        alt={album.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover object-top"
                      />
                    )}

                    {/* Gradient Overlay on Bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    {/* Sub-thumb preview in corner (for multi-image albums) */}
                    {album.collagePreviewUrls &&
                      album.collagePreviewUrls.length > 0 && (
                        <div className="border-background absolute bottom-2.5 left-2.5 size-10 overflow-hidden rounded-lg border-2 shadow-md sm:size-12">
                          <Image
                            src={
                              album.collagePreviewUrls[0] || album.coverImageUrl
                            }
                            alt="Preview thumbnail"
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      )}

                    {/* Photos Count Badge */}
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 rounded-md border-white/10 bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-md sm:text-xs"
                      >
                        <Images className="size-3" />
                        <span>
                          {t("photosCount", { count: album.photosCount })}
                        </span>
                      </Badge>
                    </div>

                    {/* Hover overlay hint */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="bg-background/90 text-foreground inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold shadow-lg backdrop-blur-md">
                        <Eye className="text-primary size-3.5" />
                        {t("viewAlbum")}
                      </span>
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <div className="space-y-0.5 px-1">
                    <h3 className="text-foreground group-hover:text-primary line-clamp-1 text-xs font-bold transition-colors sm:text-sm">
                      {album.title}
                    </h3>
                    <div className="text-muted-foreground flex items-center justify-between text-[11px]">
                      <span className="truncate">
                        {getCategoryLabel(album.albumCategory)}
                      </span>
                      <span
                        className="flex shrink-0 items-center gap-1"
                        suppressHydrationWarning
                      >
                        <Calendar className="size-3" />
                        {album.publishedAt
                          ? new Date(album.publishedAt).toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {filteredAlbums.length === 0 && (
        <div className="text-muted-foreground py-16 text-center">
          <Images className="mx-auto mb-2 size-8 opacity-40" />
          <p className="text-sm font-medium">{t("emptyAlbums")}</p>
        </div>
      )}

      {/* Album Preview Lightbox Modal */}
      <Dialog
        open={Boolean(selectedAlbum)}
        onOpenChange={(open) => !open && setSelectedAlbum(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedAlbum?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              {selectedAlbum?.caption}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {selectedAlbum?.collagePreviewUrls?.map((url, idx) => (
                <div
                  key={idx}
                  className="bg-muted relative aspect-[3/4] overflow-hidden rounded-xl"
                >
                  <Image
                    src={url}
                    alt={selectedAlbum?.title || ""}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
