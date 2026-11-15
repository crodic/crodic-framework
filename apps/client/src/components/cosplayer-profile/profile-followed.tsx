"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { BadgeCheck, Check, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FollowedCosplayer } from "./profile-types";
import { cn } from "@/lib/utils";

interface ProfileFollowedProps {
  initialFollowed: FollowedCosplayer[];
}

export function ProfileFollowed({ initialFollowed }: ProfileFollowedProps) {
  const [followedList, setFollowedList] =
    useState<FollowedCosplayer[]>(initialFollowed);

  const toggleFollow = (id: string) => {
    setFollowedList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFollowing: !item.isFollowing } : item
      )
    );
  };

  const getCosplayerSlug = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("soriko")) return "haianh";
    if (lower.includes("kiriko")) return "haianh";
    return "haianh";
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs sm:text-sm">
          Đang theo dõi{" "}
          <strong className="text-foreground font-bold">
            {followedList.filter((f) => f.isFollowing).length}
          </strong>{" "}
          cosplayer
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {followedList.map((cosplayer) => {
          const slug = getCosplayerSlug(cosplayer.name);

          return (
            <div
              key={cosplayer.id}
              className="group border-border/70 bg-card/60 hover:border-primary/50 hover:shadow-primary/10 relative flex flex-col justify-between overflow-hidden rounded-3xl border backdrop-blur-md transition-all duration-300 hover:shadow-xl"
            >
              {/* 1. Top Cover Banner (Bleeds to edges) */}
              <Link
                href={`/cosplayer/${slug}`}
                className="bg-muted relative block aspect-[16/10] w-full overflow-hidden"
              >
                <Image
                  src={cosplayer.previewPhoto}
                  alt={cosplayer.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div className="from-background/95 via-background/30 absolute inset-0 bg-gradient-to-t to-transparent" />

                {/* Floating Followers Count Badge */}
                {cosplayer.followersCount && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full border border-white/10 bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-md">
                    <Users className="text-primary size-3" />
                    <span>{cosplayer.followersCount}</span>
                  </div>
                )}
              </Link>

              {/* 2. Overlapping Avatar & Cosplayer Info */}
              <div className="relative px-4.5 pt-0 pb-4.5">
                {/* Overlapping Avatar */}
                <div className="-mt-8 mb-3 flex items-end justify-between">
                  <Link href={`/cosplayer/${slug}`} className="relative block">
                    <div className="border-background bg-muted ring-primary/40 group-hover:ring-primary relative size-15 shrink-0 overflow-hidden rounded-full border-2 shadow-lg ring-2 transition-all">
                      <Image
                        src={cosplayer.avatarUrl}
                        alt={cosplayer.name}
                        fill
                        sizes="60px"
                        className="object-cover"
                      />
                    </div>
                  </Link>
                </div>

                {/* Name & Handle (Full width, no more @kiri... truncation!) */}
                <Link
                  href={`/cosplayer/${slug}`}
                  className="group/name block space-y-0.5"
                >
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-foreground group-hover/name:text-primary text-base font-bold tracking-tight transition-colors">
                      {cosplayer.name}
                    </h4>
                    {cosplayer.isVerified && (
                      <BadgeCheck className="size-4 shrink-0 fill-sky-400 text-sky-400" />
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs font-medium">
                    {cosplayer.handle}
                  </p>
                </Link>

                {/* Full-width Follow Button */}
                <div className="pt-4">
                  <Button
                    type="button"
                    variant={cosplayer.isFollowing ? "outline" : "default"}
                    onClick={() => toggleFollow(cosplayer.id)}
                    className={cn(
                      "h-9 w-full cursor-pointer rounded-xl text-xs font-semibold transition-all",
                      cosplayer.isFollowing
                        ? "border-border/80 text-muted-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                        : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                    )}
                  >
                    {cosplayer.isFollowing ? (
                      <>
                        <Check className="text-primary mr-1.5 size-3.5" />
                        <span>Đang theo dõi</span>
                      </>
                    ) : (
                      <>
                        <Plus className="mr-1.5 size-3.5" />
                        <span>Theo dõi</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
