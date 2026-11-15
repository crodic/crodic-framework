"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventItem } from "./events-types";

export interface EventCardProps {
  event: EventItem;
  onViewDetails?: (event: EventItem) => void;
  onApply: (event: EventItem) => void;
}

export function EventCard({ event, onViewDetails, onApply }: EventCardProps) {
  return (
    <article className="group border-border/70 bg-card hover:border-primary/40 relative flex flex-row overflow-hidden rounded-2xl border p-2.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:flex-col sm:p-3">
      {/* 1. Poster Image (Links to Intercepting Route) */}
      <Link
        href={`/events/${event.id}`}
        scroll={false}
        className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-xl sm:aspect-[16/10] sm:w-full"
      >
        <Image
          src={event.image}
          alt={event.title}
          fill
          sizes="(max-width: 640px) 112px, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        {/* Top-Right Date Badge */}
        <div className="absolute top-2 right-2 flex flex-col items-center justify-center rounded-lg border border-white/10 bg-black/85 px-1.5 py-0.5 text-white shadow-md backdrop-blur-xs sm:px-2 sm:py-1">
          <span className="text-xs leading-none font-extrabold sm:text-sm">
            {event.day}
          </span>
          <span className="text-[9px] leading-tight font-semibold text-white/90 uppercase sm:text-[10px]">
            {event.month}
          </span>
        </div>

        {/* Bottom-Right Location Badge (Desktop image overlay) */}
        <div className="absolute right-2 bottom-2 hidden rounded-md border border-white/15 bg-black/75 px-2 py-0.5 text-[11px] font-semibold text-white/95 backdrop-blur-xs sm:inline-flex">
          {event.location}
        </div>
      </Link>

      {/* 2. Content Info */}
      <div className="flex flex-1 flex-col justify-between pl-3 sm:pt-3 sm:pl-0">
        <div>
          {/* Location for Mobile */}
          <div className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase sm:hidden">
            {event.location}
          </div>

          {/* Participants Avatar Cluster */}
          <div className="mt-1 flex items-center gap-1.5 sm:mt-0">
            <span className="text-muted-foreground hidden text-[11px] font-medium sm:inline">
              Tham gia bởi:
            </span>
            <div className="flex items-center -space-x-1.5">
              {event.participants.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  className="ring-card relative size-5 overflow-hidden rounded-full ring-2 sm:size-5.5"
                  title={p.name}
                >
                  <Image
                    src={p.avatarUrl}
                    alt={p.name}
                    fill
                    sizes="22px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            {/* Blue verified badge matching the mockup */}
            <span
              className="inline-flex size-4 items-center justify-center rounded-full bg-blue-500 text-white shadow-2xs"
              title="Đã xác minh"
            >
              <Check className="size-2.5 stroke-[3]" />
            </span>
          </div>

          {/* Event Title (Links to Intercepting Route) */}
          <Link
            href={`/events/${event.id}`}
            scroll={false}
            className="mt-1.5 block"
          >
            <h3
              className="text-foreground hover:text-primary line-clamp-1 cursor-pointer text-sm font-bold transition-colors sm:text-base"
              title={event.title}
            >
              {event.title}
            </h3>
          </Link>
        </div>

        {/* 3. Action Buttons */}
        <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-border/80 hover:bg-muted/70 h-8 cursor-pointer rounded-xl px-2 text-[11px] font-medium sm:text-xs"
          >
            <Link href={`/events/${event.id}`} scroll={false}>
              Xem chi tiết
            </Link>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => onApply(event)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 cursor-pointer rounded-xl px-2 text-[11px] font-semibold shadow-2xs transition-transform active:scale-95 sm:text-xs"
          >
            Ứng tuyển
          </Button>
        </div>
      </div>
    </article>
  );
}
