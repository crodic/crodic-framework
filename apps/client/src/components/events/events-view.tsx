"use client";

import React, { useMemo, useState } from "react";
import { Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import type { EventSummaryResDto } from "@/services/events";
import { getEvents } from "@/services/events";
import { EventsHeroBanner } from "./events-hero-banner";
import { EventsFilterBar } from "./events-filter-bar";
import { EventCard } from "./event-card";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion-primitives";
import { EventApplyDialog } from "./event-apply-dialog";
import { matchesEventFilter } from "./events-types";
import { useAuthStore } from "@/store/use-auth-store";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";

export function EventsView() {
  const t = useTranslations("Events");
  const [selectedTagId, setSelectedTagId] = useState<string>("all");
  const [applyEvent, setApplyEvent] = useState<EventSummaryResDto | null>(null);
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const router = useRouter();

  const { data: eventsResponse, isLoading } = useQuery({
    queryKey: ["public-events"],
    queryFn: () => getEvents({ limit: 50 }),
  });

  const allEvents = useMemo(() => {
    return eventsResponse?.data || [];
  }, [eventsResponse]);

  // Featured festivals for hero banner (fallback to active upcoming/ongoing events)
  const featuredFestivals = useMemo(() => {
    if (!allEvents || allEvents.length === 0) return [];
    const featured = allEvents.filter(
      (e) => e.isFeaturedFestival && e.status !== "cancelled"
    );
    if (featured.length > 0) return featured;
    return allEvents
      .filter((e) => e.status === "upcoming" || e.status === "ongoing")
      .slice(0, 3);
  }, [allEvents]);

  // Filter events using structured category/festival logic
  const filteredEvents = useMemo(() => {
    return allEvents.filter((e) => matchesEventFilter(e, selectedTagId));
  }, [selectedTagId, allEvents]);

  const handleApply = (event: EventSummaryResDto) => {
    if (isHydrating) return;
    if (!isAuthenticated) {
      toast.info(t("loginRequired"));
      router.push(`/auth/login?from=/events/${event.slug || event.id}`);
      return;
    }
    setApplyEvent(event);
    setIsApplyOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Hero Festival Banner Carousel */}
      {featuredFestivals.length > 0 && (
        <section aria-label={t("spotlightBadge")}>
          <EventsHeroBanner
            festivals={featuredFestivals}
            onRegisterClick={handleApply}
          />
        </section>
      )}

      {/* 2. Filter Tag Chips */}
      <section aria-label={t("title")}>
        <EventsFilterBar
          selectedTagId={selectedTagId}
          onSelectTag={setSelectedTagId}
        />
      </section>

      {/* 3. Events Grid */}
      <section aria-label={t("title")}>
        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Loader2 className="text-primary size-8 animate-spin" />
          </div>
        ) : filteredEvents.length > 0 ? (
          <StaggerContainer className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {filteredEvents.map((event) => (
              <StaggerItem key={event.id}>
                <EventCard event={event} onApply={handleApply} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <div className="border-border/80 bg-card/50 flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
            <div className="bg-muted/80 text-muted-foreground flex size-12 items-center justify-center rounded-xl">
              <Calendar className="size-6" aria-hidden="true" />
            </div>
            <h3 className="text-foreground mt-4 text-base font-bold">
              {t("emptyTitle")}
            </h3>
            <p className="text-muted-foreground mt-1 max-w-sm text-xs">
              {t("emptyDesc")}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTagId("all")}
              className="mt-4 cursor-pointer rounded-xl"
            >
              {t("viewAllBtn")}
            </Button>
          </div>
        )}
      </section>

      {/* 4. Event Application Form Modal */}
      <EventApplyDialog
        open={isApplyOpen}
        onOpenChange={setIsApplyOpen}
        event={applyEvent}
      />
    </div>
  );
}
