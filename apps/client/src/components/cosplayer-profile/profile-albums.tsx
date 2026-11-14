"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Images, Eye, Calendar, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CosplayerAlbum } from "./profile-types";
import { PROFILE_ALBUM_FILTERS } from "./profile-data";

interface ProfileAlbumsProps {
  albums: CosplayerAlbum[];
  cosplayerName: string;
}

export function ProfileAlbums({ albums, cosplayerName }: ProfileAlbumsProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedAlbum, setSelectedAlbum] = useState<CosplayerAlbum | null>(
    null
  );

  const filteredAlbums = albums.filter((album) => {
    if (activeFilter === "all") return true;
    return album.category === activeFilter;
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
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* 2. Responsive Album Grid: 4 cols on desktop, 2 cols on mobile */}
      <div className="grid grid-cols-2 gap-3.5 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {filteredAlbums.map((album) => {
          return (
            <div
              key={album.id}
              onClick={() => setSelectedAlbum(album)}
              className="group flex cursor-pointer flex-col space-y-2 rounded-2xl transition-all duration-300"
            >
              {/* Card Thumbnail Container */}
              <div className="bg-muted/40 border-border/40 group-hover:border-primary/50 relative aspect-[4/5] w-full overflow-hidden rounded-xl border shadow-xs transition-all group-hover:shadow-md sm:rounded-2xl">
                {album.isCollage && album.collageImages ? (
                  /* 2x2 Collage preview */
                  <div className="bg-muted/20 grid size-full grid-cols-2 grid-rows-2 gap-1 p-1">
                    {album.collageImages.slice(0, 4).map((img, idx) => (
                      <div
                        key={idx}
                        className="bg-muted relative size-full overflow-hidden rounded-md sm:rounded-lg"
                      >
                        <Image
                          src={img}
                          alt={`${album.title} photo ${idx + 1}`}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Single photo preview */
                  <div className="relative size-full">
                    <Image
                      src={album.coverImage}
                      alt={album.title}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
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
                    <span>{album.photosCount} ảnh</span>
                  </Badge>
                </div>

                {/* Hover overlay hint */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="bg-background/90 text-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg backdrop-blur-md">
                    <Eye className="text-primary size-3.5" />
                    Xem album
                  </span>
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="space-y-0.5 px-1">
                <h3 className="text-foreground group-hover:text-primary line-clamp-1 text-xs font-bold transition-colors sm:text-sm">
                  {album.title}
                </h3>
                <div className="text-muted-foreground flex items-center justify-between text-[11px]">
                  <span className="truncate">{album.categoryLabel}</span>
                  <span className="flex shrink-0 items-center gap-1">
                    <Calendar className="size-3" />
                    {album.updatedAt}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAlbums.length === 0 && (
        <div className="text-muted-foreground py-16 text-center">
          <Sparkles className="mx-auto mb-2 size-8 opacity-40" />
          <p className="text-sm font-medium">Chưa có album nào trong mục này</p>
        </div>
      )}

      {/* Album Preview Lightbox Modal */}
      <Dialog
        open={Boolean(selectedAlbum)}
        onOpenChange={(open) => !open && setSelectedAlbum(null)}
      >
        <DialogContent className="bg-background/95 overflow-hidden rounded-2xl p-0 backdrop-blur-md sm:max-w-3xl">
          {selectedAlbum && (
            <div>
              <DialogHeader className="border-border/50 border-b p-4 sm:p-5">
                <div className="flex items-center justify-between pr-6">
                  <div>
                    <DialogTitle className="text-base font-bold sm:text-lg">
                      {selectedAlbum.title}
                    </DialogTitle>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      Bởi {cosplayerName} • {selectedAlbum.photosCount} hình ảnh
                      • Cập nhật {selectedAlbum.updatedAt}
                    </p>
                  </div>
                  <Badge variant="outline" className="rounded-lg text-xs">
                    {selectedAlbum.categoryLabel}
                  </Badge>
                </div>
              </DialogHeader>

              {/* Photos Grid inside Lightbox */}
              <div className="max-h-[70vh] space-y-4 overflow-y-auto p-4 sm:p-6">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {(
                    selectedAlbum.collageImages || [selectedAlbum.coverImage]
                  ).map((photo, idx) => (
                    <div
                      key={idx}
                      className="bg-muted border-border/40 relative aspect-[3/4] overflow-hidden rounded-xl border"
                    >
                      <Image
                        src={photo}
                        alt={`${selectedAlbum.title} ${idx + 1}`}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
