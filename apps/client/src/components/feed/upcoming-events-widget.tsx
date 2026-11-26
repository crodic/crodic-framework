"use client";

import React, { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { Calendar, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getEvents, toggleEventInterest } from "@/services/events";
import { useAuthStore } from "@/store/use-auth-store";

export function UpcomingEventsWidget() {
  const t = useTranslations("Feed");
  const tEvents = useTranslations("Events");
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [interestMap, setInterestMap] = useState<Record<string, boolean>>({});

  const { data: eventsResponse } = useQuery({
    queryKey: ["feed-upcoming-events"],
    queryFn: () =>
      getEvents({
        "filter[status]": "upcoming",
        sort: "startAt",
        limit: 3,
      }),
  });

  const events = eventsResponse?.data || [];

  const handleToggleInterest = async (id: string, title: string) => {
    if (!isAuthenticated) {
      toast.info(tEvents("loginRequired"));
      router.push("/auth/login?from=/feed");
      return;
    }

    try {
      const res = await toggleEventInterest(id);
      setInterestMap((prev) => ({ ...prev, [id]: res.interested }));
      queryClient.invalidateQueries({ queryKey: ["feed-upcoming-events"] });
      queryClient.invalidateQueries({ queryKey: ["public-events"] });
      if (res.interested) {
        toast.success(tEvents("savedEventSuccess", { title }));
      } else {
        toast.info(tEvents("uninterestedSuccess", { title }));
      }
    } catch {
      toast.error(tEvents("saveEventError"));
    }
  };

  if (!events || events.length === 0) return null;

  return (
    <div className="border-border bg-card rounded-xl border p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-foreground text-base font-semibold">
          {t("upcomingEvents")}
        </h3>
      </div>

      <div className="divide-border divide-y">
        {events.map((event) => {
          const isInterested =
            interestMap[event.id] ?? event.isInterestedByCurrentUser ?? false;

          return (
            <div
              key={event.id}
              className="flex items-center justify-between gap-3 py-3 last:pb-0"
            >
              <Link
                href={`/events/${event.slug || event.id}`}
                className="group flex min-w-0 items-center gap-3"
              >
                {/* Event Date Badge */}
                <div className="bg-muted flex size-11 shrink-0 flex-col items-center justify-center rounded-lg text-center">
                  <span className="text-foreground text-sm font-semibold tabular-nums">
                    {event.dayLabel}
                  </span>
                  <span className="text-muted-foreground px-0.5 text-center text-[10px] leading-none">
                    {event.monthLabel}
                  </span>
                </div>

                <div className="min-w-0">
                  <h4 className="text-foreground group-hover:text-primary line-clamp-2 text-sm font-semibold transition-colors">
                    {event.title}
                  </h4>
                  <p className="text-muted-foreground flex items-center gap-1 text-xs tabular-nums">
                    <Calendar className="size-3 shrink-0" aria-hidden="true" />
                    <span className="truncate">{event.dateString}</span>
                  </p>
                  <p className="text-muted-foreground flex items-center gap-1 text-xs">
                    <MapPin className="size-2.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{event.locationLabel}</span>
                  </p>
                </div>
              </Link>

              {/* Interest Button */}
              <button
                type="button"
                onClick={() => handleToggleInterest(event.id, event.title)}
                aria-pressed={isInterested}
                className={`min-h-8 shrink-0 cursor-pointer rounded-lg border px-2.5 text-xs font-medium transition-colors ${
                  isInterested
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/80 bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
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
