import { http } from "@/lib/http";
import type { PaginatedResponse } from "@repo/query-builder";

export interface EventParticipantResDto {
  id: string;
  eventId: string;
  userId: string;
  name: string;
  avatarUrl?: string | null;
  isVerified: boolean;
  roleLabel?: string | null;
  sortOrder: number;
}

export interface EventSummaryResDto {
  id: string;
  slug: string;
  title: string;
  dayLabel: string;
  monthLabel: string;
  yearLabel?: string | null;
  dateString: string;
  startAt: string;
  endAt?: string | null;
  locationLabel: string;
  cityId?: string | null;
  organizerUserId?: string | null;
  organizerName?: string | null;
  venue: string;
  imageUrl: string;
  bannerImageUrl?: string | null;
  description?: string;
  ticketPriceLabel?: string | null;
  ticketPriceAmount?: number | null;
  isRecruiting: boolean;
  isFeaturedFestival: boolean;
  categories: string[];
  schedule?: { time: string; activity: string }[];
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  participantsCount: number;
  interestedCount: number;
  applicationsCount: number;
  participants?: EventParticipantResDto[];
  isInterestedByCurrentUser?: boolean;
  isParticipatingByCurrentUser?: boolean;
  createdAt: string;
}

export interface EventDetailResDto extends EventSummaryResDto {
  description: string;
  schedule: { time: string; activity: string }[];
  participants: EventParticipantResDto[];
  updatedAt: string;
}

export interface EventApplicationPayload {
  fullName: string;
  stageName: string;
  category: string;
  phone: string;
  characterPlanned: string;
  portfolioUrl?: string;
  notes?: string;
}

export const getEvents = async (
  query?: Record<string, any>
): Promise<PaginatedResponse<EventSummaryResDto>> => {
  const searchParams = new URLSearchParams();
  if (query) {
    for (const [key, val] of Object.entries(query)) {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    }
  }
  const qs = searchParams.toString();
  const url = `/api/v1/public/events${qs ? `?${qs}` : ""}`;
  const { data } = await http.get<PaginatedResponse<EventSummaryResDto>>(url);
  return data;
};

export const getEventBySlug = async (
  slug: string
): Promise<EventDetailResDto> => {
  const { data } = await http.get<EventDetailResDto>(
    `/api/v1/public/events/${slug}`
  );
  return data;
};

export const toggleEventInterest = async (
  eventId: string
): Promise<{ interested: boolean; interestedCount: number }> => {
  const { data } = await http.post<{
    interested: boolean;
    interestedCount: number;
  }>(`/api/v1/events/${eventId}/interest`);
  return data;
};

export const applyEvent = async (
  eventId: string,
  payload: EventApplicationPayload
): Promise<any> => {
  const { data } = await http.post(`/api/v1/events/${eventId}/apply`, payload);
  return data;
};
