"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import { toast } from "sonner";
import { MOCK_UPCOMING_EVENTS } from "./feed-data";

export function UpcomingEventsWidget() {
  const [events, setEvents] = useState(MOCK_UPCOMING_EVENTS);

  const handleToggleInterest = (id: string, title: string) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id === id) {
          const next = !ev.isInterested;
          if (next) {
            toast.success(`Đã lưu sự kiện "${title}" vào lịch của bạn!`);
          } else {
            toast.info(`Đã bỏ quan tâm sự kiện "${title}"`);
          }
          return { ...ev, isInterested: next };
        }
        return ev;
      })
    );
  };

  return (
    <div className="border-border/70 bg-card/70 rounded-2xl border p-4 shadow-xs backdrop-blur-xs">
      <div className="mb-3.5 flex items-center justify-between">
        <h3 className="text-foreground text-sm font-bold sm:text-base">
          Sự kiện sắp diễn ra
        </h3>
        <span className="text-muted-foreground text-xs">Mới nhất</span>
      </div>

      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="border-border/60 bg-muted/20 hover:border-primary/40 flex items-center justify-between gap-3 rounded-xl border p-2.5 transition-colors"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              {/* Event Badge / Thumbnail */}
              <div
                className={`relative flex size-11 shrink-0 flex-col items-center justify-center rounded-lg bg-gradient-to-br ${
                  event.badgeColor || "from-purple-600 to-indigo-600"
                } text-center shadow-xs`}
              >
                <span className="px-1 text-[8px] font-black tracking-wider text-white uppercase">
                  {event.badge}
                </span>
              </div>

              <div className="truncate">
                <h4 className="text-foreground truncate text-xs font-bold sm:text-sm">
                  {event.title}
                </h4>
                <p className="text-muted-foreground flex items-center gap-1 text-[11px]">
                  <Calendar className="size-3 shrink-0" />
                  <span className="truncate">{event.dateTime}</span>
                </p>
                <p className="text-muted-foreground/80 flex items-center gap-1 text-[10px]">
                  <MapPin className="size-2.5 shrink-0" />
                  <span className="truncate">{event.location}</span>
                </p>
              </div>
            </div>

            {/* Interest Button */}
            <button
              type="button"
              onClick={() => handleToggleInterest(event.id, event.title)}
              className={`shrink-0 cursor-pointer rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all ${
                event.isInterested
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/80 bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {event.isInterested ? "Đã lưu" : "Quan tâm"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
