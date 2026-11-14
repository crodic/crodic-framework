"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { BadgeCheck, Check, Plus, UserX } from "lucide-react";
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs sm:text-sm">
          Đang theo dõi{" "}
          <strong className="text-foreground">
            {followedList.filter((f) => f.isFollowing).length}
          </strong>{" "}
          cosplayer
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {followedList.map((cosplayer) => {
          return (
            <div
              key={cosplayer.id}
              className="group border-border/70 bg-card/60 hover:border-primary/50 relative flex flex-col justify-between overflow-hidden rounded-2xl border p-3 backdrop-blur-sm transition-all hover:shadow-md sm:p-4"
            >
              {/* Header info */}
              <div className="mb-3 flex items-center justify-between gap-3">
                <Link
                  href={`/cosplayer/${cosplayer.name.toLowerCase() === "soriko" ? "soriko" : "kiriko"}`}
                  className="group/author flex min-w-0 items-center gap-2.5"
                >
                  <div className="border-border/80 bg-muted relative size-10 shrink-0 overflow-hidden rounded-full border">
                    <Image
                      src={cosplayer.avatarUrl}
                      alt={cosplayer.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-foreground group-hover/author:text-primary truncate text-xs font-bold transition-colors sm:text-sm">
                        {cosplayer.handle}
                      </span>
                      {cosplayer.isVerified && (
                        <BadgeCheck className="size-3.5 shrink-0 fill-sky-400 text-sky-400" />
                      )}
                    </div>
                    <p className="text-muted-foreground truncate text-[11px]">
                      {cosplayer.name}
                    </p>
                  </div>
                </Link>

                {/* Follow / Unfollow Toggle */}
                <Button
                  type="button"
                  size="sm"
                  variant={cosplayer.isFollowing ? "secondary" : "default"}
                  onClick={() => toggleFollow(cosplayer.id)}
                  className={cn(
                    "h-8 shrink-0 rounded-xl px-3 text-xs font-semibold transition-all",
                    cosplayer.isFollowing
                      ? "bg-secondary hover:bg-secondary/80 border-border text-foreground border"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {cosplayer.isFollowing ? (
                    <>
                      <Check className="text-primary mr-1 size-3" />
                      <span>Đang theo dõi</span>
                    </>
                  ) : (
                    <>
                      <Plus className="mr-1 size-3" />
                      <span>Theo dõi lại</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Large Preview Photo */}
              <Link
                href={`/cosplayer/${cosplayer.name.toLowerCase() === "soriko" ? "soriko" : "kiriko"}`}
                className="bg-muted/60 border-border/40 relative block aspect-[16/9] w-full overflow-hidden rounded-xl border"
              >
                <Image
                  src={cosplayer.previewPhoto}
                  alt={cosplayer.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
