"use client";

import React, { useState } from "react";
import Image from "next/image";
import { UserAvatar } from "@/components/common/user-avatar";
import { Link, useRouter } from "@/i18n/navigation";
import {
  Building2,
  Calendar,
  Check,
  Clock,
  ExternalLink,
  Flame,
  Info,
  MapPin,
  Send,
  Share2,
  ShieldAlert,
  Ticket,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { EventDetailResDto, EventSummaryResDto } from "@/services/events";
import { EventApplyDialog } from "./event-apply-dialog";
import { useAuthStore } from "@/store/use-auth-store";
import { useTranslations } from "next-intl";

export interface EventStandaloneViewProps {
  event: EventDetailResDto | EventSummaryResDto;
}

export function EventStandaloneView({ event }: EventStandaloneViewProps) {
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const router = useRouter();
  const t = useTranslations("Events");
  const tDetail = useTranslations("Events.detail");
  const tStandalone = useTranslations("Events.standalone");

  const detail = event as EventDetailResDto;

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
    <div className="space-y-6 sm:space-y-8">
      {/* 1. HERO BANNER HEADER */}
      <div className="border-border/80 bg-card/60 relative overflow-hidden rounded-3xl border shadow-xl">
        <div className="relative h-64 w-full sm:h-80 md:h-96 lg:h-[420px]">
          <Image
            src={event.bannerImageUrl || event.imageUrl}
            alt={event.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="from-background via-background/60 sm:via-background/40 absolute inset-0 bg-gradient-to-t to-transparent" />
          <div className="from-background/90 via-background/40 absolute inset-0 bg-gradient-to-r to-transparent" />

          {/* Top Floating Badges */}
          <div className="absolute top-4 right-4 left-4 z-10 flex items-center justify-between sm:top-6 sm:right-6 sm:left-6">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/85 px-3 py-1.5 text-center text-white shadow-xl backdrop-blur-md sm:px-4 sm:py-2">
              <span className="text-xl leading-none font-black sm:text-3xl">
                {event.dayLabel}
              </span>
              <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase sm:text-xs">
                {event.monthLabel}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="border-primary/30 bg-primary text-primary-foreground rounded-full border px-3 py-1 text-xs font-bold shadow-lg">
                {event.locationLabel}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="h-8 rounded-full border-white/20 bg-black/60 px-3 text-xs text-white backdrop-blur-md hover:bg-black/80"
              >
                <Share2 className="mr-1.5 size-3.5" />
                <span className="hidden sm:inline">{tDetail("share")}</span>
              </Button>
            </div>
          </div>

          {/* Bottom Title & Quick Info */}
          <div className="absolute right-4 bottom-4 left-4 z-10 space-y-2 sm:right-8 sm:bottom-8 sm:left-8 sm:space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {event.isRecruiting && (
                <span className="bg-primary/90 text-primary-foreground flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-bold shadow-sm">
                  <Flame className="size-3.5 fill-amber-300 text-amber-300" />
                  <span>{tStandalone("statusRecruitingLive")}</span>
                </span>
              )}
              {event.categories &&
                event.categories.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-white/20 bg-black/50 px-2.5 py-0.5 text-xs font-medium text-white/90 backdrop-blur-xs"
                  >
                    {c}
                  </span>
                ))}
            </div>

            <h1 className="text-foreground text-2xl font-black tracking-tight drop-shadow-md sm:text-3xl md:text-4xl lg:text-5xl">
              {event.title}
            </h1>

            <div className="text-foreground/90 flex flex-wrap items-center gap-4 text-xs font-semibold sm:text-sm">
              <span className="flex items-center gap-1.5">
                <MapPin className="text-primary size-4" />
                <span>{event.venue}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="text-primary size-4" />
                <span>{event.dateString}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TWO-COLUMN LAYOUT: Content & Sidebar */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
        {/* LEFT COLUMN: Main Information (8 cols) */}
        <div className="space-y-6 lg:col-span-8">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="border-border/70 bg-card/70 flex items-center gap-3 rounded-2xl border p-4 shadow-xs backdrop-blur-md">
              <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                <Calendar className="size-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-[11px] font-medium">
                  {tDetail("time")}
                </p>
                <p className="text-foreground text-xs font-bold sm:text-sm">
                  {event.dateString}
                </p>
              </div>
            </div>

            <div className="border-border/70 bg-card/70 flex items-center gap-3 rounded-2xl border p-4 shadow-xs backdrop-blur-md">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Ticket className="size-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-[11px] font-medium">
                  {tDetail("ticketPrice")}
                </p>
                <p className="text-foreground text-xs font-bold sm:text-sm">
                  {event.ticketPriceLabel || tDetail("freeTicket")}
                </p>
              </div>
            </div>

            <div className="border-border/70 bg-card/70 col-span-2 flex items-center gap-3 rounded-2xl border p-4 shadow-xs backdrop-blur-md sm:col-span-1">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Flame className="size-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-[11px] font-medium">
                  {tDetail("status")}
                </p>
                <p className="text-primary text-xs font-bold sm:text-sm">
                  {event.isRecruiting
                    ? tDetail("statusRecruiting")
                    : tDetail("statusClosed")}
                </p>
              </div>
            </div>
          </div>

          {/* About & Description Section */}
          <div className="border-border/70 bg-card/70 space-y-3 rounded-3xl border p-6 shadow-xs backdrop-blur-md sm:p-7">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                <Info className="size-4.5" />
              </div>
              <h2 className="text-foreground text-lg font-bold sm:text-xl">
                {tDetail("about")}
              </h2>
            </div>
            <p className="text-foreground/85 text-xs leading-relaxed whitespace-pre-line sm:text-sm sm:leading-7">
              {detail.description || event.title}
            </p>
            {event.organizerName && (
              <div className="border-border/60 bg-muted/20 flex items-center gap-2.5 rounded-2xl border p-3.5">
                <Building2 className="text-primary size-4 shrink-0" />
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">
                    {tDetail("organizer")}
                  </p>
                  <p className="text-foreground text-xs font-bold sm:text-sm">
                    {event.organizerName}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Featured Guests / Cosplayers */}
          {event.participants && event.participants.length > 0 && (
            <div className="border-border/70 bg-card/70 space-y-4 rounded-3xl border p-6 shadow-xs backdrop-blur-md sm:p-7">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                  <Users className="size-4.5" />
                </div>
                <h2 className="text-foreground text-lg font-bold sm:text-xl">
                  {tDetail("guests")}
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {event.participants.map((p) => (
                  <Link
                    key={p.id}
                    href={`/cosplayer/${p.name.toLowerCase()}`}
                    className="border-border/70 bg-muted/20 hover:border-primary/50 group flex items-center gap-3 rounded-2xl border p-3 transition-all hover:-translate-y-0.5"
                  >
                    <div className="border-primary/40 relative size-10 shrink-0 overflow-hidden rounded-full border">
                      <UserAvatar
                        avatarUrl={p.avatarUrl}
                        name={p.name}
                        sizes="40px"
                        fallbackClassName="text-xs"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-foreground group-hover:text-primary truncate text-xs font-bold">
                          {p.name}
                        </span>
                        {p.isVerified && (
                          <Check className="text-primary size-3 shrink-0 stroke-[3]" />
                        )}
                      </div>
                      <p className="text-muted-foreground text-[11px]">
                        {p.roleLabel || tStandalone("specialGuest")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Timeline / Schedule */}
          {detail.schedule && detail.schedule.length > 0 && (
            <div className="border-border/70 bg-card/70 space-y-4 rounded-3xl border p-6 shadow-xs backdrop-blur-md sm:p-7">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                  <Clock className="size-4.5" />
                </div>
                <h2 className="text-foreground text-lg font-bold sm:text-xl">
                  {tDetail("schedule")}
                </h2>
              </div>
              <div className="border-border/60 bg-muted/10 divide-border/50 divide-y rounded-2xl border">
                {detail.schedule.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-3.5 text-xs sm:text-sm"
                  >
                    <span className="bg-primary/20 text-primary shrink-0 rounded-md px-2.5 py-1 font-bold">
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

          {/* Rules / Regulations */}
          <div className="border-border/70 bg-card/70 space-y-3 rounded-3xl border p-6 shadow-xs backdrop-blur-md sm:p-7">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-400">
                <ShieldAlert className="size-4.5" />
              </div>
              <h2 className="text-foreground text-lg font-bold sm:text-xl">
                {tStandalone("rules")}
              </h2>
            </div>
            <p className="text-foreground/80 text-xs leading-relaxed sm:text-sm">
              {tStandalone("rulesDesc")}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Registration & Venue Card (4 cols) */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:col-span-4">
          {/* Card 1: Registration & Tickets */}
          <div className="border-primary/40 bg-card/90 shadow-primary/5 space-y-5 rounded-3xl border p-6 shadow-xl backdrop-blur-xl">
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                {tDetail("ticketPrice")}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-primary text-2xl font-black sm:text-3xl">
                  {event.ticketPriceLabel || tDetail("freeTicket")}
                </span>
              </div>
            </div>

            {/* Recruitment status pill */}
            <div className="border-border/70 bg-muted/30 space-y-1.5 rounded-2xl border p-3.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">
                  {tDetail("status")}
                </span>
                <span className="text-primary font-bold">
                  {event.isRecruiting
                    ? tStandalone("statusRecruitingLive")
                    : tDetail("statusClosed")}
                </span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                {tStandalone("applyCardDesc")}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              {event.isRecruiting ? (
                <Button
                  type="button"
                  onClick={handleApplyClick}
                  disabled={isHydrating}
                  className="bg-primary text-primary-foreground shadow-primary/25 hover:bg-primary/90 h-11 w-full cursor-pointer rounded-xl text-sm font-bold shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                >
                  <Send className="mr-2 size-4" />
                  <span>{isHydrating ? "..." : tDetail("applyBtn")}</span>
                </Button>
              ) : (
                <Button
                  disabled
                  className="h-11 w-full rounded-xl text-sm font-semibold opacity-60"
                >
                  {tDetail("statusClosed")}
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={handleShare}
                className="border-border/80 text-foreground hover:bg-muted h-10 w-full cursor-pointer rounded-xl text-xs font-semibold"
              >
                <Share2 className="mr-2 size-3.5" />
                <span>{tDetail("share")}</span>
              </Button>
            </div>
          </div>

          {/* Card 2: Venue Guide & Map Address */}
          <div className="border-border/70 bg-card/70 space-y-3.5 rounded-3xl border p-6 shadow-xs backdrop-blur-md">
            <h3 className="text-foreground flex items-center gap-2 text-sm font-bold">
              <MapPin className="text-primary size-4" />
              <span>{event.locationLabel}</span>
            </h3>

            <div className="space-y-1">
              <p className="text-foreground text-xs font-bold sm:text-sm">
                {event.venue}
              </p>
            </div>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-border/70 w-full cursor-pointer rounded-xl text-xs font-medium"
            >
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  event.venue + " " + event.locationLabel
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-1.5 size-3.5" />
                <span>Google Maps</span>
              </a>
            </Button>
          </div>
        </aside>
      </div>

      {/* Application Form Dialog */}
      <EventApplyDialog
        open={isApplyOpen}
        onOpenChange={setIsApplyOpen}
        event={event}
      />
    </div>
  );
}
