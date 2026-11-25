"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/common/user-avatar";
import { useTranslations } from "next-intl";
import type { EventSummaryResDto } from "@/services/events";
import { canApplyToEvent, getEventLifecycleLabel } from "./events-types";

export interface EventCardProps {
  event: EventSummaryResDto;
  onViewDetails?: (event: EventSummaryResDto) => void;
  onApply: (event: EventSummaryResDto) => void;
}

export function EventCard({ event, onApply }: EventCardProps) {
  const t = useTranslations("Events");
  const eventLink = `/events/${event.slug || event.id}`;
  const isRecruitingOpen = canApplyToEvent(event);
  const hasVerifiedParticipant = Boolean(
    event.participants?.some((p) => p.isVerified)
  );

  return (
    <article className="group border-border/80 hover:border-primary/40 bg-card relative flex flex-row overflow-hidden rounded-2xl border p-2.5 transition-colors duration-200 sm:flex-col sm:p-3">
      {/* 1. Poster Image (Links to Intercepting Route) */}
      <Link
        href={eventLink}
        scroll={false}
        className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-xl sm:aspect-[16/10] sm:w-full"
      >
        <Image
          src={event.imageUrl}
          alt={event.title}
          fill
          sizes="(max-width: 640px) 112px, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-opacity duration-300 group-hover:opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        {/* Top-Right Date Badge */}
        <div className="absolute top-2 right-2 flex flex-col items-center justify-center rounded-lg border border-white/15 bg-black/85 px-1.5 py-0.5 text-white tabular-nums sm:px-2 sm:py-1">
          <span className="text-xs leading-none font-extrabold sm:text-sm">
            {event.dayLabel}
          </span>
          <span className="text-[9px] leading-tight font-semibold text-white/90 uppercase sm:text-[10px]">
            {event.monthLabel}
          </span>
        </div>

        {/* Bottom-Right Location Badge (Desktop image overlay) */}
        <div className="absolute right-2 bottom-2 hidden rounded-md border border-white/15 bg-black/75 px-2 py-0.5 text-[11px] font-semibold text-white/95 sm:inline-flex">
          {event.locationLabel}
        </div>
      </Link>

      {/* 2. Content Info */}
      <div className="flex flex-1 flex-col justify-between pl-3 sm:pt-3 sm:pl-0">
        <div>
          {/* Location & Status for Mobile */}
          <div className="text-muted-foreground flex items-center gap-2 text-[11px] font-semibold tracking-wide uppercase sm:hidden">
            <span>{event.locationLabel}</span>
            <span>•</span>
            <span>{getEventLifecycleLabel(t, event.status)}</span>
          </div>

          {/* Participants Avatar Cluster */}
          {event.participants && event.participants.length > 0 && (
            <div className="mt-1 flex items-center gap-1.5 sm:mt-0">
              <span className="text-muted-foreground hidden text-[11px] font-medium sm:inline">
                {t("participatedBy")}
              </span>
              <div className="flex items-center -space-x-1.5">
                {event.participants.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    className="ring-card relative size-5 overflow-hidden rounded-full ring-2 sm:size-5.5"
                    title={p.name}
                  >
                    <UserAvatar
                      avatarUrl={p.avatarUrl}
                      name={p.name}
                      sizes="22px"
                      fallbackClassName="text-[9px]"
                    />
                  </div>
                ))}
              </div>
              {hasVerifiedParticipant && (
                <span
                  className="bg-primary text-primary-foreground inline-flex size-4 items-center justify-center rounded-full"
                  title={t("verified")}
                >
                  <Check className="size-2.5 stroke-[3]" aria-hidden="true" />
                </span>
              )}
            </div>
          )}

          {/* Event Title (Links to Intercepting Route) */}
          <Link href={eventLink} scroll={false} className="mt-1.5 block">
            <h3
              className="text-foreground hover:text-primary line-clamp-1 cursor-pointer text-sm font-bold transition-colors sm:text-base"
              title={event.title}
            >
              {event.title}
            </h3>
          </Link>

          <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs tabular-nums">
            {event.dateString}
          </p>
        </div>

        {/* 3. Action Buttons */}
        <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className={`border-border/80 hover:bg-muted/70 h-8 cursor-pointer rounded-xl px-2 text-[11px] font-medium sm:text-xs ${
              isRecruitingOpen ? "" : "col-span-2"
            }`}
          >
            <Link href={eventLink} scroll={false}>
              {t("viewDetails")}
            </Link>
          </Button>

          {isRecruitingOpen && (
            <Button
              type="button"
              size="sm"
              onClick={() => onApply(event)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 cursor-pointer rounded-xl px-2 text-[11px] font-semibold transition-colors sm:text-xs"
            >
              {t("applyNow")}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
