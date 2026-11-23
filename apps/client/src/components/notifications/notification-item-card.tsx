"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  Heart,
  MessageSquare,
  ShieldAlert,
  Trash2,
  Trophy,
  UserPlus,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NotificationResDto } from "@/services/notifications";

interface NotificationItemCardProps {
  notification: NotificationResDto;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItemCard({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemCardProps) {
  const t = useTranslations("Notifications");
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return {
          icon: <Heart className="size-3.5 fill-rose-500 text-rose-500" />,
          badgeBg: "bg-rose-500/15 border-rose-500/30 text-rose-400",
        };
      case "comment":
        return {
          icon: (
            <MessageSquare className="size-3.5 fill-sky-500 text-sky-500" />
          ),
          badgeBg: "bg-sky-500/15 border-sky-500/30 text-sky-400",
        };
      case "follow":
        return {
          icon: <UserPlus className="size-3.5 text-violet-400" />,
          badgeBg: "bg-violet-500/15 border-violet-500/30 text-violet-400",
        };
      case "badge_awarded":
        return {
          icon: <Trophy className="size-3.5 text-yellow-400" />,
          badgeBg: "bg-yellow-500/15 border-yellow-500/30 text-yellow-400",
        };
      case "security":
        return {
          icon: <ShieldAlert className="size-3.5 text-red-400" />,
          badgeBg: "bg-red-500/15 border-red-500/30 text-red-400",
        };
      default:
        return {
          icon: <Bell className="text-primary size-3.5" />,
          badgeBg: "bg-primary/15 border-primary/30 text-primary",
        };
    }
  };

  const { icon, badgeBg } = getNotificationIcon(notification.type);
  const formattedTime = notification.createdAt
    ? new Date(notification.createdAt).toLocaleDateString()
    : "";

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-4 rounded-2xl border p-4 transition-all duration-200 sm:flex-row sm:items-start sm:p-5",
        notification.isRead
          ? "border-border/60 bg-card/40 hover:border-border/90 hover:bg-card/70"
          : "border-primary/40 bg-primary/[0.04] shadow-primary/5 hover:border-primary/60 hover:bg-primary/[0.07] shadow-xs"
      )}
    >
      {/* Left Avatar / Icon indicator */}
      <div className="relative shrink-0">
        {notification.actorName ? (
          <Avatar className="border-border/80 size-11 rounded-xl border shadow-xs sm:size-12">
            <AvatarImage
              src={notification.actorAvatarUrl || ""}
              alt={notification.actorName}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
              {notification.actorName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="bg-primary/15 border-primary/30 text-primary flex size-11 items-center justify-center rounded-xl border sm:size-12">
            <Bell className="size-5" />
          </div>
        )}

        {/* Floating Mini Type Badge */}
        <div
          className={cn(
            "absolute -right-1 -bottom-1 flex size-5.5 items-center justify-center rounded-full border shadow-xs backdrop-blur-md",
            badgeBg
          )}
        >
          {icon}
        </div>
      </div>

      {/* Middle Content */}
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          {notification.actorName && (
            <span className="text-foreground text-sm font-bold tracking-tight">
              {notification.actorName}
            </span>
          )}
          {notification.actorIsVerified && (
            <CheckCircle2 className="fill-primary text-primary-foreground size-3.5" />
          )}
          <span className="text-foreground/90 text-sm font-semibold">
            {notification.title}
          </span>
          {formattedTime && (
            <>
              <span className="text-muted-foreground/40 text-xs">•</span>
              <span className="text-muted-foreground text-xs font-medium">
                {formattedTime}
              </span>
            </>
          )}
          {!notification.isRead && (
            <span className="bg-primary ring-primary/20 inline-flex size-2 rounded-full ring-4" />
          )}
        </div>

        <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
          {notification.description}
        </p>

        {/* Action Button */}
        {notification.actionUrl && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button
              asChild
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 cursor-pointer rounded-lg px-3 text-xs font-semibold shadow-xs"
            >
              <Link href={notification.actionUrl}>{t("viewDetail")}</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Right Thumbnail & Actions */}
      <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
        {notification.previewImageUrl && (
          <div className="border-border/70 relative size-14 shrink-0 overflow-hidden rounded-xl border shadow-xs sm:size-16">
            <Image
              src={notification.previewImageUrl}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="flex items-center gap-1 opacity-80 transition-opacity group-hover:opacity-100">
          {!notification.isRead && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMarkAsRead(notification.id)}
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 size-7.5 cursor-pointer rounded-lg"
              title={t("markAsRead")}
              aria-label={t("markAsRead")}
            >
              <Check className="size-3.5" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(notification.id)}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 size-7.5 cursor-pointer rounded-lg"
            title={t("delete")}
            aria-label={t("delete")}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
