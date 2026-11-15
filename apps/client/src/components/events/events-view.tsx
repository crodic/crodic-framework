"use client";

import React, { useMemo, useState } from "react";
import { Calendar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventItem, FeaturedFestival } from "./events-types";
import { MOCK_EVENTS } from "./events-data";
import { EventsHeroBanner } from "./events-hero-banner";
import { EventsFilterBar } from "./events-filter-bar";
import { EventCard } from "./event-card";
import { EventDetailDialog } from "./event-detail-dialog";
import { EventApplyDialog } from "./event-apply-dialog";
import { useAuthStore } from "@/store/use-auth-store";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";

export function EventsView() {
  const [selectedTagId, setSelectedTagId] = useState<string>("all");
  const [detailEvent, setDetailEvent] = useState<EventItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [applyEvent, setApplyEvent] = useState<EventItem | null>(null);
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const router = useRouter();

  // Filter events based on active tag
  const filteredEvents = useMemo(() => {
    if (selectedTagId === "all") return MOCK_EVENTS;
    return MOCK_EVENTS.filter((e) => e.tags.includes(selectedTagId));
  }, [selectedTagId]);

  const handleViewDetails = (event: EventItem) => {
    setDetailEvent(event);
    setIsDetailOpen(true);
  };

  const handleApply = (event: EventItem) => {
    if (isHydrating) return;
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để ứng tuyển tham gia sự kiện!");
      router.push(`/auth/login?from=/events/${event.id}`);
      return;
    }
    setApplyEvent(event);
    setIsApplyOpen(true);
  };

  const handleBannerRegister = (festival: FeaturedFestival) => {
    if (isHydrating) return;
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để ứng tuyển tham gia sự kiện!");
      router.push("/auth/login?from=/events");
      return;
    }
    // Find or craft event item for dialog
    const matched = MOCK_EVENTS.find((e) =>
      e.title.includes(festival.title.slice(0, 10))
    ) || {
      id: festival.id,
      title: festival.title,
      day: festival.date.split("/")[0] || "15",
      month: `Th${festival.date.split("/")[1] || "12"}`,
      dateString: festival.date,
      location: festival.city,
      venue: `${festival.title} Arena, ${festival.city}`,
      image: festival.bannerImage,
      tags: ["all", "upcoming", "recruiting"],
      isRecruiting: true,
      participants: [
        {
          id: "p-banner-1",
          name: "KIRIKO",
          avatarUrl: "/landing/avatar-kiriko.jpg",
          isVerified: true,
        },
        {
          id: "p-banner-2",
          name: "Soriko",
          avatarUrl: "/landing/avatar-soriko.jpg",
          isVerified: true,
        },
      ],
      description: festival.description,
      ticketPrice: "120.000 VNĐ",
    };

    setApplyEvent(matched);
    setIsApplyOpen(true);
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      {/* 1. Hero Festival Banner Carousel */}
      <section aria-label="Sự kiện tiêu điểm">
        <EventsHeroBanner onRegisterClick={handleBannerRegister} />
      </section>

      {/* 2. Filter Tag Chips */}
      <section aria-label="Bộ lọc sự kiện">
        <EventsFilterBar
          selectedTagId={selectedTagId}
          onSelectTag={setSelectedTagId}
        />
      </section>

      {/* 3. Events Grid (4 cols on desktop, responsive mobile) */}
      <section aria-label="Danh sách sự kiện">
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onViewDetails={handleViewDetails}
                onApply={handleApply}
              />
            ))}
          </div>
        ) : (
          <div className="border-border/80 bg-card/50 flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
            <div className="bg-muted/80 text-muted-foreground flex size-14 items-center justify-center rounded-2xl">
              <Calendar className="size-7" />
            </div>
            <h3 className="text-foreground mt-4 text-base font-bold">
              Chưa có sự kiện phù hợp
            </h3>
            <p className="text-muted-foreground mt-1 max-w-sm text-xs">
              Không tìm thấy sự kiện nào trong danh mục này. Hãy thử chọn danh
              mục khác hoặc quay về tất cả sự kiện.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTagId("all")}
              className="mt-4 cursor-pointer rounded-xl"
            >
              Xem tất cả sự kiện
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

      {/* 5. Event Application Form Modal (shadcn Form + zod) */}
      <EventApplyDialog
        open={isApplyOpen}
        onOpenChange={setIsApplyOpen}
        event={applyEvent}
      />
    </div>
  );
}
