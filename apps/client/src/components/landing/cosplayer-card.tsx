"use client";

import React, { useState } from "react";
import Image from "next/image";
import { BadgeCheck, Check, Plus } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { CosplayerSummaryResDto } from "@/services/cosplayer";
import { toggleFollow } from "@/services/social";
import { useAuthStore } from "@/store/use-auth-store";

interface CosplayerCardProps {
  cosplayer: CosplayerSummaryResDto;
}

export function CosplayerCard({ cosplayer }: CosplayerCardProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();
  const [following, setFollowing] = useState(false);

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để theo dõi cosplayer!");
      router.push("/auth/login?from=/landing");
      return;
    }

    try {
      const res = await toggleFollow(cosplayer.userId);
      setFollowing(res.following);
      if (res.following) {
        toast.success(`Đã theo dõi ${cosplayer.displayName}`);
      } else {
        toast.info(`Đã hủy theo dõi ${cosplayer.displayName}`);
      }
    } catch {
      toast.error("Có lỗi xảy ra khi cập nhật theo dõi.");
    }
  };

  return (
    <div className="group border-border/70 bg-card/60 hover:border-primary/50 hover:bg-card/80 hover:shadow-primary/5 flex flex-col justify-between rounded-2xl border p-4 backdrop-blur-sm transition-all duration-300 hover:shadow-md">
      {/* Card Header: Avatar + Info + Follow Button */}
      <div className="flex items-center justify-between gap-2.5">
        <Link
          href={`/cosplayer/${cosplayer.slug || cosplayer.id}`}
          className="flex min-w-0 items-center gap-2.5"
        >
          {/* Avatar with subtle ring */}
          <div className="border-border/80 bg-muted/50 relative size-10 shrink-0 overflow-hidden rounded-full border">
            <Image
              src={cosplayer.avatarUrl || "/placeholder-avatar.png"}
              alt={cosplayer.displayName}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>

          {/* Name & Followers */}
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-foreground group-hover:text-primary truncate text-sm font-bold transition-colors">
                {cosplayer.displayName}
              </span>
              {cosplayer.isVerified && (
                <BadgeCheck
                  className="size-3.5 shrink-0 fill-sky-400/20 text-sky-400"
                  aria-label="Đã xác minh"
                />
              )}
            </div>
            <p className="text-muted-foreground truncate text-xs">
              {cosplayer.followersCount.toLocaleString()} followers
            </p>
          </div>
        </Link>

        {/* Follow Button */}
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
              Đã theo dõi
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Plus className="size-3" />
              Theo dõi
            </span>
          )}
        </Button>
      </div>

      {/* Card Body: Cover Image or Specialties Preview */}
      <Link
        href={`/cosplayer/${cosplayer.slug || cosplayer.id}`}
        className="mt-3.5 block"
      >
        <div className="border-border/40 bg-muted/40 relative aspect-[16/9] w-full overflow-hidden rounded-xl border">
          <Image
            src={
              cosplayer.coverUrl ||
              cosplayer.avatarUrl ||
              "/placeholder-avatar.png"
            }
            alt={cosplayer.displayName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
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
