"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Images, Eye, Calendar, Video } from "lucide-react";
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
  | "studioFilter"
  | "eventFilter"
  | "originalFilter";

const PROFILE_ALBUM_FILTERS: { id: string; labelKey: FilterKey }[] = [
  { id: "all", labelKey: "allFilters" },
  { id: "series", labelKey: "seriesFilter" },
  { id: "studio", labelKey: "studioFilter" },
  { id: "event", labelKey: "eventFilter" },
  { id: "original", labelKey: "originalFilter" },
];

interface ProfileAlbumsProps {
  albums: PostSummaryResDto[];
  cosplayerName: string;
}

export function ProfileAlbums({ albums, cosplayerName }: ProfileAlbumsProps) {
  const t = useTranslations("Profile");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedAlbum, setSelectedAlbum] = useState<PostSummaryResDto | null>(
    null
  );

  const filteredAlbums = albums.filter((album) => {
    if (activeFilter === "all") return true;
    return album.albumCategory === activeFilter;
  });

  return (
    <div className="space-y-6">
      {/* 1. Sub-filter pills */}
      <div className="flex scrollbar-none items-center gap-2 overflow-x-auto pb-2">
        {PROFILE_ALBUM_FILTERS.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all sm:rounded-xl sm:text-sm ${
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

      {/* 2. Responsive Album Grid */}
      <div className="grid grid-cols-2 gap-3.5 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {filteredAlbums.map((album) => {
          return (
            <Link
              key={album.id}
              href={`/posts/${album.slug || album.id}`}
              className="group flex cursor-pointer flex-col space-y-2 rounded-2xl transition-all duration-300"
            >
              {/* Cover Image Container */}
              <div className="bg-muted/40 border-border/50 group-hover:border-primary/50 relative aspect-[4/5] w-full overflow-hidden rounded-2xl border shadow-xs transition-all group-hover:shadow-md sm:rounded-3xl">
                {/* Video Badge */}
                {(album.postType === "video" || Boolean(album.videoUrl)) && (
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
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                )}

                {/* Sub-thumb preview in corner (for multi-image albums) */}
                {album.collagePreviewUrls &&
                  album.collagePreviewUrls.length > 0 && (
                    <div className="border-background absolute bottom-2.5 left-2.5 size-10 overflow-hidden rounded-lg border-2 shadow-md sm:size-12">
                      <Image
                        src={album.collagePreviewUrls[0] || album.coverImageUrl}
                        alt="Preview thumbnail"
                        fill
                        sizes="48px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
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
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="bg-background/90 text-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg backdrop-blur-md">
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
                  <span className="truncate">{album.albumCategory}</span>
                  <span className="flex shrink-0 items-center gap-1">
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
