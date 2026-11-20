"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { PhotoLightbox } from "@/components/feed/photo-lightbox";

interface PostCarouselProps {
  photos: string[];
  title: string;
}

export function PostCarousel({ photos, title }: PostCarouselProps) {
  const t = useTranslations("Feed");
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const thumbsContainerRef = useRef<HTMLDivElement>(null);

  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);

    // Re-init after Radix Dialog open animation finishes so Embla measures true dimensions
    const timer = setTimeout(() => {
      api.reInit();
    }, 100);

    return () => {
      clearTimeout(timer);
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, onSelect]);

  const handleThumbClick = (index: number) => {
    if (!api) return;
    api.scrollTo(index);
    setCurrent(index);
  };

  const scrollPrev = () => {
    api?.scrollPrev();
  };

  const scrollNext = () => {
    api?.scrollNext();
  };

  useEffect(() => {
    if (!thumbsContainerRef.current) return;
    const activeThumb = thumbsContainerRef.current.children[current] as
      HTMLElement | undefined;
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [current]);

  if (!photos.length) return null;

  const activePhoto = photos[current] ?? photos[0] ?? "";

  return (
    <div className="relative flex size-full min-h-[380px] flex-col justify-between overflow-hidden bg-zinc-950 select-none md:min-h-0">
      {/* Ambient blurred backdrop from active image */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {activePhoto && (
          <Image
            src={activePhoto}
            alt=""
            fill
            sizes="50vw"
            className="scale-110 object-cover opacity-25 blur-3xl transition-all duration-500"
            aria-hidden="true"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/55" />
      </div>

      {/* Top Overlay Bar: Photo Counter + Fullscreen Trigger */}
      <div className="pointer-events-none absolute inset-x-3.5 top-3.5 z-20 flex items-center justify-between gap-2">
        {photos.length > 1 ? (
          <span className="rounded-full border border-white/15 bg-black/55 px-3 py-1 text-xs font-semibold text-white/95 tabular-nums shadow-sm backdrop-blur-md">
            {current + 1} / {photos.length}
          </span>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="pointer-events-auto inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-xs font-medium text-white/90 shadow-sm backdrop-blur-md transition-all hover:bg-black/80 hover:text-white active:scale-95"
          aria-label={t("fullscreen")}
        >
          <Maximize2 className="size-3.5" />
          <span className="hidden sm:inline">{t("fullscreen")}</span>
        </button>
      </div>

      {/* Edge-to-Edge Main Carousel */}
      <div className="relative z-10 flex size-full flex-1 items-center justify-center overflow-hidden">
        <Carousel
          setApi={setApi}
          opts={{
            loop: true,
          }}
          className="size-full"
        >
          <CarouselContent className="-ml-0 h-full">
            {photos.map((photo, index) => (
              <CarouselItem key={index} className="basis-full pl-0">
                <div
                  onClick={() => setIsLightboxOpen(true)}
                  className={cn(
                    "group relative flex h-[380px] w-full cursor-pointer items-center justify-center px-3 pt-12 sm:h-[480px] sm:px-6 md:h-[680px] lg:h-[760px]",
                    photos.length > 1 ? "pb-10 md:pb-24" : "pb-6"
                  )}
                >
                  <div className="relative size-full">
                    <Image
                      src={photo}
                      alt={`${title} - ${index + 1}`}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 768px) 100vw, 65vw"
                      className="object-contain object-center transition-transform duration-300 select-none group-hover:scale-[1.01]"
                    />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {photos.length > 1 && (
            <CarouselPrevious className="top-1/2 left-3 z-20 size-9 -translate-y-1/2 cursor-pointer rounded-full border border-white/15 bg-black/55 text-white shadow-lg backdrop-blur-md transition-all hover:border-white/30 hover:bg-black/85 hover:text-white active:scale-95" />
          )}

          {photos.length > 1 && (
            <CarouselNext className="top-1/2 right-3 z-20 size-9 -translate-y-1/2 cursor-pointer rounded-full border border-white/15 bg-black/55 text-white shadow-lg backdrop-blur-md transition-all hover:border-white/30 hover:bg-black/85 hover:text-white active:scale-95" />
          )}
        </Carousel>

        {/* Mobile Pagination Dots */}
        {photos.length > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex items-center justify-center gap-1.5 md:hidden">
            {photos.map((_, idx) => (
              <span
                key={idx}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  idx === current
                    ? "bg-primary shadow-primary w-5 shadow-xs"
                    : "w-1.5 bg-white/45"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Glassmorphic Desktop Thumbnail Dock */}
      {photos.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3.5 z-20 hidden justify-center px-4 md:flex">
          <div className="pointer-events-auto flex max-w-full items-center gap-2 rounded-2xl border border-white/15 bg-black/60 px-2.5 py-2 shadow-xl backdrop-blur-md">
            <button
              type="button"
              onClick={scrollPrev}
              className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Previous"
            >
              <ChevronLeft className="size-4" />
            </button>

            <div
              ref={thumbsContainerRef}
              className="flex max-w-[420px] scrollbar-none items-center gap-2 overflow-x-auto px-0.5 py-0.5"
            >
              {photos.map((photo, idx) => {
                const isActive = idx === current;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleThumbClick(idx)}
                    className={cn(
                      "relative size-11 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition-all lg:size-12",
                      isActive
                        ? "border-primary ring-primary/40 shadow-primary/30 scale-105 shadow-sm ring-2"
                        : "border-transparent opacity-60 hover:border-white/40 hover:opacity-100"
                    )}
                    aria-label={`${title} ${idx + 1}`}
                  >
                    <Image
                      src={photo}
                      alt={`${title} thumbnail ${idx + 1}`}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={scrollNext}
              className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Next"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Photo Lightbox Modal */}
      <PhotoLightbox
        images={photos}
        currentIndex={current}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onChangeIndex={(idx) => handleThumbClick(idx)}
        caption={title}
      />
    </div>
  );
}
