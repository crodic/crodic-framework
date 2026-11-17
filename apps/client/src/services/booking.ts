import { http } from "@/lib/http";
import type { PaginatedResponse } from "@repo/query-builder";

export interface BookingUserSummaryResDto {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
}

export interface BookingRequestResDto {
  id: string;
  targetCosplayerId: string;
  targetCosplayer?: BookingUserSummaryResDto;
  requesterUserId: string;
  requesterUser?: BookingUserSummaryResDto;
  bookingType: string;
  fullName: string;
  contactInfo: string;
  targetDateLabel: string;
  targetStartAt?: string | null;
  targetEndAt?: string | null;
  budgetLabel: string;
  budgetAmount?: number | null;
  currency?: "VND" | "USD" | "JPY";
  details: string;
  status: "pending" | "accepted" | "declined" | "completed" | "cancelled";
  responseNote?: string | null;
  respondedAt?: string | null;
  createdAt: string;
}

export interface CreateBookingPayload {
  targetCosplayerId: string;
  bookingType: string;
  fullName: string;
  contactInfo: string;
  targetDateLabel: string;
  targetStartAt?: string;
  targetEndAt?: string;
  budgetLabel: string;
  budgetAmount?: number;
  currency?: "VND" | "USD" | "JPY";
  details: string;
}

export const createBookingRequest = async (
  payload: CreateBookingPayload
): Promise<BookingRequestResDto> => {
  const { data } = await http.post<BookingRequestResDto>(
    "/api/v1/bookings",
    payload
  );
  return data;
};

export const getMySentBookings = async (
  query?: Record<string, any>
): Promise<PaginatedResponse<BookingRequestResDto>> => {
  const searchParams = new URLSearchParams();
  if (query) {
    for (const [key, val] of Object.entries(query)) {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    }
  }
  const qs = searchParams.toString();
  const url = `/api/v1/bookings/sent${qs ? `?${qs}` : ""}`;
  const { data } = await http.get<PaginatedResponse<BookingRequestResDto>>(url);
  return data;
};

export const getMyReceivedBookings = async (
  query?: Record<string, any>
): Promise<PaginatedResponse<BookingRequestResDto>> => {
  const searchParams = new URLSearchParams();
  if (query) {
    for (const [key, val] of Object.entries(query)) {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    }
  }
  const qs = searchParams.toString();
  const url = `/api/v1/bookings/received${qs ? `?${qs}` : ""}`;
  const { data } = await http.get<PaginatedResponse<BookingRequestResDto>>(url);
  return data;
};
