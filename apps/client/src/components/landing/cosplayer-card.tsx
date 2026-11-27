"use client";

import React, { useState } from "react";
import Image from "next/image";
import { BadgeCheck, Check, Plus } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { CosplayerSummaryResDto } from "@/services/cosplayer";
import { toggleFollow } from "@/services/social";
import { useAuthStore } from "@/store/use-auth-store";
import { useTranslations } from "next-intl";
import { useProfile } from "@/hooks/use-profile";

interface CosplayerCardProps {
  cosplayer: CosplayerSummaryResDto;
}

export function CosplayerCard({ cosplayer }: CosplayerCardProps) {
  const t = useTranslations("CosplayerProfile");
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: currentUser } = useProfile();
  const router = useRouter();
  const [following, setFollowing] = useState(false);

  const initials =
    cosplayer.displayName
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "C";

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info(t("loginRequiredToFollow"));
      router.push("/auth/login?from=/landing");
      return;
    }

    try {
      const res = await toggleFollow(cosplayer.userId);
      setFollowing(res.following);
      if (res.following) {
        toast.success(t("followedSuccess", { name: cosplayer.displayName }));
      } else {
        toast.info(t("unfollowedSuccess", { name: cosplayer.displayName }));
      }
    } catch {
      toast.error(t("followError"));
    }
  };

  const previewImage = cosplayer.coverUrl || cosplayer.avatarUrl;

  return (
    <article className="group border-border bg-card relative flex h-full flex-col gap-4 rounded-xl border p-4">
      {/* Card Header: Avatar + Info + Follow Button */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/cosplayer/${cosplayer.slug || cosplayer.id}`}
          className="focus-visible:after:ring-ring flex min-w-0 items-center gap-3 after:absolute after:inset-0 after:z-10 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-2"
        >
          {/* Avatar with subtle ring */}
          <Avatar className="size-10 shrink-0">
            {cosplayer.avatarUrl && (
              <AvatarImage
                src={cosplayer.avatarUrl}
                alt=""
                className="object-cover"
              />
            )}
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Name & Followers */}
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-foreground truncate text-sm font-semibold underline-offset-4 group-hover:underline">
                {cosplayer.displayName}
              </span>
              {cosplayer.isVerified && (
                <BadgeCheck
                  className="text-primary size-4 shrink-0"
                  aria-label={t("verifiedBadge")}
                />
              )}
            </div>
            <p className="text-muted-foreground truncate text-xs tabular-nums">
              {t("followers", { count: cosplayer.followersCount })}
            </p>
          </div>
        </Link>

        {/* Follow Button - Only show when authenticated and not self */}
        {isAuthenticated && currentUser?.id !== cosplayer.userId && (
          <Button
            type="button"
            size="sm"
            onClick={handleToggleFollow}
            className={cn(
              "relative z-20 h-9 shrink-0 rounded-lg px-3 text-xs transition-colors",
              following
                ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border border"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {following ? (
              <span className="flex items-center gap-1">
                <Check className="size-3" />
                {t("followingBtn")}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Plus className="size-3" />
                {t("followBtn")}
              </span>
            )}
          </Button>
        )}
      </div>

      <div className="bg-muted relative aspect-video overflow-hidden rounded-xl">
        {previewImage ? (
          <Image
            src={previewImage}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-center"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <span className="text-muted-foreground text-2xl font-semibold">
              {initials}
            </span>
          </div>
        )}
        <div className="absolute right-2 bottom-2 left-2 flex flex-wrap gap-1">
          {cosplayer.roleBadge && (
            <span className="bg-background text-foreground rounded-md px-2 py-1 text-xs font-medium">
              {cosplayer.roleBadge}
            </span>
          )}
          {cosplayer.specialties?.slice(0, 2).map((s) => (
            <span
              key={s}
              className="bg-background text-foreground rounded-md px-2 py-1 text-xs"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
