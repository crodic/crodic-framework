"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Star, Ticket, Calendar, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import type { EventSummaryResDto } from "@/services/events";

export interface EventsHeroBannerProps {
  festivals?: EventSummaryResDto[];
  onRegisterClick: (festival: EventSummaryResDto) => void;
}

export function EventsHeroBanner({
  festivals = [],
  onRegisterClick,
}: EventsHeroBannerProps) {
  const t = useTranslations("Events");
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!festivals || festivals.length === 0) return null;

  const current = festivals[currentIndex] ?? festivals[0];
  if (!current) return null;

  return (
    <div className="border-border/80 bg-card relative overflow-hidden rounded-2xl border shadow-2xl sm:rounded-3xl">
      {/* Background artwork image */}
      <div className="relative h-56 w-full sm:h-72 md:h-80 lg:h-96">
        <Image
          src={current.bannerImageUrl || current.imageUrl}
          alt={current.title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover brightness-90 transition-all duration-700"
        />

        {/* Cinematic dark gradients matching the mockup */}
        <div className="from-background via-background/70 sm:via-background/50 absolute inset-0 bg-gradient-to-t to-transparent" />
        <div className="from-background/90 via-background/60 absolute inset-0 bg-gradient-to-r to-transparent" />

        {/* Content Box Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 sm:p-6 md:p-8">
          {/* Top tag / badge */}
          <div className="flex items-center gap-2">
            <span className="bg-primary/90 text-primary-foreground flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase shadow-sm backdrop-blur-xs sm:text-xs">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              <span>{t("spotlightBadge")}</span>
            </span>
          </div>

          {/* Bottom Title, details and CTA */}
          <div className="max-w-xl space-y-2 sm:space-y-3">
            <h1 className="text-foreground text-xl font-extrabold tracking-tight drop-shadow-md sm:text-2xl md:text-3xl lg:text-4xl">
              {current.title}
            </h1>

            <p className="text-foreground/90 flex items-center gap-2 text-xs font-semibold sm:text-sm">
              <span className="flex items-center gap-1">
                <MapPin className="text-primary size-3.5" />
                <span>{current.locationLabel}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="text-primary size-3.5" />
                <span>{current.dateString}</span>
              </span>
            </p>

            {/* CTA Button */}
            <div className="pt-1">
              <Button
                onClick={() => onRegisterClick(current)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/30 h-9 w-full cursor-pointer rounded-xl px-5 text-xs font-bold shadow-lg transition-all hover:scale-[1.02] sm:h-11 sm:w-auto sm:px-7 sm:text-sm"
              >
                <Ticket className="mr-1.5 size-4" />
                <span>{t("applyNow")}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Carousel Dots indicators */}
        {festivals.length > 1 && (
          <div className="absolute right-4 bottom-4 z-20 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-xs sm:right-8 sm:bottom-6">
            {festivals.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`size-2 cursor-pointer rounded-full transition-all sm:size-2.5 ${
                  idx === currentIndex
                    ? "scale-125 bg-white shadow-sm"
                    : "bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
