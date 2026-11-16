"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import {
  Calendar,
  Check,
  Clock,
  Flame,
  MapPin,
  Send,
  Share2,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { EventSummaryResDto, EventDetailResDto } from "@/services/events";
import { EventApplyDialog } from "./event-apply-dialog";
import { useAuthStore } from "@/store/use-auth-store";
import { useTranslations } from "next-intl";

export interface EventDetailModalProps {
  event: EventDetailResDto | EventSummaryResDto;
}

export function EventDetailModal({ event }: EventDetailModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const t = useTranslations("Events");
  const tDetail = useTranslations("Events.detail");

  const detail = event as EventDetailResDto;

  const handleClose = () => {
    setIsOpen(false);
    router.back();
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      toast.success(tDetail("shareSuccess"));
    }
  };

  const handleApplyClick = () => {
    if (isHydrating) return;
    if (!isAuthenticated) {
      toast.info(t("loginRequired"));
      router.push(`/auth/login?from=/events/${event.slug || event.id}`);
      return;
    }
    setIsApplyOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent
          showCloseButton={false}
          className="border-border/80 bg-card/95 fixed top-[50%] left-[50%] flex max-h-[90vh] w-[95vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col gap-0 overflow-hidden rounded-3xl border p-0 shadow-2xl backdrop-blur-2xl transition-all sm:max-w-3xl"
        >
          <DialogTitle className="sr-only">{event.title}</DialogTitle>

          {/* 1. Header Poster Image */}
          <div className="relative h-48 w-full shrink-0 overflow-hidden sm:h-64">
            <Image
              src={event.bannerImageUrl || event.imageUrl}
              alt={event.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover"
            />
            <div className="from-card via-card/40 absolute inset-0 bg-gradient-to-t to-transparent" />

            {/* Date Badge */}
            <div className="absolute top-4 left-4 z-10 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/85 px-3 py-1.5 text-center text-white shadow-xl backdrop-blur-md">
              <span className="text-xl leading-none font-black sm:text-2xl">
                {event.dayLabel}
              </span>
              <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase sm:text-xs">
                {event.monthLabel}
              </span>
            </div>

            {/* Location Badge & Close Button */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              <div className="border-primary/30 bg-primary/90 text-primary-foreground rounded-full border px-3 py-1 text-xs font-bold shadow-lg backdrop-blur-xs">
                {event.locationLabel}
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/75 text-white shadow-md backdrop-blur-md transition-all hover:bg-black/95 active:scale-95"
                aria-label={tDetail("close")}
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Title on bottom of banner */}
            <div className="absolute right-4 bottom-3 left-4 z-10 sm:right-6 sm:bottom-4 sm:left-6">
              <h2 className="text-foreground text-lg font-extrabold drop-shadow-md sm:text-2xl">
                {event.title}
              </h2>
              <p className="text-foreground/90 mt-1 flex items-center gap-1.5 text-xs">
                <MapPin className="text-primary size-3.5 shrink-0" />
                <span>{event.venue}</span>
              </p>
            </div>
          </div>

          {/* 2. Scrollable Body Info */}
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
            {/* Quick info badges row */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
              <div className="border-border/60 bg-muted/20 flex items-center gap-2.5 rounded-2xl border p-3">
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

              <div className="border-border/60 bg-muted/20 flex items-center gap-2.5 rounded-2xl border p-3">
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

              <div className="border-border/60 bg-muted/20 col-span-2 flex items-center gap-2.5 rounded-2xl border p-3 sm:col-span-1">
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
                <p className="text-foreground/85 text-xs leading-relaxed sm:text-sm">
                  {detail.description}
                </p>
              </div>
            )}

            {/* Participants / Cosplayers Khách mời */}
            {event.participants && event.participants.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="text-foreground flex items-center gap-2 text-sm font-bold">
                  <Users className="text-primary size-4" />
                  <span>{tDetail("guests")}</span>
                </h3>
                <div className="flex flex-wrap items-center gap-2.5">
                  {event.participants.map((p) => (
                    <Link
                      key={p.id}
                      href={`/cosplayer/${p.name.toLowerCase()}`}
                      className="border-border/60 bg-muted/20 hover:border-primary/50 flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 transition-colors"
                    >
                      <div className="border-primary/40 relative size-6 overflow-hidden rounded-full border">
                        <Image
                          src={p.avatarUrl}
                          alt={p.name}
                          fill
                          sizes="24px"
                          className="object-cover"
                        />
                      </div>
                      <span className="text-foreground text-xs font-semibold">
                        {p.name}
                      </span>
                      {p.isVerified && (
                        <Check className="text-primary size-3 stroke-[3]" />
                      )}
                    </Link>
                  ))}
                </div>
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
          </div>

          {/* 3. Footer Action Buttons */}
          <div className="border-border/70 bg-card/80 shrink-0 border-t p-3 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="border-border/80 h-9 cursor-pointer rounded-xl px-3 text-xs font-semibold"
              >
                <Share2 className="mr-1.5 size-3.5" />
                <span>{tDetail("share")}</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-9 cursor-pointer rounded-xl text-xs font-medium"
                >
                  {tDetail("close")}
                </Button>

                {event.isRecruiting && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleApplyClick}
                    disabled={isHydrating}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/25 h-9 cursor-pointer rounded-xl px-5 text-xs font-semibold shadow-md transition-transform active:scale-95 disabled:opacity-50"
                  >
                    <Send className="mr-1.5 size-3.5" />
                    <span>{isHydrating ? "..." : tDetail("applyBtn")}</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Application Form Dialog */}
      <EventApplyDialog
        open={isApplyOpen}
        onOpenChange={setIsApplyOpen}
        event={event}
      />
    </>
  );
}
