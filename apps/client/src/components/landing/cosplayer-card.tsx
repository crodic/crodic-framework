"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FeaturedCosplayer } from "./landing-types";
import { BadgeCheck, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CosplayerCardProps {
  cosplayer: FeaturedCosplayer;
}

export function CosplayerCard({ cosplayer }: CosplayerCardProps) {
  const [following, setFollowing] = useState(cosplayer.isFollowing || false);

  const toggleFollow = () => {
    setFollowing((prev) => !prev);
  };

  return (
    <div className="group border-border/70 bg-card/60 hover:border-primary/50 hover:bg-card/80 hover:shadow-primary/5 flex flex-col justify-between rounded-2xl border p-4 backdrop-blur-sm transition-all duration-300 hover:shadow-md">
      {/* Card Header: Avatar + Info + Follow Button */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          {/* Avatar with subtle ring */}
          <div className="border-border/80 bg-muted/50 relative size-10 shrink-0 overflow-hidden rounded-full border">
            <Image
              src={cosplayer.avatarUrl}
              alt={cosplayer.name}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>

          {/* Name & Followers */}
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-foreground group-hover:text-primary truncate text-sm font-bold transition-colors">
                {cosplayer.name}
              </span>
              {cosplayer.isVerified && (
                <BadgeCheck
                  className="size-3.5 shrink-0 fill-sky-400/20 text-sky-400"
                  aria-label="Đã xác minh"
                />
              )}
            </div>
            <p className="text-muted-foreground truncate text-xs">
              {cosplayer.followerCount}
            </p>
          </div>
        </div>

        {/* Follow Button */}
        <Button
          type="button"
          size="sm"
          onClick={toggleFollow}
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

      {/* Card Body: 3 Work Preview Thumbnails */}
      <div className="mt-3.5 grid grid-cols-3 gap-2">
        {cosplayer.works.map((work) => (
          <div
            key={work.id}
            className="group/thumb border-border/40 bg-muted/40 relative aspect-square cursor-pointer overflow-hidden rounded-lg border"
          >
            <Image
              src={work.imageUrl}
              alt={work.title || "Tác phẩm cosplay"}
              fill
              sizes="(max-width: 640px) 25vw, (max-width: 1024px) 15vw, 90px"
              className="object-cover object-center transition-transform duration-300 group-hover/thumb:scale-110"
            />
            {/* Subtle hover overlay */}
            <div
              className="bg-primary/10 pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover/thumb:opacity-100"
              aria-hidden="true"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
