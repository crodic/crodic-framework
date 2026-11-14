"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FolderHeart, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SavedCollection } from "./profile-types";

interface ProfileSavedCollectionsProps {
  initialCollections: SavedCollection[];
}

export function ProfileSavedCollections({
  initialCollections,
}: ProfileSavedCollectionsProps) {
  const [collections, setCollections] =
    useState<SavedCollection[]>(initialCollections);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");

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
      updatedAt: "Vừa tạo",
    };

    setCollections((prev) => [newCol, ...prev]);
    setNewTitle("");
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-foreground flex items-center gap-2 text-sm font-bold">
          <FolderHeart className="text-primary size-4" />
          <span>Bộ sưu tập đã lưu</span>
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="border-border/70 h-7 gap-1 rounded-lg px-2.5 text-xs"
        >
          <Plus className="size-3" />
          <span>Tạo mới</span>
        </Button>
      </div>

      {/* Grid of collections */}
      <div className="space-y-3.5">
        {collections.map((col) => {
          return (
            <div
              key={col.id}
              className="group border-border/70 bg-card/60 hover:border-primary/50 cursor-pointer rounded-2xl border p-3 transition-all hover:shadow-md"
            >
              {/* 2x2 Mini Thumbnails Container */}
              <div className="bg-muted/40 mb-2.5 grid aspect-[4/3] w-full grid-cols-2 grid-rows-2 gap-1 overflow-hidden rounded-xl p-1">
                {col.thumbnails.slice(0, 4).map((thumb, idx) => (
                  <div
                    key={idx}
                    className="bg-muted relative size-full overflow-hidden rounded-md"
                  >
                    <Image
                      src={thumb}
                      alt={`${col.title} ${idx + 1}`}
                      fill
                      sizes="120px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>

              {/* Title & Stats */}
              <div className="flex items-center justify-between">
                <span className="text-foreground group-hover:text-primary truncate text-xs font-bold transition-colors sm:text-sm">
                  {col.title}
                </span>
                <span className="text-muted-foreground shrink-0 text-[11px] font-medium">
                  {col.count} mục
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Collection Dialog */}
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
