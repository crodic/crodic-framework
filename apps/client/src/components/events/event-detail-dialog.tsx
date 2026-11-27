"use client";

import React from "react";
import Image from "next/image";
import {
  Building2,
  Calendar,
  Clock,
  Flame,
  MapPin,
  Send,
  Share2,
  Ticket,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { EventSummaryResDto, EventDetailResDto } from "@/services/events";
import { EventParticipants } from "./event-participants";

export interface EventDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: EventSummaryResDto | EventDetailResDto | null;
  onApply: (event: EventSummaryResDto | EventDetailResDto) => void;
}

export function EventDetailDialog({
  open,
  onOpenChange,
  event,
  onApply,
}: EventDetailDialogProps) {
  const tDetail = useTranslations("Events.detail");
  if (!event) return null;

  const detail = event as EventDetailResDto;

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      toast.success(tDetail("shareSuccess"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/80 max-h-[92vh] max-w-[calc(100%-1rem)] overflow-y-auto rounded-2xl p-0 shadow-2xl sm:max-w-2xl sm:rounded-3xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>

        {/* 1. Header Poster Image */}
        <div className="relative h-48 w-full overflow-hidden sm:h-64">
          <Image
            src={event.bannerImageUrl || event.imageUrl}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, 700px"
            className="object-cover"
          />
          <div className="from-background via-background/40 absolute inset-0 bg-gradient-to-t to-transparent" />

          {/* Date Badge */}
          <div className="absolute top-4 left-4 z-10 flex flex-col items-center justify-center rounded-xl bg-black/85 px-3 py-1.5 text-center text-white shadow-xl backdrop-blur-md">
            <span className="text-xl leading-none font-black">
              {event.dayLabel}
            </span>
            <span className="text-muted-foreground text-[10px] font-bold uppercase">
              {event.monthLabel}
            </span>
          </div>

          {/* Location Badge */}
          <div className="bg-primary/90 text-primary-foreground absolute top-4 right-4 z-10 rounded-full px-3 py-1 text-xs font-bold shadow-lg backdrop-blur-xs">
            {event.locationLabel}
          </div>

          {/* Title on bottom of image */}
          <div className="absolute right-4 bottom-4 left-4 z-10">
            <h2 className="text-foreground text-xl font-extrabold drop-shadow-sm sm:text-2xl">
              {event.title}
            </h2>
            <p className="text-foreground/90 mt-1 flex items-center gap-1.5 text-xs">
              <MapPin className="text-primary size-3.5 shrink-0" />
              <span>{event.venue}</span>
            </p>
          </div>
        </div>

        {/* 2. Body Info */}
        <div className="space-y-5 p-5 sm:p-6">
          {/* Quick info badges row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="border-border/60 bg-muted/20 flex items-center gap-2.5 rounded-xl border p-3">
              <Calendar className="text-primary size-4 shrink-0" />
              <div>
                <p className="text-muted-foreground text-[10px]">
                  {tDetail("time")}
                </p>
                <p className="text-foreground text-xs font-bold">
                  {event.dateString}
                </p>
              </div>
            </div>

            <div className="border-border/60 bg-muted/20 flex items-center gap-2.5 rounded-xl border p-3">
              <Ticket className="size-4 shrink-0 text-emerald-400" />
              <div>
                <p className="text-muted-foreground text-[10px]">
                  {tDetail("ticketPrice")}
                </p>
                <p className="text-foreground text-xs font-bold">
                  {event.ticketPriceLabel || tDetail("freeTicket")}
                </p>
              </div>
            </div>

            <div className="border-border/60 bg-muted/20 col-span-2 flex items-center gap-2.5 rounded-xl border p-3 sm:col-span-1">
              <Flame className="size-4 shrink-0 text-amber-400" />
              <div>
                <p className="text-muted-foreground text-[10px]">
                  {tDetail("status")}
                </p>
                <p className="text-primary text-xs font-bold">
                  {event.isRecruiting
                    ? tDetail("statusRecruiting")
                    : tDetail("statusClosed")}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {detail.description && (
            <div className="space-y-1.5">
              <h3 className="text-foreground text-sm font-bold">
                {tDetail("about")}
              </h3>
              <p className="text-foreground/80 text-xs leading-relaxed sm:text-sm">
                {detail.description}
              </p>
            </div>
          )}

          {/* Organizer */}
          {event.organizerName && (
            <div className="border-border/60 bg-muted/20 flex items-center gap-2.5 rounded-xl border p-3">
              <Building2 className="text-primary size-4 shrink-0" />
              <div>
                <p className="text-muted-foreground text-[10px]">
                  {tDetail("organizer")}
                </p>
                <p className="text-foreground text-xs font-bold">
                  {event.organizerName}
                </p>
              </div>
            </div>
          )}

          {/* Participants cosplayers */}
          {event.participantsCount > 0 && (
            <div className="space-y-2">
              <h3 className="text-foreground flex items-center gap-2 text-sm font-bold">
                <Users className="text-primary size-4" />
                <span>{tDetail("guests")}</span>
              </h3>
              <EventParticipants eventSlug={event.slug || event.id} />
            </div>
          )}

          {/* Schedule Timeline */}
          {detail.schedule && detail.schedule.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-foreground flex items-center gap-2 text-sm font-bold">
                <Clock className="text-primary size-4" />
                <span>{tDetail("schedule")}</span>
              </h3>
              <div className="border-border/60 bg-muted/10 space-y-2 rounded-2xl border p-3.5">
                {detail.schedule.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <span className="bg-primary/20 text-primary shrink-0 rounded-md px-2 py-0.5 font-bold">
                      {item.time}
                    </span>
                    <span className="text-foreground/90 pt-0.5">
                      {item.activity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="border-border/60 flex items-center justify-between gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="border-border/70 rounded-xl text-xs font-semibold"
            >
              <Share2 className="mr-1.5 size-3.5" />
              <span>{tDetail("share")}</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="rounded-xl text-xs"
              >
                {tDetail("close")}
              </Button>
              {event.isRecruiting && (
                <Button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    onApply(event);
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer rounded-xl px-5 text-xs font-semibold shadow-xs transition-colors"
                >
                  <Send className="mr-1.5 size-3.5" />
                  <span>{tDetail("applyBtn")}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
