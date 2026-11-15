"use client";

import React, { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  Bell,
  BellOff,
  CheckCheck,
  Filter,
  MessageSquare,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { toast } from "sonner";
import { NotificationCategory, NotificationItem } from "./notifications-types";
import { MOCK_NOTIFICATIONS } from "./notifications-data";
import { NotificationItemCard } from "./notification-item-card";

export function NotificationsView() {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [activeCategory, setActiveCategory] =
    useState<NotificationCategory>("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState<boolean>(false);

  // Compute counts
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const categoryCounts = useMemo(() => {
    return {
      all: notifications.length,
      social: notifications.filter((n) => n.category === "social").length,
      booking: notifications.filter((n) => n.category === "booking").length,
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

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
    toast.success("Đã đánh dấu thông báo là đã đọc.");
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    toast.success("Đã đánh dấu tất cả thông báo là đã đọc.");
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
    toast.success("Đã xóa thông báo.");
  };

  const handleClearAll = () => {
    if (activeCategory === "all") {
      setNotifications([]);
    } else {
      setNotifications((prev) =>
        prev.filter((item) => item.category !== activeCategory)
      );
    }
    toast.success("Đã dọn sạch thông báo.");
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-4 sm:p-6 lg:p-8">
      {/* ======================================================== */}
      {/* 1. Header Banner & Action Bar                           */}
      {/* ======================================================== */}
      <div className="border-border/70 bg-card/60 relative overflow-hidden rounded-3xl border p-6 shadow-sm backdrop-blur-md sm:p-8">
        {/* Ambient Purple Glow */}
        <div className="bg-primary/15 pointer-events-none absolute -top-24 -right-24 size-72 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-violet-600/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <div className="bg-primary/15 border-primary/30 text-primary flex size-12 shrink-0 items-center justify-center rounded-2xl border shadow-xs sm:size-14">
              <Bell className="size-6 sm:size-7" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                  Thông báo
                </h1>
                {unreadCount > 0 && (
                  <Badge className="bg-primary text-primary-foreground h-5 rounded-full px-2 text-xs font-bold">
                    {unreadCount} mới
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                Quản lý cập nhật hoạt động, yêu cầu booking và thông báo hệ
                thống trên Kosume.
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
                <span>Đánh dấu đã đọc</span>
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
                <span>Cài đặt thông báo</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. Filter Bar & Categories                              */}
      {/* ======================================================== */}
      <div className="border-border/60 bg-card/40 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-2 backdrop-blur-xs sm:p-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            variant={activeCategory === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveCategory("all")}
            className="h-8.5 cursor-pointer gap-1.5 rounded-xl text-xs font-semibold"
          >
            <span>Tất cả</span>
            <Badge
              variant={activeCategory === "all" ? "secondary" : "outline"}
              className="h-4.5 rounded-full px-1.5 text-[10px]"
            >
              {categoryCounts.all}
            </Badge>
          </Button>

          <Button
            variant={activeCategory === "social" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveCategory("social")}
            className="h-8.5 cursor-pointer gap-1.5 rounded-xl text-xs font-semibold"
          >
            <Users className="size-3.5" />
            <span>Tương tác</span>
            <Badge
              variant={activeCategory === "social" ? "secondary" : "outline"}
              className="h-4.5 rounded-full px-1.5 text-[10px]"
            >
              {categoryCounts.social}
            </Badge>
          </Button>

          <Button
            variant={activeCategory === "booking" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveCategory("booking")}
            className="h-8.5 cursor-pointer gap-1.5 rounded-xl text-xs font-semibold"
          >
            <Sparkles className="size-3.5 text-amber-400" />
            <span>Booking & Dự án</span>
            <Badge
              variant={activeCategory === "booking" ? "secondary" : "outline"}
              className="h-4.5 rounded-full px-1.5 text-[10px]"
            >
              {categoryCounts.booking}
            </Badge>
          </Button>

          <Button
            variant={activeCategory === "system" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveCategory("system")}
            className="h-8.5 cursor-pointer gap-1.5 rounded-xl text-xs font-semibold"
          >
            <MessageSquare className="size-3.5" />
            <span>Hệ thống</span>
            <Badge
              variant={activeCategory === "system" ? "secondary" : "outline"}
              className="h-4.5 rounded-full px-1.5 text-[10px]"
            >
              {categoryCounts.system}
            </Badge>
          </Button>
        </div>

        {/* Toggle Unread Only */}
        <div className="flex items-center gap-2 px-2">
          <Button
            variant={showUnreadOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowUnreadOnly((prev) => !prev)}
            className="border-border/80 h-8 cursor-pointer gap-1.5 rounded-xl text-xs font-medium"
          >
            <Filter className="size-3" />
            <span>Chưa đọc</span>
          </Button>

          {filteredNotifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-muted-foreground hover:text-destructive h-8 cursor-pointer text-xs font-medium"
            >
              Xóa danh sách
            </Button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. Notifications List                                   */}
      {/* ======================================================== */}
      {filteredNotifications.length === 0 ? (
        <Empty className="border-border/70 bg-card/30 rounded-3xl border border-dashed py-16">
          <EmptyMedia variant="icon">
            <BellOff className="text-muted-foreground size-8" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle className="text-lg">Không có thông báo nào</EmptyTitle>
            <EmptyDescription className="max-w-md text-xs leading-relaxed">
              {showUnreadOnly
                ? "Bạn đã đọc hết tất cả thông báo trong mục này. Bấm vào 'Chưa đọc' để xem lại toàn bộ thông báo."
                : "Hiện tại bạn không có thông báo mới. Khi có tương tác, lời mời booking hoặc cập nhật từ Kosume, thông báo sẽ hiển thị tại đây."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
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
      )}
    </div>
  );
}
