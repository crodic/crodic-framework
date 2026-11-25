import type { useTranslations } from "next-intl";
import type { EventSummaryResDto } from "@/services/events";

export type {
  EventSummaryResDto,
  EventDetailResDto,
  EventParticipantResDto,
  EventApplicationPayload,
} from "@/services/events";

export interface EventFilterTag {
  id: string;
  label: string;
}

const EVENT_FILTER_KEYWORDS: Record<string, readonly string[]> = {
  festival: ["festival", "lễ hội", "expo", "fes"],
  photoshoot: ["photoshoot", "photo", "chụp"],
  contest: ["contest", "cuộc thi", "thi"],
  workshop: ["workshop", "chế tác"],
};

/**
 * Returns the localized display label for an event lifecycle status.
 */
export function getEventLifecycleLabel(
  t: ReturnType<typeof useTranslations<"Events">>,
  status: EventSummaryResDto["status"]
): string {
  switch (status) {
    case "ongoing":
      return t("lifecycle.ongoing");
    case "completed":
      return t("lifecycle.completed");
    case "cancelled":
      return t("lifecycle.cancelled");
    case "upcoming":
    default:
      return t("lifecycle.upcoming");
  }
}

/**
 * Determines whether public applications are currently open for an event.
 */
export function canApplyToEvent(
  event: Pick<EventSummaryResDto, "isRecruiting" | "status">
): boolean {
  return Boolean(
    event.isRecruiting &&
    event.status !== "completed" &&
    event.status !== "cancelled"
  );
}

/**
 * Matches an event against a category filter chip without relying on locale text equality.
 */
export function matchesEventFilter(
  event: EventSummaryResDto,
  selectedTagId: string
): boolean {
  if (selectedTagId === "all") return true;
  if (selectedTagId === "festival" && event.isFeaturedFestival) return true;

  const keywords = EVENT_FILTER_KEYWORDS[selectedTagId];
  if (!keywords) {
    const lower = selectedTagId.toLowerCase();
    return Boolean(
      event.categories?.some((c) => c.toLowerCase().includes(lower)) ||
      event.title.toLowerCase().includes(lower)
    );
  }

  const lowerTitle = event.title.toLowerCase();
  const matchesTitle = keywords.some((kw) => lowerTitle.includes(kw));
  const matchesCategory = Boolean(
    event.categories?.some((cat) => {
      const lowerCat = cat.toLowerCase();
      return keywords.some((kw) => lowerCat.includes(kw));
    })
  );

  return matchesTitle || matchesCategory;
}
