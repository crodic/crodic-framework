"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Ticket, Calendar, MapPin, ArrowUpRight } from "lucide-react";
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
    <div className="border-border/80 bg-card relative overflow-hidden rounded-2xl border">
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
            <span className="bg-background text-foreground inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium">
              <span>
                {current.isFeaturedFestival
                  ? t("spotlightBadge")
                  : getEventLifecycleLabel(t, current.status)}
              </span>
            </span>
          </div>

          {/* Bottom Title, details and CTA */}
          <div className="max-w-xl space-y-2.5 sm:space-y-3">
            <h2 className="page-title line-clamp-2">{current.title}</h2>

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
                className="h-10 rounded-lg px-3"
              >
                <Link href={eventLink}>
                  <span>{t("viewDetails")}</span>
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>

              {isRecruitingOpen && (
                <Button
                  type="button"
                  onClick={() => onRegisterClick(current)}
                  className="h-10 rounded-lg px-3"
                >
                  <Ticket className="size-4" aria-hidden="true" />
                  <span>{t("applyNow")}</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Carousel Pill Indicators */}
        {festivals.length > 1 && (
          <div className="bg-background absolute top-4 right-4 z-20 flex max-w-[55%] flex-wrap items-center rounded-lg px-1 sm:top-6 sm:right-6 md:top-8 md:right-8">
            {festivals.map((festival, idx) => (
              <button
                key={festival.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className="focus-visible:ring-ring grid size-7 cursor-pointer place-items-center rounded-md focus-visible:ring-2"
                aria-label={festival.title}
                aria-pressed={idx === currentIndex}
              >
                <span
                  className={
                    idx === currentIndex
                      ? "bg-primary h-2 w-4 rounded-full"
                      : "bg-muted-foreground size-2 rounded-full"
                  }
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
