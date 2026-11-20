"use client";

import React, { useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, User } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export interface LightboxAuthor {
  name: string;
  handle?: string;
  avatarUrl?: string | null;
}

export interface PhotoLightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
  author?: LightboxAuthor;
  caption?: string;
}

export function PhotoLightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onChangeIndex,
  author,
  caption,
}: PhotoLightboxProps) {
  const t = useTranslations("Common");
  const total = images.length;
  const currentImage = images[currentIndex] || images[0];

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    onChangeIndex((currentIndex - 1 + total) % total);
  }, [currentIndex, total, onChangeIndex]);

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    onChangeIndex((currentIndex + 1) % total);
  }, [currentIndex, total, onChangeIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handlePrev, handleNext, onClose]);

  if (!isOpen || images.length === 0) return null;

  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogPrimitive.Portal>
        {/* Fullscreen Backdrop Overlay */}
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl" />

        {/* Fullscreen Content: True 100vw x 100vh with no CSS translate offsets */}
        <DialogPrimitive.Content className="fixed inset-0 z-[101] flex h-dvh w-screen flex-col justify-between overflow-hidden p-0 outline-none select-none">
          <DialogPrimitive.Title className="sr-only">
            {t("fullscreenPhoto")}
          </DialogPrimitive.Title>

          {/* 1. Lightbox Top Header Bar */}
          <header className="relative z-20 flex shrink-0 items-center justify-between border-b border-white/10 bg-black/60 px-4 py-3 backdrop-blur-md sm:px-6">
            {/* Author info */}
            <div className="flex items-center gap-3">
              {author ? (
                <div className="flex items-center gap-2.5">
                  <div className="bg-muted relative size-9 shrink-0 overflow-hidden rounded-full border border-white/20">
                    {author.avatarUrl ? (
                      <Image
                        src={author.avatarUrl}
                        alt={author.name}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="bg-primary/20 text-primary flex size-full items-center justify-center text-xs font-bold">
                        {author.name.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white sm:text-sm">
                      {author.name}
                    </h4>
                    {author.handle && (
                      <p className="text-[11px] text-white/60">
                        {author.handle}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-white/80">
                  <User className="size-4" />
                  <span className="text-xs font-medium">{t("gallery")}</span>
                </div>
              )}
            </div>

            {/* Photo Counter & Close Action */}
            <div className="flex items-center gap-3">
              {total > 1 && (
                <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-xs font-semibold text-white/90">
                  {currentIndex + 1} / {total}
                </span>
              )}

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="size-9 cursor-pointer rounded-full bg-white/10 text-white hover:bg-white/25 hover:text-white"
                title={t("closeFullscreen")}
                aria-label={t("close")}
              >
                <X className="size-5" />
              </Button>
            </div>
          </header>

          {/* 2. Main Photo Viewer Area (Centered) */}
          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-3 sm:p-6">
            {/* Previous Arrow */}
            {total > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="group hover:bg-primary absolute left-3 z-30 flex size-11 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white/80 backdrop-blur-md transition-all hover:scale-110 hover:text-white sm:left-6 sm:size-13"
                aria-label={t("prevPhoto")}
              >
                <ChevronLeft className="size-6 sm:size-7" />
              </button>
            )}

            {/* Centered Image */}
            <div className="relative flex size-full items-center justify-center">
              {currentImage && (
                <div className="relative flex max-h-[76vh] max-w-[92vw] items-center justify-center">
                  <Image
                    src={currentImage}
                    alt={caption || `Artwork ${currentIndex + 1}`}
                    width={1600}
                    height={1100}
                    priority
                    className="max-h-[76vh] w-auto max-w-[92vw] rounded-xl object-contain shadow-2xl drop-shadow-2xl"
                  />
                </div>
              )}
            </div>

            {/* Next Arrow */}
            {total > 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="group hover:bg-primary absolute right-3 z-30 flex size-11 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white/80 backdrop-blur-md transition-all hover:scale-110 hover:text-white sm:right-6 sm:size-13"
                aria-label={t("nextPhoto")}
              >
                <ChevronRight className="size-6 sm:size-7" />
              </button>
            )}
          </div>

          {/* 3. Bottom Strip: Caption snippet & Thumbnails */}
          <footer className="relative z-20 shrink-0 space-y-2 border-t border-white/10 bg-black/60 px-4 py-3 backdrop-blur-md sm:px-6">
            {caption && (
              <p className="mx-auto max-w-3xl truncate text-center text-xs text-white/80">
                {caption}
              </p>
            )}

            {total > 1 && (
              <div className="no-scrollbar flex items-center justify-center gap-2 overflow-x-auto py-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onChangeIndex(idx)}
                    className={cn(
                      "relative size-12 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-200 sm:size-14",
                      idx === currentIndex
                        ? "border-primary ring-primary/60 scale-105 shadow-sm ring-2"
                        : "border-white/20 opacity-50 hover:opacity-100"
                    )}
                    aria-label={t("jumpToPhoto", { index: idx + 1 })}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </footer>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
