"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Star, Ticket, Calendar, MapPin, ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import type { EventSummaryResDto } from "@/services/events";
import { canApplyToEvent, getEventLifecycleLabel } from "./events-types";

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

  const isRecruitingOpen = canApplyToEvent(current);
  const eventLink = `/events/${current.slug || current.id}`;

  return (
    <div className="border-border/80 bg-card relative overflow-hidden rounded-2xl border sm:rounded-3xl">
      {/* Background artwork image */}
      <div className="relative h-60 w-full sm:h-72 md:h-80 lg:h-96">
        <Image
          src={current.bannerImageUrl || current.imageUrl}
          alt={current.title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover brightness-90 transition-opacity duration-500"
        />

        {/* Readability scrim gradients */}
        <div className="from-background via-background/70 sm:via-background/50 absolute inset-0 bg-gradient-to-t to-transparent" />
        <div className="from-background/90 via-background/55 absolute inset-0 bg-gradient-to-r to-transparent" />

        {/* Content Box Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 sm:p-6 md:p-8">
          {/* Top badge */}
          <div className="flex items-center gap-2">
            <span className="bg-primary/90 text-primary-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-wider uppercase sm:text-xs">
              <Star
                className="size-3 fill-amber-300 text-amber-300"
                aria-hidden="true"
              />
              <span>
                {current.isFeaturedFestival
                  ? t("spotlightBadge")
                  : getEventLifecycleLabel(t, current.status)}
              </span>
            </span>
          </div>

          {/* Bottom Title, details and CTA */}
          <div className="max-w-xl space-y-2.5 sm:space-y-3">
            <h1 className="text-foreground text-xl font-extrabold tracking-tight text-balance sm:text-2xl md:text-3xl lg:text-4xl">
              {current.title}
            </h1>

            <p className="text-foreground/90 flex flex-wrap items-center gap-2 text-xs font-semibold sm:text-sm">
              <span className="flex items-center gap-1">
                <MapPin className="text-primary size-3.5" aria-hidden="true" />
                <span>{current.locationLabel}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 tabular-nums">
                <Calendar
                  className="text-primary size-3.5"
                  aria-hidden="true"
                />
                <span>{current.dateString}</span>
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <Button
                asChild
                variant={isRecruitingOpen ? "outline" : "default"}
                className="border-border/80 bg-background/85 hover:bg-background h-9 cursor-pointer rounded-xl px-4 text-xs font-semibold sm:h-10 sm:px-5 sm:text-sm"
              >
                <Link href={eventLink} scroll={false}>
                  <span>{t("viewDetails")}</span>
                  <ArrowUpRight className="ml-1.5 size-4" aria-hidden="true" />
                </Link>
              </Button>

              {isRecruitingOpen && (
                <Button
                  type="button"
                  onClick={() => onRegisterClick(current)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 cursor-pointer rounded-xl px-5 text-xs font-bold transition-colors sm:h-10 sm:px-6 sm:text-sm"
                >
                  <Ticket className="mr-1.5 size-4" aria-hidden="true" />
                  <span>{t("applyNow")}</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Carousel Pill Indicators */}
        {festivals.length > 1 && (
          <div className="absolute right-4 bottom-4 z-20 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1.5 backdrop-blur-xs sm:right-8 sm:bottom-6">
            {festivals.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 cursor-pointer rounded-full transition-all ${
                  idx === currentIndex
                    ? "w-5 bg-white"
                    : "w-2 bg-white/45 hover:bg-white/75"
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
