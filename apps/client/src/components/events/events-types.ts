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
 * Matches an event against a dynamic category filter chip.
 */
export function matchesEventFilter(
  event: EventSummaryResDto,
  selectedTagId: string
): boolean {
  if (!selectedTagId || selectedTagId === "all") return true;
  const lower = selectedTagId.trim().toLowerCase();
  return Boolean(
    event.categories?.some((cat) => cat.trim().toLowerCase() === lower)
  );
}
