"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
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

    // Call reInit after Radix Dialog animation completes to ensure Embla measures correct dimensions
    const timer = setTimeout(() => {
      api.reInit();
    }, 100);

    return () => {
      clearTimeout(timer);
      api.off("select", onSelect);
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

  // Keep active thumbnail visible in strip
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

  return (
    <div className="flex size-full h-full flex-col justify-between gap-3 select-none">
      {/* 1. Main Photo Container with shadcn Carousel */}
      <div className="border-border/40 relative flex w-full items-center justify-center overflow-hidden rounded-2xl border bg-black shadow-inner">
        <Carousel
          setApi={setApi}
          opts={{
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-0">
            {photos.map((photo, index) => (
              <CarouselItem key={index} className="basis-full pl-0">
                {/* Explicit responsive pixel height ensures <Image fill /> renders properly without height 0 collapse */}
                <div
                  onClick={() => setIsLightboxOpen(true)}
                  className="group relative flex h-[360px] w-full cursor-pointer items-center justify-center sm:h-[440px] md:h-[490px] lg:h-[540px]"
                >
                  <Image
                    src={photo}
                    alt={`${title} - ảnh ${index + 1}`}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, 65vw"
                    className="object-contain object-center transition-transform duration-300 select-none group-hover:scale-[1.01]"
                  />
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <span className="flex items-center gap-1.5 rounded-xl bg-black/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                      <Maximize2 className="size-3.5" />
                      Phóng to toàn màn hình
                    </span>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Prev Arrow Button using shadcn CarouselPrevious */}
          {photos.length > 1 && (
            <CarouselPrevious className="top-1/2 left-3 z-20 size-8 -translate-y-1/2 rounded-full border border-white/10 bg-black/60 text-white shadow-md backdrop-blur-md transition-all hover:bg-black/90 active:scale-95 sm:size-9" />
          )}

          {/* Next Arrow Button using shadcn CarouselNext */}
          {photos.length > 1 && (
            <CarouselNext className="top-1/2 right-3 z-20 size-8 -translate-y-1/2 rounded-full border border-white/10 bg-black/60 text-white shadow-md backdrop-blur-md transition-all hover:bg-black/90 active:scale-95 sm:size-9" />
          )}
        </Carousel>

        {/* Mobile Pagination Dots */}
        {photos.length > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex items-center justify-center gap-1.5 md:hidden">
            {photos.map((_, idx) => (
              <span
                key={idx}
                className={cn(
                  "size-1.5 rounded-full transition-all duration-300",
                  idx === current
                    ? "bg-primary shadow-primary w-4 shadow-xs"
                    : "bg-white/50"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* 2. Desktop Bottom Thumbnail Strip */}
      {photos.length > 1 && (
        <div className="hidden h-14 shrink-0 items-center gap-2 px-1 md:flex">
          <button
            type="button"
            onClick={scrollPrev}
            className="bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors"
            aria-label="Thumbnails trước"
          >
            <ChevronLeft className="size-4" />
          </button>

          <div
            ref={thumbsContainerRef}
            className="flex flex-1 scrollbar-none items-center justify-center gap-2 overflow-x-auto py-1"
          >
            {photos.map((photo, idx) => {
              const isActive = idx === current;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleThumbClick(idx)}
                  className={cn(
                    "relative size-12 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition-all sm:size-14",
                    isActive
                      ? "border-primary ring-primary/40 shadow-primary/30 scale-105 shadow-sm ring-2"
                      : "hover:border-border border-transparent opacity-60 hover:opacity-100"
                  )}
                  aria-label={`Xem ảnh ${idx + 1}`}
                >
                  <Image
                    src={photo}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={scrollNext}
            className="bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors"
            aria-label="Thumbnails sau"
          >
            <ChevronRight className="size-4" />
          </button>
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
