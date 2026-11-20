"use client";

import React, { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  Bell,
  CheckCheck,
  Filter,
  Loader2,
  MessageSquare,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/use-auth-store";
import { NotificationCategory } from "./notifications-types";
import { NotificationItemCard } from "./notification-item-card";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationResDto,
} from "@/services/notifications";

export function NotificationsView() {
  const t = useTranslations("Notifications");
  const accessToken = useAuthStore((state) => state.accessToken);
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const [activeCategory, setActiveCategory] =
    useState<NotificationCategory>("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState<boolean>(false);

  const {
    data: notificationsResponse,
    isLoading,
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
    } catch {
      toast.error(t("errorOccurred"));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      refetch();
      toast.success(t("markAllSuccess"));
    } catch {
      toast.error(t("errorOccurred"));
    }
  };

  const handleDelete = (_id: string) => {
    toast.success(t("deleteSuccess"));
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Action Bar */}
      <div className="border-border/70 bg-card/60 relative overflow-hidden rounded-3xl border p-6 shadow-sm backdrop-blur-md sm:p-8">
        <div className="bg-primary/15 pointer-events-none absolute -top-24 -right-24 size-72 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-violet-600/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <div className="bg-primary/15 border-primary/30 text-primary flex size-12 shrink-0 items-center justify-center rounded-2xl border shadow-xs sm:size-14">
              <Bell className="size-6 sm:size-7" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-foreground text-xl font-extrabold tracking-tight sm:text-2xl">
                  {t("title")}
                </h1>
                {unreadCount > 0 && (
                  <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-bold">
                    {t("newCount", { count: String(unreadCount) })}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm">
                {t("desc")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="border-border/80 bg-background/60 hover:bg-primary/10 hover:text-primary h-9 cursor-pointer gap-1.5 rounded-xl text-xs font-semibold"
              >
                <CheckCheck className="size-4" />
                <span>{t("markAllRead")}</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-border/80 bg-background/60 hover:bg-card h-9 cursor-pointer gap-1.5 rounded-xl text-xs font-semibold"
            >
              <Link href="/settings">
                <Settings className="text-muted-foreground size-4" />
                <span>{t("settings")}</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Category Filter Tabs Bar */}
      <div className="border-border/60 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div className="flex scrollbar-none items-center gap-1.5 overflow-x-auto sm:gap-2">
          <Button
            size="sm"
            variant={activeCategory === "all" ? "default" : "ghost"}
            onClick={() => setActiveCategory("all")}
            className="h-8.5 cursor-pointer rounded-xl text-xs font-semibold"
          >
            {t("tabs.all")} ({categoryCounts.all})
          </Button>

          <Button
            size="sm"
            variant={activeCategory === "social" ? "default" : "ghost"}
            onClick={() => setActiveCategory("social")}
            className="h-8.5 cursor-pointer gap-1.5 rounded-xl text-xs font-semibold"
          >
            <MessageSquare className="size-3.5" />
            <span>{t("tabs.social")}</span>
            <span className="text-[11px] opacity-80">
              ({categoryCounts.social})
            </span>
          </Button>

          <Button
            size="sm"
            variant={activeCategory === "system" ? "default" : "ghost"}
            onClick={() => setActiveCategory("system")}
            className="h-8.5 cursor-pointer gap-1.5 rounded-xl text-xs font-semibold"
          >
            <Bell className="size-3.5" />
            <span>{t("tabs.system")}</span>
            <span className="text-[11px] opacity-80">
              ({categoryCounts.system})
            </span>
          </Button>
        </div>

        {/* Unread Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={showUnreadOnly ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowUnreadOnly((prev) => !prev)}
            className="border-border/70 h-8.5 cursor-pointer gap-1.5 rounded-xl text-xs font-semibold"
          >
            <Filter className="size-3.5" />
            <span>{t("unreadFilter", { count: String(unreadCount) })}</span>
          </Button>
        </div>
      </div>

      {/* 3. Notifications Feed List */}
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="text-primary size-8 animate-spin" />
        </div>
      ) : filteredNotifications.length > 0 ? (
        <div className="space-y-3">
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
        <Empty className="border-border/60 bg-card/40 rounded-3xl border border-dashed py-16 text-center">
          <EmptyMedia>
            <div className="bg-muted/70 text-muted-foreground flex size-14 items-center justify-center rounded-2xl">
              <Bell className="size-7" />
            </div>
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle className="text-foreground text-base font-bold">
              {t("emptyTitle")}
            </EmptyTitle>
            <EmptyDescription className="text-muted-foreground mt-1 max-w-sm text-xs">
              {t("emptyDesc")}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
