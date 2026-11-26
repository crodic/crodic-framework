"use client";

import React, { useMemo, useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListError } from "@/components/common/list-error";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
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
  const tNav = useTranslations("Navigation");
  const tCommon = useTranslations("Common");
  const [selectedTagId, setSelectedTagId] = useState<string>("all");
  const [applyEvent, setApplyEvent] = useState<EventSummaryResDto | null>(null);
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const router = useRouter();

  const {
    data: eventsResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
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

  // Derive unique categories dynamically from backend event records
  const availableCategories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const event of allEvents) {
      for (const rawCat of event.categories ?? []) {
        const trimmed = rawCat.trim();
        if (!trimmed) continue;
        const key = trimmed.toLowerCase();
        if (!seen.has(key)) {
          seen.set(key, trimmed);
        }
      }
    }
    return Array.from(seen.values());
  }, [allEvents]);

  // Filter events using dynamic categories
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
      <h1 className="page-title">{tNav("events")}</h1>
      {/* 1. Hero Festival Banner Carousel */}
      {featuredFestivals.length > 0 && (
        <section aria-label={t("spotlightBadge")}>
          <EventsHeroBanner
            festivals={featuredFestivals}
            onRegisterClick={handleApply}
          />
        </section>
      )}

      {/* 2. Filter Tag Chips (only shown when backend events have categories) */}
      {availableCategories.length > 0 && (
        <section aria-label={t("title")}>
          <EventsFilterBar
            categories={availableCategories}
            selectedTagId={selectedTagId}
            onSelectTag={setSelectedTagId}
          />
        </section>
      )}

      {/* 3. Events Grid */}
      <section aria-label={t("title")}>
        {isLoading ? (
          <div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            role="status"
          >
            <span className="sr-only">{tCommon("loading")}</span>
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton
                key={index}
                className="h-28 rounded-xl motion-reduce:animate-none sm:h-52"
              />
            ))}
          </div>
        ) : isError && !eventsResponse ? (
          <ListError onRetry={() => void refetch()} />
        ) : filteredEvents.length > 0 ? (
          <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <StaggerItem key={event.id}>
                <EventCard event={event} onApply={handleApply} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <Empty className="border-border gap-4 rounded-xl border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Calendar aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
              <EmptyDescription>{t("emptyDesc")}</EmptyDescription>
            </EmptyHeader>
            {selectedTagId !== "all" && (
              <EmptyContent>
                <Button
                  variant="outline"
                  onClick={() => setSelectedTagId("all")}
                >
                  {t("viewAllBtn")}
                </Button>
              </EmptyContent>
            )}
          </Empty>
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
