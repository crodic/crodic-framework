"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { BadgeCheck, Bookmark, Heart } from "lucide-react";
import { ExploreItem } from "./explore-types";
import { cn } from "@/lib/utils";

interface ExploreCardProps {
  item: ExploreItem;
}

export function ExploreCard({ item }: ExploreCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(item.likesCount);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked((prev) => !prev);
    if (!isLiked) {
      const num = parseFloat(item.likesCount);
      setLikes(isNaN(num) ? "2.5K" : `${(num + 0.1).toFixed(1)}K`);
    } else {
      setLikes(item.likesCount);
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked((prev) => !prev);
  };

  return (
    <div className="group flex cursor-pointer flex-col">
      {/* Top Image Thumbnail */}
      <Link
        href={`/post/${item.id}`}
        className="bg-muted border-border/70 group-hover:border-primary/50 group-hover:shadow-primary/5 relative block aspect-[3/4] w-full overflow-hidden rounded-2xl border shadow-xs transition-all duration-300 group-hover:shadow-md"
      >
        <Image
          src={item.image}
          alt={item.character}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Subtle hover gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </Link>

      {/* Line 1: Character Title */}
      <Link href={`/post/${item.id}`} className="block">
        <h3 className="text-foreground group-hover:text-primary mt-2 truncate text-sm font-bold transition-colors">
          {item.character}
        </h3>
      </Link>

      {/* Line 2: Author info on left, Like & Bookmark on right */}
      <div className="text-muted-foreground mt-1 flex items-center justify-between gap-2 text-xs">
        {/* Left: Cosplayer Avatar & Name (Links to public cosplayer profile) */}
        <Link
          href={`/cosplayer/${item.author.name.toLowerCase() === "soriko" ? "soriko" : "kiriko"}`}
          onClick={(e) => e.stopPropagation()}
          className="group/author flex min-w-0 items-center gap-1.5 transition-opacity hover:opacity-85"
        >
          <div className="border-border/80 bg-muted relative size-4.5 shrink-0 overflow-hidden rounded-full border">
            <Image
              src={item.author.avatarUrl}
              alt={item.author.name}
              fill
              sizes="18px"
              className="object-cover"
            />
          </div>
          <span className="text-muted-foreground group-hover/author:text-primary max-w-[85px] truncate text-xs font-medium transition-colors sm:max-w-[110px]">
            {item.author.name}
          </span>
          {item.author.isVerified && (
            <BadgeCheck
              className="size-3 shrink-0 fill-sky-400/20 text-sky-400"
              aria-label="Đã xác minh"
            />
          )}
        </Link>

        {/* Right: Likes & Bookmark */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={handleLike}
            className="text-muted-foreground inline-flex cursor-pointer items-center gap-1 text-[11px] font-medium transition-colors select-none hover:text-rose-400"
            aria-label={`Thích ${item.character}`}
          >
            <Heart
              className={cn(
                "size-3",
                isLiked
                  ? "fill-rose-500 text-rose-500"
                  : "fill-rose-500/80 text-rose-500"
              )}
            />
            <span>{likes}</span>
          </button>

          <button
            type="button"
            onClick={handleBookmark}
            className={cn(
              "text-muted-foreground hover:text-primary cursor-pointer p-0.5 transition-colors select-none",
              isBookmarked && "text-primary"
            )}
            aria-label="Lưu tác phẩm"
          >
            <Bookmark
              className={cn(
                "size-3.5",
                isBookmarked && "fill-primary text-primary"
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
