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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { EventItem } from "./events-types";
import { EventApplyDialog } from "./event-apply-dialog";
import { useAuthStore } from "@/store/use-auth-store";

export interface EventDetailContentProps {
  event: EventItem;
  onClose?: () => void;
  isModal?: boolean;
}

export function EventDetailContent({
  event,
  onClose,
  isModal = false,
}: EventDetailContentProps) {
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      toast.success("Đã sao chép liên kết sự kiện vào clipboard!");
    }
  };

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để ứng tuyển tham gia sự kiện!");
      router.push(`/auth/login?from=/events/${event.id}`);
      return;
    }
    setIsApplyOpen(true);
  };

  return (
    <div className="flex flex-col">
      {/* 1. Header Poster Image */}
      <div className="relative h-56 w-full overflow-hidden sm:h-72 md:h-80">
        <Image
          src={event.image}
          alt={event.title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 900px"
          className="object-cover"
        />
        <div className="from-background via-background/40 absolute inset-0 bg-gradient-to-t to-transparent" />

        {/* Date Badge */}
        <div className="absolute top-4 left-4 z-10 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/85 px-3 py-1.5 text-center text-white shadow-xl backdrop-blur-md">
          <span className="text-xl leading-none font-black sm:text-2xl">
            {event.day}
          </span>
          <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase sm:text-xs">
            {event.month}
          </span>
        </div>

        {/* Location Badge */}
        <div className="border-primary/30 bg-primary/90 text-primary-foreground absolute top-4 right-4 z-10 rounded-full border px-3.5 py-1 text-xs font-bold shadow-lg backdrop-blur-xs">
          {event.location}
        </div>

        {/* Title on bottom of banner */}
        <div className="absolute right-4 bottom-4 left-4 z-10 sm:right-6 sm:bottom-6 sm:left-6">
          <h1 className="text-foreground text-xl font-extrabold drop-shadow-md sm:text-2xl md:text-3xl">
            {event.title}
          </h1>
          <p className="text-foreground/90 mt-1.5 flex items-center gap-1.5 text-xs sm:text-sm">
            <MapPin className="text-primary size-4 shrink-0" />
            <span>{event.venue}</span>
          </p>
        </div>
      </div>

      {/* 2. Body Info */}
      <div className="space-y-6 p-4 sm:p-6 md:p-8">
        {/* Quick info badges row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="border-border/60 bg-muted/20 flex items-center gap-3 rounded-2xl border p-3 sm:p-4">
            <Calendar className="text-primary size-5 shrink-0" />
            <div>
              <p className="text-muted-foreground text-[11px]">Thời gian</p>
              <p className="text-foreground text-xs font-bold sm:text-sm">
                {event.dateString}
              </p>
            </div>
          </div>

          <div className="border-border/60 bg-muted/20 flex items-center gap-3 rounded-2xl border p-3 sm:p-4">
            <Ticket className="size-5 shrink-0 text-emerald-400" />
            <div>
              <p className="text-muted-foreground text-[11px]">
                Giá vé vào cổng
              </p>
              <p className="text-foreground text-xs font-bold sm:text-sm">
                {event.ticketPrice || "Miễn phí"}
              </p>
            </div>
          </div>

          <div className="border-border/60 bg-muted/20 col-span-2 flex items-center gap-3 rounded-2xl border p-3 sm:col-span-1 sm:p-4">
            <Flame className="size-5 shrink-0 text-amber-400" />
            <div>
              <p className="text-muted-foreground text-[11px]">Trạng thái</p>
              <p className="text-primary text-xs font-bold sm:text-sm">
                {event.isRecruiting
                  ? "Đang tuyển Cosplayer"
                  : "Đã chốt danh sách"}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-foreground text-sm font-bold sm:text-base">
            Giới thiệu sự kiện
          </h3>
          <p className="text-foreground/85 text-xs leading-relaxed sm:text-sm">
            {event.description}
          </p>
        </div>

        {/* Participants cosplayers */}
        <div className="space-y-2.5">
          <h3 className="text-foreground flex items-center gap-2 text-sm font-bold sm:text-base">
            <Users className="text-primary size-4" />
            <span>Cosplayers & Khách mời tham gia</span>
          </h3>
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {event.participants.map((p) => (
              <Link
                key={p.id}
                href={`/cosplayer/${p.name.toLowerCase()}`}
                className="border-border/60 bg-muted/20 hover:border-primary/50 flex items-center gap-2 rounded-full border py-1 pr-3.5 pl-1 transition-colors"
              >
                <div className="border-primary/40 relative size-6.5 overflow-hidden rounded-full border">
                  <Image
                    src={p.avatarUrl}
                    alt={p.name}
                    fill
                    sizes="26px"
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

        {/* Schedule Timeline */}
        {event.schedule && event.schedule.length > 0 && (
          <div className="space-y-2.5">
            <h3 className="text-foreground flex items-center gap-2 text-sm font-bold sm:text-base">
              <Clock className="text-primary size-4" />
              <span>Lịch trình hoạt động</span>
            </h3>
            <div className="border-border/60 bg-muted/10 space-y-2.5 rounded-2xl border p-4">
              {event.schedule.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 text-xs sm:text-sm"
                >
                  <span className="bg-primary/20 text-primary shrink-0 rounded-lg px-2.5 py-0.5 font-bold">
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
            className="border-border/70 cursor-pointer rounded-xl text-xs font-semibold"
          >
            <Share2 className="mr-1.5 size-3.5" />
            <span>Chia sẻ</span>
          </Button>

          <div className="flex items-center gap-2">
            {isModal && onClose && (
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="cursor-pointer rounded-xl text-xs font-medium"
              >
                Đóng
              </Button>
            )}

            {event.isRecruiting && (
              <Button
                type="button"
                onClick={handleApplyClick}
                className="bg-primary text-primary-foreground shadow-primary/25 hover:bg-primary/90 cursor-pointer rounded-xl px-5 text-xs font-semibold shadow-md"
              >
                <Send className="mr-1.5 size-3.5" />
                <span>Ứng tuyển tham gia</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Event Apply Dialog (Requires Auth) */}
      <EventApplyDialog
        open={isApplyOpen}
        onOpenChange={setIsApplyOpen}
        event={event}
      />
    </div>
  );
}
