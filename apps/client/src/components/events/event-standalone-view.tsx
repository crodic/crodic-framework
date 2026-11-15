"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import {
  ArrowLeft,
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
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { EventItem } from "./events-types";
import { EventApplyDialog } from "./event-apply-dialog";
import { useAuthStore } from "@/store/use-auth-store";
import { cn } from "@/lib/utils";

export interface EventStandaloneViewProps {
  event: EventItem;
}

export function EventStandaloneView({ event }: EventStandaloneViewProps) {
  const router = useRouter();
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/events");
    }
  };

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
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      {/* 1. Top Navigation & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          onClick={handleBack}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer gap-2 rounded-xl text-xs font-semibold sm:text-sm"
        >
          <ArrowLeft className="size-4" />
          <span>Quay lại sự kiện</span>
        </Button>

        <div className="text-muted-foreground hidden items-center gap-2 text-xs md:flex">
          <Link href="/" className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/events" className="hover:text-primary transition-colors">
            Sự kiện
          </Link>
          <span>/</span>
          <span className="text-foreground max-w-[200px] truncate font-semibold">
            {event.title}
          </span>
        </div>
      </div>

      {/* 2. Cinematic Hero Banner */}
      <div className="border-border/80 relative h-[320px] w-full overflow-hidden rounded-3xl border shadow-2xl sm:h-[420px] lg:h-[480px]">
        <Image
          src={event.image}
          alt={event.title}
          fill
          priority
          sizes="(max-width: 1600px) 100vw, 1600px"
          className="object-cover"
        />
        {/* Cinematic dark violet vignette gradient */}
        <div className="from-background via-background/60 absolute inset-0 bg-gradient-to-t to-transparent" />
        <div className="from-background/80 absolute inset-0 hidden bg-gradient-to-r via-transparent to-transparent sm:block" />

        {/* Floating Date Emblem */}
        <div className="border-primary/30 absolute top-4 left-4 z-10 flex flex-col items-center justify-center rounded-2xl border bg-black/85 px-3.5 py-2 text-center text-white shadow-2xl backdrop-blur-md sm:top-6 sm:left-6 sm:px-4 sm:py-2.5">
          <span className="text-primary text-2xl leading-none font-black sm:text-3xl">
            {event.day}
          </span>
          <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase sm:text-xs">
            {event.month}
          </span>
        </div>

        {/* Floating Location & Category Badges */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 sm:top-6 sm:right-6">
          <span className="border-primary/40 bg-primary/90 text-primary-foreground rounded-full border px-3.5 py-1 text-xs font-bold shadow-lg backdrop-blur-xs">
            {event.location}
          </span>
          {event.categories && event.categories[0] && (
            <span className="hidden rounded-full border border-white/20 bg-black/75 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-xs sm:inline-flex">
              {event.categories[0]}
            </span>
          )}
        </div>

        {/* Title, Venue & Quick Meta at bottom of banner */}
        <div className="absolute right-4 bottom-5 left-4 z-10 space-y-2 sm:right-8 sm:bottom-8 sm:left-8">
          <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-xl sm:text-4xl lg:text-5xl">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-white/90 sm:text-sm">
            <span className="flex items-center gap-1.5 font-medium drop-shadow-sm">
              <MapPin className="text-primary size-4 shrink-0" />
              <span>{event.venue}</span>
            </span>
            <span className="text-white/40">•</span>
            <span className="flex items-center gap-1.5 font-medium drop-shadow-sm">
              <Calendar className="text-primary size-4 shrink-0" />
              <span>Ngày {event.dateString}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* ======================================================== */}
        {/* LEFT COLUMN: Event Details & Program (8 cols)            */}
        {/* ======================================================== */}
        <div className="space-y-8 lg:col-span-8">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            <div className="border-border/70 bg-card/70 flex items-center gap-3.5 rounded-2xl border p-4 shadow-xs backdrop-blur-md">
              <div className="bg-primary/10 text-primary border-primary/20 flex size-11 shrink-0 items-center justify-center rounded-xl border">
                <Calendar className="size-5.5" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium">
                  Thời gian diễn ra
                </p>
                <p className="text-foreground text-sm font-bold sm:text-base">
                  {event.dateString}
                </p>
              </div>
            </div>

            <div className="border-border/70 bg-card/70 flex items-center gap-3.5 rounded-2xl border p-4 shadow-xs backdrop-blur-md">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                <Ticket className="size-5.5" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium">
                  Giá vé vào cổng
                </p>
                <p className="text-foreground text-sm font-bold sm:text-base">
                  {event.ticketPrice || "Miễn phí"}
                </p>
              </div>
            </div>

            <div className="border-border/70 bg-card/70 col-span-2 flex items-center gap-3.5 rounded-2xl border p-4 shadow-xs backdrop-blur-md sm:col-span-1">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
                <Flame className="size-5.5" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium">
                  Trạng thái tuyển
                </p>
                <p className="text-primary flex items-center gap-1.5 text-xs font-bold sm:text-sm">
                  <span className="relative flex size-2">
                    <span className="bg-primary absolute inline-flex size-full animate-ping rounded-full opacity-75" />
                    <span className="bg-primary relative inline-flex size-2 rounded-full" />
                  </span>
                  {event.isRecruiting ? "Đang mở tuyển" : "Đã chốt danh sách"}
                </p>
              </div>
            </div>
          </div>

          {/* Section: Giới thiệu sự kiện */}
          <div className="border-border/70 bg-card/70 space-y-4 rounded-3xl border p-6 shadow-xs backdrop-blur-md sm:p-8">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary border-primary/20 flex size-8 items-center justify-center rounded-lg border">
                <Sparkles className="size-4.5" />
              </div>
              <h2 className="text-foreground text-lg font-bold sm:text-xl">
                Giới thiệu sự kiện
              </h2>
            </div>

            <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-line sm:text-base">
              {event.description}
            </p>

            {/* Highlights Grid */}
            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
              <div className="border-border/60 bg-muted/20 space-y-1 rounded-2xl border p-4">
                <h4 className="text-foreground flex items-center gap-1.5 text-xs font-bold sm:text-sm">
                  <Check className="text-primary size-4" />
                  Quy mô 500+ Cosplayer
                </h4>
                <p className="text-muted-foreground text-xs">
                  Giao lưu và check-in cùng hàng trăm cosplayer chuyên nghiệp và
                  cộng đồng fan anime/game.
                </p>
              </div>

              <div className="border-border/60 bg-muted/20 space-y-1 rounded-2xl border p-4">
                <h4 className="text-foreground flex items-center gap-1.5 text-xs font-bold sm:text-sm">
                  <Check className="text-primary size-4" />
                  Photobooth Ánh Sáng Studio
                </h4>
                <p className="text-muted-foreground text-xs">
                  Trang bị sẵn khu vực chụp ảnh studio với hệ thống đèn neon
                  cyberpunk đa sắc màu.
                </p>
              </div>

              <div className="border-border/60 bg-muted/20 space-y-1 rounded-2xl border p-4">
                <h4 className="text-foreground flex items-center gap-1.5 text-xs font-bold sm:text-sm">
                  <Check className="text-primary size-4" />
                  Sân Khấu Catwalk & Âm Nhạc
                </h4>
                <p className="text-muted-foreground text-xs">
                  Biểu diễn vũ đạo, catwalk runway và chung kết cosplay contest
                  với giải thưởng hấp dẫn.
                </p>
              </div>

              <div className="border-border/60 bg-muted/20 space-y-1 rounded-2xl border p-4">
                <h4 className="text-foreground flex items-center gap-1.5 text-xs font-bold sm:text-sm">
                  <Check className="text-primary size-4" />
                  Khu Gian Hàng Artist & Đạo Cụ
                </h4>
                <p className="text-muted-foreground text-xs">
                  Khám phá hơn 50 gian hàng art print, phụ kiện trang phục, tóc
                  giả và đạo cụ handmade.
                </p>
              </div>
            </div>
          </div>

          {/* Section: Cosplayers & Khách mời tham gia */}
          <div className="border-border/70 bg-card/70 space-y-4 rounded-3xl border p-6 shadow-xs backdrop-blur-md sm:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 text-primary border-primary/20 flex size-8 items-center justify-center rounded-lg border">
                  <Users className="size-4.5" />
                </div>
                <h2 className="text-foreground text-lg font-bold sm:text-xl">
                  Cosplayers & Khách mời tiêu điểm
                </h2>
              </div>

              <span className="text-primary text-xs font-semibold">
                {event.participants.length} khách mời
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {event.participants.map((p) => (
                <div
                  key={p.id}
                  className="group border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/30 flex items-center justify-between rounded-2xl border p-3 transition-all"
                >
                  <Link
                    href={`/cosplayer/${p.name.toLowerCase()}`}
                    className="flex min-w-0 items-center gap-3"
                  >
                    <div className="border-primary/40 ring-primary/20 relative size-12 shrink-0 overflow-hidden rounded-full border-2 ring-2 transition-transform group-hover:scale-105">
                      <Image
                        src={p.avatarUrl}
                        alt={p.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-foreground group-hover:text-primary truncate text-sm font-bold transition-colors">
                          {p.name}
                        </span>
                        {p.isVerified && (
                          <Check className="text-primary size-3.5 shrink-0 stroke-[3]" />
                        )}
                      </div>
                      <p className="text-muted-foreground truncate text-[11px]">
                        Guest Cosplayer
                      </p>
                    </div>
                  </Link>

                  <Button
                    asChild
                    size="sm"
                    variant="ghost"
                    className="text-primary hover:bg-primary/10 h-8 rounded-xl px-2.5 text-xs"
                  >
                    <Link href={`/cosplayer/${p.name.toLowerCase()}`}>
                      Hồ sơ
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Lịch trình hoạt động chi tiết */}
          {event.schedule && event.schedule.length > 0 && (
            <div className="border-border/70 bg-card/70 space-y-4 rounded-3xl border p-6 shadow-xs backdrop-blur-md sm:p-8">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 text-primary border-primary/20 flex size-8 items-center justify-center rounded-lg border">
                  <Clock className="size-4.5" />
                </div>
                <h2 className="text-foreground text-lg font-bold sm:text-xl">
                  Lịch trình hoạt động sự kiện
                </h2>
              </div>

              <div className="before:bg-border/80 relative space-y-6 pl-6 before:absolute before:top-2 before:bottom-2 before:left-2 before:w-0.5">
                {event.schedule.map((item, idx) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    {/* Glowing timeline dot */}
                    <span className="bg-background border-primary absolute top-1.5 -left-6 flex size-4 items-center justify-center rounded-full border-2">
                      <span className="bg-primary size-1.5 rounded-full" />
                    </span>

                    <div className="border-border/60 bg-muted/20 hover:border-border flex-1 rounded-2xl border p-4 transition-colors">
                      <span className="bg-primary/15 text-primary inline-block rounded-lg px-2.5 py-0.5 font-mono text-xs font-bold">
                        {item.time}
                      </span>
                      <h4 className="text-foreground mt-1 text-sm font-bold sm:text-base">
                        {item.activity}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Quy định & Lưu ý an toàn */}
          <div className="border-border/70 bg-card/70 space-y-3 rounded-3xl border p-6 shadow-xs backdrop-blur-md sm:p-8">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-400">
                <ShieldAlert className="size-4.5" />
              </div>
              <h2 className="text-foreground text-lg font-bold sm:text-xl">
                Quy định & Lưu ý dành cho Cosplayer
              </h2>
            </div>

            <ul className="text-foreground/80 list-disc space-y-2 pl-5 text-xs leading-relaxed sm:text-sm">
              <li>
                <strong>Đạo cụ vũ khí:</strong> Chỉ chấp nhận đạo cụ làm bằng
                xốp EVA, nhựa dẻo, gỗ nhẹ hoặc giấy bồi. Nghiêm cấm mang vũ khí
                kim loại sắc nhọn hoặc vật liệu dễ gây thương tích.
              </li>
              <li>
                <strong>Trang phục hóa thân:</strong> Đảm bảo văn minh, lịch sự,
                có trang bị quần lót bảo hộ và phù hợp với thuần phong mỹ tục
                nơi công cộng.
              </li>
              <li>
                <strong>Chụp ảnh & Giao lưu:</strong> Luôn hỏi ý kiến cosplayer
                trước khi xin chụp ảnh hoặc quay video phỏng vấn.
              </li>
            </ul>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: Sticky Registration & Venue Card (4 cols)  */}
        {/* ======================================================== */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:col-span-4">
          {/* Card 1: Registration & Tickets */}
          <div className="border-primary/40 bg-card/90 shadow-primary/5 space-y-5 rounded-3xl border p-6 shadow-xl backdrop-blur-xl">
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Vé vào cổng & Tham gia
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-primary text-2xl font-black sm:text-3xl">
                  {event.ticketPrice || "Miễn phí"}
                </span>
                <span className="text-muted-foreground text-xs">/ người</span>
              </div>
            </div>

            {/* Recruitment status pill */}
            <div className="border-border/70 bg-muted/30 space-y-1.5 rounded-2xl border p-3.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">
                  Đợt tuyển Cosplayer
                </span>
                <span className="text-primary font-bold">
                  {event.isRecruiting ? "Đang mở nhận đơn" : "Đã đủ số lượng"}
                </span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Các hạng mục: Guest Cosplayer, Sân khấu Catwalk, Gian hàng
                Artist và Hỗ trợ sự kiện.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              {event.isRecruiting ? (
                <Button
                  type="button"
                  onClick={handleApplyClick}
                  className="bg-primary text-primary-foreground shadow-primary/25 hover:bg-primary/90 h-11 w-full cursor-pointer rounded-xl text-sm font-bold shadow-lg transition-transform active:scale-95"
                >
                  <Send className="mr-2 size-4" />
                  <span>Ứng tuyển tham gia sự kiện</span>
                </Button>
              ) : (
                <Button
                  disabled
                  className="h-11 w-full rounded-xl text-sm font-semibold opacity-60"
                >
                  Đã chốt danh sách ứng tuyển
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={handleShare}
                className="border-border/80 text-foreground hover:bg-muted h-10 w-full cursor-pointer rounded-xl text-xs font-semibold"
              >
                <Share2 className="mr-2 size-3.5" />
                <span>Chia sẻ liên kết sự kiện</span>
              </Button>
            </div>

            {/* Organizer Note */}
            <div className="border-border/60 flex items-center gap-3 border-t pt-4">
              <div className="border-primary/30 relative size-9 shrink-0 overflow-hidden rounded-full border">
                <Image
                  src="/favicon.png"
                  alt="Kosume"
                  fill
                  sizes="36px"
                  className="object-contain p-1"
                />
              </div>
              <div>
                <p className="text-foreground text-xs font-bold">
                  Kosume Event Network
                </p>
                <p className="text-muted-foreground text-[11px]">
                  Đối tác tổ chức lễ hội Cosplay
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Venue Guide & Map Address */}
          <div className="border-border/70 bg-card/70 space-y-3.5 rounded-3xl border p-6 shadow-xs backdrop-blur-md">
            <h3 className="text-foreground flex items-center gap-2 text-sm font-bold">
              <MapPin className="text-primary size-4" />
              <span>Địa điểm tổ chức</span>
            </h3>

            <div className="space-y-1">
              <p className="text-foreground text-xs font-bold sm:text-sm">
                {event.venue}
              </p>
              <p className="text-muted-foreground text-xs">
                Khu vực: {event.location}
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
                  event.venue + " " + event.location
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-1.5 size-3.5" />
                <span>Xem trên Google Maps</span>
              </a>
            </Button>
          </div>
        </aside>
      </div>

      {/* Application Form Dialog (guarded by auth check) */}
      <EventApplyDialog
        open={isApplyOpen}
        onOpenChange={setIsApplyOpen}
        event={event}
      />
    </div>
  );
}
