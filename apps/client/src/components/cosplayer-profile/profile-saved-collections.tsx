"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  FolderHeart,
  Plus,
  X,
  Maximize2,
  Trash2,
  Heart,
  Share2,
  Clock,
  Images,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CollectionPhoto, SavedCollection } from "./profile-types";

interface ProfileSavedCollectionsProps {
  initialCollections: SavedCollection[];
  layout?: "compact" | "full";
}

export function ProfileSavedCollections({
  initialCollections,
  layout = "full",
}: ProfileSavedCollectionsProps) {
  const [collections, setCollections] =
    useState<SavedCollection[]>(initialCollections);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  // Viewing full collection modal
  const [selectedCollection, setSelectedCollection] =
    useState<SavedCollection | null>(null);

  // Fullscreen Lightbox for individual photo
  const [activePhoto, setActivePhoto] = useState<CollectionPhoto | null>(null);

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newCol: SavedCollection = {
      id: `col-${Date.now()}`,
      title: `"${newTitle.trim()}"`,
      count: 0,
      thumbnails: [
        "/landing/art-acheron.jpg",
        "/landing/art-raiden-1.jpg",
        "/landing/art-kafka.jpg",
        "/landing/cosplay-work-1.jpg",
      ],
      photos: [],
      updatedAt: "Vừa tạo",
    };

    setCollections((prev) => [newCol, ...prev]);
    setNewTitle("");
    setIsCreateOpen(false);
    toast.success(`Đã tạo bộ sưu tập ${newCol.title}`);
  };

  const handleRemovePhoto = (photoId: string) => {
    if (!selectedCollection) return;
    const updatedPhotos = (selectedCollection.photos || []).filter(
      (p) => p.id !== photoId
    );
    const updatedCol = {
      ...selectedCollection,
      photos: updatedPhotos,
      count: Math.max(0, selectedCollection.count - 1),
    };

    setSelectedCollection(updatedCol);
    setCollections((prev) =>
      prev.map((c) => (c.id === updatedCol.id ? updatedCol : c))
    );
    toast.success("Đã xóa ảnh khỏi bộ sưu tập.");
  };

  const handleDeleteCollection = (collectionId: string) => {
    setCollections((prev) => prev.filter((c) => c.id !== collectionId));
    setSelectedCollection(null);
    toast.success("Đã xóa bộ sưu tập.");
  };

  const handleShareCollection = (col: SavedCollection) => {
    navigator.clipboard?.writeText?.(window.location.href);
    toast.success(`Đã sao chép liên kết bộ sưu tập ${col.title}`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <h3
          className={cn(
            "text-foreground flex items-center gap-2 font-bold",
            layout === "full" ? "text-base sm:text-lg" : "text-sm"
          )}
        >
          <FolderHeart className="text-primary size-4.5" />
          <span>
            {layout === "full"
              ? `Bộ sưu tập đã lưu (${collections.length})`
              : "Bộ sưu tập đã lưu"}
          </span>
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="border-border/70 h-8 gap-1.5 rounded-xl px-3 text-xs font-semibold"
        >
          <Plus className="size-3.5" />
          <span>Tạo mới</span>
        </Button>
      </div>

      {/* Grid of collections */}
      <div
        className={cn(
          layout === "full"
            ? "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "space-y-3.5"
        )}
      >
        {collections.map((col) => {
          return (
            <div
              key={col.id}
              onClick={() => setSelectedCollection(col)}
              className="group border-border/70 bg-card/60 hover:border-primary/50 hover:shadow-primary/10 relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border backdrop-blur-md transition-all duration-300 hover:shadow-xl"
            >
              {/* Asymmetric 3-Panel Mosaic Banner (Bleeds to edges) */}
              <div className="bg-muted relative aspect-[16/11] w-full overflow-hidden">
                <div className="grid h-full grid-cols-3 gap-1 p-1">
                  {/* Hero Left (2 cols) */}
                  <div className="relative col-span-2 h-full overflow-hidden rounded-l-2xl">
                    <Image
                      src={col.thumbnails[0] || "/landing/art-acheron.jpg"}
                      alt={col.title}
                      fill
                      sizes="(max-width: 640px) 70vw, (max-width: 1024px) 35vw, 25vw"
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Stacked Right (1 col, 2 rows) */}
                  <div className="grid h-full grid-rows-2 gap-1">
                    <div className="relative h-full overflow-hidden rounded-tr-2xl">
                      <Image
                        src={
                          col.thumbnails[1] ||
                          col.thumbnails[0] ||
                          "/landing/art-kafka.jpg"
                        }
                        alt={col.title}
                        fill
                        sizes="(max-width: 640px) 30vw, (max-width: 1024px) 15vw, 12vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="relative h-full overflow-hidden rounded-br-2xl">
                      <Image
                        src={
                          col.thumbnails[2] ||
                          col.thumbnails[0] ||
                          "/landing/art-raiden-1.jpg"
                        }
                        alt={col.title}
                        fill
                        sizes="(max-width: 640px) 30vw, (max-width: 1024px) 15vw, 12vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Count Badge overlay on bottom-right thumbnail */}
                      {col.count > 3 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 font-mono text-xs font-bold text-white/95 backdrop-blur-xs">
                          +{col.count - 2}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Subtle gradient vignette at bottom */}
                <div className="from-card/80 pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t via-transparent to-transparent" />

                {/* Hover overlay hint */}
                <div className="bg-background/50 absolute inset-0 flex items-center justify-center opacity-0 backdrop-blur-xs transition-opacity duration-200 group-hover:opacity-100">
                  <span className="bg-primary text-primary-foreground flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold shadow-lg">
                    <Images className="size-4" />
                    Xem tất cả ảnh
                  </span>
                </div>
              </div>

              {/* Card Body: Info, Count & Folder Emblem */}
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <h4 className="text-foreground group-hover:text-primary truncate text-base font-bold tracking-tight transition-colors">
                      {col.title.replace(/^"|"$/g, "")}
                    </h4>
                    <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
                      <span className="text-primary flex items-center gap-1 font-semibold">
                        <Images className="size-3.5" />
                        {col.count} tác phẩm
                      </span>
                      {col.updatedAt && (
                        <>
                          <span className="text-muted-foreground/40">•</span>
                          <span>{col.updatedAt}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Folder Icon Emblem with smooth color transition */}
                  <div className="bg-primary/10 border-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-xl border shadow-xs transition-all duration-300">
                    <FolderHeart className="size-4.5" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* Detail Dialog: Xem tất cả ảnh trong Bộ sưu tập          */}
      {/* ======================================================== */}
      <Dialog
        open={Boolean(selectedCollection)}
        onOpenChange={(open) => {
          if (!open) setSelectedCollection(null);
        }}
      >
        <DialogContent className="border-border/80 bg-background/95 max-h-[90vh] overflow-hidden rounded-3xl p-0 backdrop-blur-xl sm:max-w-4xl">
          {selectedCollection && (
            <div className="flex max-h-[90vh] flex-col">
              {/* Modal Header */}
              <DialogHeader className="border-border/70 border-b p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <DialogTitle className="flex items-center gap-2.5 text-xl font-bold tracking-tight sm:text-2xl">
                      <div className="bg-primary/15 text-primary flex size-8 items-center justify-center rounded-xl">
                        <FolderHeart className="size-5" />
                      </div>
                      <span>{selectedCollection.title}</span>
                    </DialogTitle>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      {selectedCollection.photos?.length ||
                        selectedCollection.count}{" "}
                      ảnh cosplay đã lưu
                      {selectedCollection.updatedAt &&
                        ` • Cập nhật ${selectedCollection.updatedAt}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShareCollection(selectedCollection)}
                      className="border-border/80 h-8 gap-1.5 rounded-lg px-2.5 text-xs"
                    >
                      <Share2 className="size-3.5" />
                      <span className="hidden sm:inline">Chia sẻ</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleDeleteCollection(selectedCollection.id)
                      }
                      className="border-border/80 text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-8 gap-1.5 rounded-lg px-2.5 text-xs"
                    >
                      <Trash2 className="size-3.5" />
                      <span className="hidden sm:inline">Xóa bộ sưu tập</span>
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              {/* Photos Gallery Grid */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6">
                {!selectedCollection.photos ||
                selectedCollection.photos.length === 0 ? (
                  <div className="border-border/70 flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
                    <FolderHeart className="text-muted-foreground mb-3 size-10" />
                    <p className="text-foreground text-sm font-semibold">
                      Chưa có tác phẩm nào trong bộ sưu tập này
                    </p>
                    <p className="text-muted-foreground mt-1 max-w-sm text-xs">
                      Hãy duyệt qua các trang Bảng tin, Khám phá hoặc Hồ sơ
                      cosplayer để lưu lại những tác phẩm bạn yêu thích.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
                    {selectedCollection.photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="group border-border/70 bg-card/60 relative aspect-[3/4] overflow-hidden rounded-2xl border shadow-xs"
                      >
                        <Image
                          src={photo.src}
                          alt={photo.title}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
                          {/* Top Actions */}
                          <div className="flex justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePhoto(photo.id);
                              }}
                              className="size-7 rounded-lg bg-black/40 text-white hover:bg-red-500/80"
                              title="Xóa khỏi bộ sưu tập"
                              aria-label="Xóa khỏi bộ sưu tập"
                            >
                              <X className="size-3.5" />
                            </Button>
                          </div>

                          {/* Bottom Info & Zoom */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="truncate text-xs font-bold text-white drop-shadow-xs">
                                {photo.title}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-white/80">
                              <span>by {photo.authorName}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setActivePhoto(photo)}
                                className="h-6 gap-1 rounded-md bg-white/20 px-1.5 text-[10px] text-white hover:bg-white/30"
                              >
                                <Maximize2 className="size-2.5" />
                                <span>Phóng to</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* Lightbox Modal: Xem ảnh full size                       */}
      {/* ======================================================== */}
      <Dialog
        open={Boolean(activePhoto)}
        onOpenChange={(open) => {
          if (!open) setActivePhoto(null);
        }}
      >
        <DialogContent className="border-none bg-black/95 p-2 backdrop-blur-2xl sm:max-w-4xl">
          {activePhoto && (
            <div className="relative flex flex-col items-center">
              <div className="relative aspect-[3/4] max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl">
                <Image
                  src={activePhoto.src}
                  alt={activePhoto.title}
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              <div className="mt-3 flex w-full max-w-2xl items-center justify-between px-2 text-white">
                <div>
                  <h4 className="text-sm font-bold">{activePhoto.title}</h4>
                  <p className="text-xs text-white/70">
                    Cosplayer: {activePhoto.authorName}
                  </p>
                </div>
                {activePhoto.likesCount && (
                  <Badge
                    variant="secondary"
                    className="gap-1 bg-white/10 text-white"
                  >
                    <Heart className="size-3 fill-rose-500 text-rose-500" />
                    <span>{activePhoto.likesCount}</span>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* Create Collection Dialog                                */}
      {/* ======================================================== */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderHeart className="text-primary size-5" />
              Tạo bộ sưu tập mới
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateCollection} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-muted-foreground text-xs font-semibold">
                Tên bộ sưu tập
              </label>
              <Input
                placeholder='Ví dụ: "Ảnh Honkai siêu đỉnh", "Lookbook 2026"...'
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="h-10 rounded-xl"
                required
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-xl"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={!newTitle.trim()}
                className="bg-primary text-primary-foreground rounded-xl font-semibold"
              >
                Tạo thư mục
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
