"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useFormatter, useTranslations } from "next-intl";
import {
  Bell,
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
  const format = useFormatter();
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return {
          icon: <Heart className="size-3.5 fill-rose-500 text-rose-500" />,
          badgeBg: "border-rose-500/30 text-rose-400",
        };
      case "comment":
        return {
          icon: (
            <MessageSquare className="size-3.5 fill-sky-500 text-sky-500" />
          ),
          badgeBg: "border-sky-500/30 text-sky-400",
        };
      case "follow":
        return {
          icon: <UserPlus className="size-3.5 text-violet-400" />,
          badgeBg: "border-violet-500/30 text-violet-400",
        };
      case "badge_awarded":
        return {
          icon: <Trophy className="size-3.5 text-yellow-400" />,
          badgeBg: "border-yellow-500/30 text-yellow-400",
        };
      case "security":
        return {
          icon: <ShieldAlert className="size-3.5 text-red-400" />,
          badgeBg: "border-red-500/30 text-red-400",
        };
      default:
        return {
          icon: <Bell className="text-primary size-3.5" />,
          badgeBg: "border-primary/30 text-primary",
        };
    }
  };

  const { icon, badgeBg } = getNotificationIcon(notification.type);
  const formattedTime = notification.createdAt
    ? format.dateTime(new Date(notification.createdAt), { dateStyle: "medium" })
    : "";

  return (
    <div
      className={cn(
        "grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 rounded-xl p-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-4 sm:p-4",
        !notification.isRead && "bg-primary/5"
      )}
    >
      {/* Left Avatar / Icon indicator */}
      <div className="relative shrink-0">
        {notification.actorName ? (
          <Avatar className="border-border size-10 shrink-0 rounded-lg border">
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
          <div className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
            <Bell className="size-5" />
          </div>
        )}

        {/* Floating Mini Type Badge */}
        <div
          className={cn(
            "bg-background absolute -end-1 -bottom-1 flex size-5 items-center justify-center rounded-full border",
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
            <span className="text-foreground text-sm font-semibold">
              {notification.actorName}
            </span>
          )}
          {notification.actorIsVerified && (
            <CheckCircle2 className="fill-primary text-primary-foreground size-3.5" />
          )}
          <span className="text-foreground text-sm font-medium">
            {notification.title}
          </span>
          {formattedTime && (
            <>
              <span className="text-muted-foreground text-xs">•</span>
              <span className="text-muted-foreground text-xs font-medium">
                {formattedTime}
              </span>
            </>
          )}
          {!notification.isRead && (
            <span className="bg-primary inline-flex size-2 rounded-full" />
          )}
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed">
          {notification.description}
        </p>

        {/* Action Button */}
        {notification.actionUrl && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button asChild size="sm" className="h-9">
              <Link href={notification.actionUrl}>{t("viewDetail")}</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Right Thumbnail & Actions */}
      <div className="col-start-2 flex items-center justify-between gap-2 sm:col-start-auto sm:flex-col sm:items-end">
        {notification.previewImageUrl && (
          <div className="relative size-12 shrink-0 overflow-hidden rounded-lg sm:size-14">
            <Image
              src={notification.previewImageUrl}
              alt=""
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>
        )}

        <div className="ms-auto flex items-center gap-1">
          {!notification.isRead && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMarkAsRead(notification.id)}
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 size-9"
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
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 size-9"
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
