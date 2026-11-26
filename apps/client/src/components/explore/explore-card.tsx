"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { BadgeCheck, Bookmark, Heart, Video } from "lucide-react";
import { useTranslations } from "next-intl";
import type { PostSummaryResDto } from "@/services/posts";
import { usePostLike } from "@/hooks/use-post-like";
import { motion } from "@/components/ui/motion-primitives";
import { cn } from "@/lib/utils";

interface ExploreCardProps {
  item: PostSummaryResDto;
}

export function ExploreCard({ item }: ExploreCardProps) {
  const t = useTranslations("Explore");
  const { isLiked, likesCount, toggleLike } = usePostLike({
    postId: item.id,
    initialLiked: item.isLikedByCurrentUser,
    initialLikesCount: item.likesCount,
    postSlugOrId: item.slug || item.id,
  });
  const [isBookmarked, setIsBookmarked] = useState(
    item.isSavedByCurrentUser ?? false
  );

  const postSlugOrId = encodeURIComponent(String(item.slug || item.id).trim());
  const authorHandle = item.author.handle.replace("@", "") || item.author.id;

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked((prev) => !prev);
  };

  const formattedLikes =
    likesCount >= 1000
      ? `${(likesCount / 1000).toFixed(1)}k`
      : String(likesCount);

  return (
    <div className="group flex cursor-pointer flex-col">
      {/* Top Image Thumbnail with Modern Spring Lift */}
      <motion.div
        whileHover={{
          y: -5,
          transition: { type: "spring", stiffness: 350, damping: 25 },
        }}
        whileTap={{ scale: 0.98 }}
        className="w-full"
      >
        <Link
          href={`/posts/${postSlugOrId}`}
          className="bg-muted relative block aspect-[3/4] w-full overflow-hidden rounded-xl"
        >
          <Image
            src={item.coverImageUrl}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-top transition-opacity duration-300 group-hover:opacity-95"
          />

          {/* Subtle hover gradient overlay */}

          {/* Top-Left Video Short Badge */}
          {(item.postType === "video" || Boolean(item.videoUrl)) && (
            <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-md bg-black/75 px-2 py-1 text-xs font-medium text-white">
              <Video className="size-3 text-pink-400" />
              <span>Video</span>
            </div>
          )}

          {/* Top-Right Tag Badge from Tag Management */}
          {(item.tagNamesCache?.[0] ||
            item.characterName ||
            item.fandomName) && (
            <span className="absolute top-2 right-2 rounded-md bg-black/75 px-2 py-1 text-xs font-medium text-white">
              #
              {item.tagNamesCache?.[0] || item.characterName || item.fandomName}
            </span>
          )}
        </Link>
      </motion.div>

      {/* Line 1: Character / Post Title */}
      <Link href={`/posts/${postSlugOrId}`} className="block">
        <h3 className="text-foreground group-hover:text-primary mt-2 line-clamp-2 text-sm font-semibold transition-colors">
          {item.title}
        </h3>
      </Link>

      {/* Line 2: Author info on left, Like & Bookmark on right */}
      <div className="text-muted-foreground mt-1 flex items-center justify-between gap-2 text-xs">
        {/* Left: Cosplayer Avatar & Name */}
        <Link
          href={`/cosplayer/${authorHandle}`}
          onClick={(e) => e.stopPropagation()}
          className="group/author flex min-w-0 items-center gap-1.5 transition-opacity hover:opacity-85"
        >
          <div className="border-border/80 bg-muted relative size-4.5 shrink-0 overflow-hidden rounded-full border">
            {item.author.avatarUrl ? (
              <Image
                src={item.author.avatarUrl}
                alt={item.author.displayName}
                fill
                sizes="18px"
                className="object-cover"
              />
            ) : (
              <div className="bg-primary/20 text-primary flex size-full items-center justify-center text-[9px] font-bold">
                {item.author.displayName.slice(0, 1)}
              </div>
            )}
          </div>
          <span className="text-muted-foreground group-hover/author:text-primary truncate text-xs font-medium transition-colors">
            {item.author.displayName}
          </span>
          {item.author.isVerified && (
            <BadgeCheck
              className="size-3 shrink-0 fill-sky-400/20 text-sky-400"
              aria-label={t("verifiedBadge")}
            />
          )}
        </Link>

        {/* Right: Likes & Bookmark with spring micro-interactions */}
        <div className="flex shrink-0 items-center gap-2">
          <motion.button
            type="button"
            onClick={toggleLike}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            className="text-muted-foreground inline-flex min-h-8 min-w-8 cursor-pointer items-center justify-center gap-1 rounded-md text-xs font-medium transition-colors select-none hover:text-rose-400"
            aria-label={t("likeArtwork", { title: item.title })}
          >
            <Heart
              className={cn(
                "size-3 transition-colors",
                isLiked ? "fill-rose-500 text-rose-500" : "text-rose-500"
              )}
            />
            <span className="tabular-nums">{formattedLikes}</span>
          </motion.button>

          <motion.button
            type="button"
            onClick={handleBookmark}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.85 }}
            className={cn(
              "text-muted-foreground hover:text-primary cursor-pointer p-0.5 transition-colors select-none",
              isBookmarked && "text-primary"
            )}
            aria-label={t("saveArtwork")}
          >
            <Bookmark
              className={cn(
                "size-3.5",
                isBookmarked && "fill-primary text-primary"
              )}
            />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
