export type NotificationCategory = "all" | "social" | "booking" | "system";

export type NotificationType =
  | "like"
  | "comment"
  | "follow"
  | "booking_request"
  | "booking_accepted"
  | "job_approved"
  | "badge_awarded"
  | "security";

export interface NotificationActor {
  name: string;
  avatarUrl: string;
  role?: string;
  isVerified?: boolean;
}

export interface NotificationItem {
  id: string;
  category: "social" | "booking" | "system";
  type: NotificationType;
  actor?: NotificationActor;
  title: string;
  description: string;
  timeAgo: string;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
  secondaryActionLabel?: string;
  previewImage?: string;
}
