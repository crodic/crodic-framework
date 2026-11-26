"use client";

import React, { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Bell, CheckCheck, Filter, Loader2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/use-auth-store";
import { NotificationCategory } from "./notifications-types";
import { NotificationItemCard } from "./notification-item-card";
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationResDto,
} from "@/services/notifications";

export function NotificationsView() {
  const t = useTranslations("Notifications");
  const tCommon = useTranslations("Common");
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const [activeCategory, setActiveCategory] =
    useState<NotificationCategory>("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState<boolean>(false);

  const {
    data: notificationsResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications({ limit: 50 }),
    enabled: !isHydrating && !!accessToken,
  });

  const notifications: NotificationResDto[] = useMemo(() => {
    return notificationsResponse?.data || [];
  }, [notificationsResponse]);

  // Compute counts
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const categoryCounts = useMemo(() => {
    return {
      all: notifications.length,
      social: notifications.filter((n) => n.category === "social").length,
      system: notifications.filter((n) => n.category === "system").length,
    };
  }, [notifications]);

  // Filtered list
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const matchCategory =
        activeCategory === "all" || item.category === activeCategory;
      const matchUnread = !showUnreadOnly || !item.isRead;
      return matchCategory && matchUnread;
    });
  }, [notifications, activeCategory, showUnreadOnly]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      refetch();
      queryClient.invalidateQueries({
        queryKey: ["notifications-unread-count"],
      });
    } catch {
      toast.error(t("errorOccurred"));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      refetch();
      queryClient.invalidateQueries({
        queryKey: ["notifications-unread-count"],
      });
      toast.success(t("markAllSuccess"));
    } catch {
      toast.error(t("errorOccurred"));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      refetch();
      queryClient.invalidateQueries({
        queryKey: ["notifications-unread-count"],
      });
      toast.success(t("deleteSuccess"));
    } catch {
      toast.error(t("errorOccurred"));
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("title")}
            </h1>
            {unreadCount > 0 && (
              <span className="bg-muted text-foreground rounded-md px-2 py-1 text-xs font-medium tabular-nums">
                {t("newCount", { count: String(unreadCount) })}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm">{t("desc")}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              className="h-10"
            >
              <CheckCheck aria-hidden="true" />
              {t("markAllRead")}
            </Button>
          )}
          <Button asChild variant="outline" className="h-10">
            <Link href="/settings">
              <Settings aria-hidden="true" />
              {t("settings")}
            </Link>
          </Button>
        </div>
      </header>

      <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div className="flex flex-wrap gap-1">
          {(["all", "social", "system"] as const).map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "secondary" : "ghost"}
              size="sm"
              aria-pressed={activeCategory === category}
              onClick={() => setActiveCategory(category)}
              className="h-9"
            >
              {t(`tabs.${category}`)}
              <span className="text-muted-foreground tabular-nums">
                {categoryCounts[category]}
              </span>
            </Button>
          ))}
        </div>

        <Button
          variant={showUnreadOnly ? "secondary" : "outline"}
          size="sm"
          aria-pressed={showUnreadOnly}
          onClick={() => setShowUnreadOnly((prev) => !prev)}
          className="h-9"
        >
          <Filter aria-hidden="true" />
          {t("unreadFilter", { count: String(unreadCount) })}
        </Button>
      </div>

      {isLoading || isHydrating ? (
        <div
          role="status"
          className="flex min-h-48 items-center justify-center"
        >
          <Loader2
            aria-hidden="true"
            className="text-muted-foreground size-5 animate-spin"
          />
          <span className="sr-only">{tCommon("loading")}</span>
        </div>
      ) : isError && notifications.length === 0 ? (
        <Empty className="py-12" role="status">
          <EmptyHeader>
            <EmptyDescription>{t("errorOccurred")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : filteredNotifications.length > 0 ? (
        <div className="divide-border divide-y">
          {filteredNotifications.map((notification) => (
            <NotificationItemCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <Empty className="gap-3 py-12">
          <EmptyMedia variant="icon" className="mb-0">
            <Bell aria-hidden="true" className="size-5" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
            <EmptyDescription>{t("emptyDesc")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
