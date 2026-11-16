"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Calendar, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getEvents, toggleEventInterest } from "@/services/events";
import { useAuthStore } from "@/store/use-auth-store";
import { useRouter } from "@/i18n/navigation";

export function UpcomingEventsWidget() {
  const t = useTranslations("Feed");
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();
  const [interestMap, setInterestMap] = useState<Record<string, boolean>>({});

  const { data: eventsResponse } = useQuery({
    queryKey: ["feed-upcoming-events"],
    queryFn: () => getEvents({ limit: 3 }),
  });

  const events = eventsResponse?.data || [];

  const handleToggleInterest = async (id: string, title: string) => {
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để lưu sự kiện!");
      router.push("/auth/login?from=/feed");
      return;
    }

    try {
      const res = await toggleEventInterest(id);
      setInterestMap((prev) => ({ ...prev, [id]: res.interested }));
      if (res.interested) {
        toast.success(`Đã lưu sự kiện "${title}" vào lịch của bạn!`);
      } else {
        toast.info(`Đã bỏ quan tâm sự kiện "${title}"`);
      }
    } catch {
      toast.error("Có lỗi xảy ra khi lưu sự kiện.");
    }
  };

  if (!events || events.length === 0) return null;

  return (
    <div className="border-border/70 bg-card/70 rounded-2xl border p-4 shadow-xs backdrop-blur-xs">
      <div className="mb-3.5 flex items-center justify-between">
        <h3 className="text-foreground text-sm font-bold sm:text-base">
          {t("upcomingEvents")}
        </h3>
        <span className="text-muted-foreground text-xs">{t("latest")}</span>
      </div>

      <div className="space-y-3">
        {events.map((event) => {
          const isInterested = interestMap[event.id] ?? false;

          return (
            <div
              key={event.id}
              className="border-border/60 bg-muted/20 hover:border-primary/40 flex items-center justify-between gap-3 rounded-xl border p-2.5 transition-colors"
            >
              <Link
                href={`/events/${event.slug || event.id}`}
                className="group flex items-center gap-3 overflow-hidden"
              >
                {/* Event Badge / Thumbnail */}
                <div className="relative flex size-11 shrink-0 flex-col items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 text-center shadow-xs">
                  <span className="text-xs font-black text-white">
                    {event.dayLabel}
                  </span>
                  <span className="text-[8px] font-bold text-white/80 uppercase">
                    {event.monthLabel}
                  </span>
                </div>

                <div className="truncate">
                  <h4 className="text-foreground group-hover:text-primary truncate text-xs font-bold transition-colors sm:text-sm">
                    {event.title}
                  </h4>
                  <p className="text-muted-foreground flex items-center gap-1 text-[11px]">
                    <Calendar className="size-3 shrink-0" />
                    <span className="truncate">{event.dateString}</span>
                  </p>
                  <p className="text-muted-foreground/80 flex items-center gap-1 text-[10px]">
                    <MapPin className="size-2.5 shrink-0" />
                    <span className="truncate">{event.locationLabel}</span>
                  </p>
                </div>
              </Link>

              {/* Interest Button */}
              <button
                type="button"
                onClick={() => handleToggleInterest(event.id, event.title)}
                className={`shrink-0 cursor-pointer rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all ${
                  isInterested
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/80 bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {isInterested ? t("saved") : t("interested")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
