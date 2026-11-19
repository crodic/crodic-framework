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
    <div className="group border-border/70 bg-card/60 hover:border-primary/50 hover:bg-card/80 hover:shadow-primary/5 flex flex-col justify-between rounded-2xl border p-4 backdrop-blur-sm transition-all duration-300 hover:shadow-md">
      {/* Card Header: Avatar + Info + Follow Button */}
      <div className="flex items-center justify-between gap-2.5">
        <Link
          href={`/cosplayer/${cosplayer.slug || cosplayer.id}`}
          className="flex min-w-0 items-center gap-2.5"
        >
          {/* Avatar with subtle ring */}
          <Avatar className="border-border/80 size-10 shrink-0 border">
            {cosplayer.avatarUrl && (
              <AvatarImage
                src={cosplayer.avatarUrl}
                alt={cosplayer.displayName}
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
              <span className="text-foreground group-hover:text-primary truncate text-sm font-bold transition-colors">
                {cosplayer.displayName}
              </span>
              {cosplayer.isVerified && (
                <BadgeCheck
                  className="size-3.5 shrink-0 fill-sky-400/20 text-sky-400"
                  aria-label={t("verifiedBadge")}
                />
              )}
            </div>
            <p className="text-muted-foreground truncate text-xs">
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
              "h-7 shrink-0 cursor-pointer rounded-full px-3 text-xs font-medium transition-all",
              following
                ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border border"
                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 shadow-2xs"
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

      {/* Card Body: Cover Image or Specialties Preview */}
      <Link
        href={`/cosplayer/${cosplayer.slug || cosplayer.id}`}
        className="mt-3.5 block"
      >
        <div className="border-border/40 bg-muted/40 relative aspect-[16/9] w-full overflow-hidden rounded-xl border">
          {previewImage ? (
            <Image
              src={previewImage}
              alt={cosplayer.displayName}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="from-primary/10 to-muted flex size-full items-center justify-center bg-gradient-to-br">
              <span className="text-primary/40 text-2xl font-black">
                {initials}
              </span>
            </div>
          )}
          <div className="from-background/90 via-background/20 absolute inset-0 bg-gradient-to-t to-transparent" />
          <div className="absolute right-2 bottom-2 left-2 flex flex-wrap gap-1">
            {cosplayer.roleBadge && (
              <span className="border-border/40 bg-background/85 text-foreground rounded-md border px-1.5 py-0.5 text-[10px] font-semibold backdrop-blur-xs">
                {cosplayer.roleBadge}
              </span>
            )}
            {cosplayer.specialties?.slice(0, 2).map((s) => (
              <span
                key={s}
                className="border-primary/20 bg-primary/20 text-primary rounded-md border px-1.5 py-0.5 text-[10px] font-medium backdrop-blur-xs"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
}
