import { http } from "@/lib/http";
import type { PaginatedResponse } from "@repo/query-builder";

export interface NotificationResDto {
  id: string;
  recipientUserId: string;
  category: "social" | "system";
  type: string;
  actorUserId?: string | null;
  actorName?: string | null;
  actorAvatarUrl?: string | null;
  actorRole?: string | null;
  actorIsVerified: boolean;
  title: string;
  description: string;
  actionUrl?: string | null;
  previewImageUrl?: string | null;
  subjectType?: string | null;
  subjectId?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export const getNotifications = async (
  query?: Record<string, any>
): Promise<PaginatedResponse<NotificationResDto>> => {
  const searchParams = new URLSearchParams();
  if (query) {
    for (const [key, val] of Object.entries(query)) {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    }
  }
  const qs = searchParams.toString();
  const url = `/api/v1/notifications${qs ? `?${qs}` : ""}`;
  const { data } = await http.get<PaginatedResponse<NotificationResDto>>(url);
  return data;
};

export const getUnreadNotificationCount = async (): Promise<number> => {
  const { data } = await http.get<{ unreadCount: number }>(
    "/api/v1/notifications/unread-count"
  );
  return data?.unreadCount || 0;
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  await http.patch(`/api/v1/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await http.patch("/api/v1/notifications/read-all");
};

export const deleteNotification = async (id: string): Promise<void> => {
  await http.delete(`/api/v1/notifications/${id}`);
};
