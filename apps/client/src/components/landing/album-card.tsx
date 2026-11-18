"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { PostSummaryResDto } from "@/services/posts";
import { toggleLikePost } from "@/services/posts";
import { useTranslations } from "next-intl";

interface AlbumCardProps {
  album: PostSummaryResDto;
}

export function AlbumCard({ album }: AlbumCardProps) {
  const t = useTranslations("Landing.albums");
  const [isLiked, setIsLiked] = useState(album.isLikedByCurrentUser || false);
  const [likes, setLikes] = useState(album.likesCount);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikes((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));
    try {
      await toggleLikePost(album.id);
    } catch {
      setIsLiked(!nextLiked);
      setLikes((prev) => (!nextLiked ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  return (
    <Link
      href={`/post/${album.slug || album.id}`}
      className="group border-border/60 bg-muted/20 hover:border-primary/80 hover:shadow-primary/25 relative flex aspect-[3/4] cursor-pointer flex-col justify-end overflow-hidden rounded-2xl border p-4 transition-all duration-500 hover:shadow-2xl sm:aspect-[9/13]"
    >
      {/* Background artwork cover */}
      <Image
        src={album.coverImageUrl || "/placeholder-avatar.png"}
        alt={`${album.characterName || album.title} cosplay album`}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* Dark gradient overlay for contrast and atmospheric feel */}
      <div
        className="from-background via-background/30 pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent opacity-85 transition-opacity group-hover:opacity-90"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10 ring-inset"
        aria-hidden="true"
      />

      {/* Content at bottom */}
      <div className="relative z-10 flex flex-col gap-2.5">
        {/* Heart / Like pill */}
        <div>
          <button
            type="button"
            onClick={handleLike}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur-md transition-all",
              isLiked
                ? "border-rose-500/50 bg-rose-500/20 text-rose-300"
                : "bg-background/60 border-border/40 text-foreground hover:bg-background/80"
            )}
            aria-label={t("likeAlbumAria", {
              name: album.characterName || album.title,
            })}
          >
            <Heart
              className={cn(
                "size-3.5 transition-transform group-hover:scale-110",
                isLiked
                  ? "fill-rose-500 text-rose-500"
                  : "fill-rose-500/80 text-rose-500"
              )}
            />
            <span>{likes.toLocaleString()}</span>
          </button>
        </div>

        {/* Character / Author Row */}
        <div className="flex items-center gap-2">
          {/* Avatar */}
          <div className="border-primary/40 bg-muted relative size-6 shrink-0 overflow-hidden rounded-full border">
            <Image
              src={album.author?.avatarUrl || "/placeholder-avatar.png"}
              alt={album.author?.displayName || "Author"}
              fill
              sizes="24px"
              className="object-cover"
            />
          </div>

          {/* Character Name / Title */}
          <span className="text-foreground group-hover:text-primary truncate text-sm font-bold tracking-wide transition-colors">
            {album.characterName || album.title}
          </span>
        </div>
      </div>
    </Link>
  );
}
