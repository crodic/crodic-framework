"use client";

import React, { useMemo, useState } from "react";
import { Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import type { EventSummaryResDto } from "@/services/events";
import { EventsHeroBanner } from "./events-hero-banner";
import { EventsFilterBar } from "./events-filter-bar";
import { EventCard } from "./event-card";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion-primitives";
import { EventDetailDialog } from "./event-detail-dialog";
import { EventApplyDialog } from "./event-apply-dialog";
import { useAuthStore } from "@/store/use-auth-store";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { getEvents } from "@/services/events";

export function EventsView() {
  const t = useTranslations("Events");
  const [selectedTagId, setSelectedTagId] = useState<string>("all");
  const [detailEvent, setDetailEvent] = useState<EventSummaryResDto | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
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

  // Featured festivals for hero banner
  const featuredFestivals = useMemo(() => {
    if (!allEvents || allEvents.length === 0) return [];
    const featured = allEvents.filter((e) => e.isFeaturedFestival);
    return featured.length > 0 ? featured : allEvents.slice(0, 3);
  }, [allEvents]);

  // Filter events based on active tag
  const filteredEvents = useMemo(() => {
    if (selectedTagId === "all") return allEvents;
    const lower = selectedTagId.toLowerCase();
    return allEvents.filter(
      (e) =>
        e.categories?.some((c) => c.toLowerCase().includes(lower)) ||
        e.locationLabel?.toLowerCase().includes(lower) ||
        e.status?.toLowerCase() === lower
    );
  }, [selectedTagId, allEvents]);

  const handleViewDetails = (event: EventSummaryResDto) => {
    setDetailEvent(event);
    setIsDetailOpen(true);
  };

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

  const handleBannerRegister = (festival: EventSummaryResDto) => {
    if (isHydrating) return;
    if (!isAuthenticated) {
      toast.info(t("loginRequired"));
      router.push(`/auth/login?from=/events/${festival.slug || festival.id}`);
      return;
    }
    setApplyEvent(festival);
    setIsApplyOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Hero Festival Banner Carousel */}
      {featuredFestivals.length > 0 && (
        <section aria-label={t("spotlightBadge")}>
          <EventsHeroBanner
            festivals={featuredFestivals}
            onRegisterClick={handleBannerRegister}
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
                <EventCard
                  event={event}
                  onViewDetails={handleViewDetails}
                  onApply={handleApply}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <div className="border-border/80 bg-card/50 flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
            <div className="bg-muted/80 text-muted-foreground flex size-14 items-center justify-center rounded-2xl">
              <Calendar className="size-7" />
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

      {/* 4. Event Detail Modal / Dialog */}
      <EventDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        event={detailEvent}
        onApply={(ev) => {
          setIsDetailOpen(false);
          handleApply(ev);
        }}
      />

      {/* 5. Event Application Form Modal */}
      <EventApplyDialog
        open={isApplyOpen}
        onOpenChange={setIsApplyOpen}
        event={applyEvent}
      />
    </div>
  );
}
