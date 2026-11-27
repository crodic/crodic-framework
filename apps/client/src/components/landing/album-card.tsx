"use client";

import React from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { PostSummaryResDto } from "@/services/posts";
import { usePostLike } from "@/hooks/use-post-like";
import { useTranslations } from "next-intl";

interface AlbumCardProps {
  album: PostSummaryResDto;
}

export function AlbumCard({ album }: AlbumCardProps) {
  const t = useTranslations("Landing.albums");
  const {
    isLiked,
    likesCount: likes,
    toggleLike,
  } = usePostLike({
    postId: album.id,
    initialLiked: album.isLikedByCurrentUser,
    initialLikesCount: album.likesCount,
    postSlugOrId: album.slug || album.id,
  });

  const title = album.characterName || album.title;
  const authorName = album.author?.displayName;

  return (
    <article className="group relative isolate flex aspect-[3/4] items-end overflow-hidden rounded-xl bg-neutral-800 p-4 text-white sm:aspect-[9/13]">
      {album.coverImageUrl && (
        <Image
          src={album.coverImageUrl}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-center"
        />
      )}
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent"
        aria-hidden="true"
      />

      <div className="flex w-full items-center gap-3">
        <Link
          href={`/posts/${encodeURIComponent(String(album.slug || album.id).trim())}`}
          className="z-10 flex min-w-0 flex-1 items-center gap-2 rounded-md text-sm font-semibold underline-offset-4 after:absolute after:inset-0 hover:underline focus-visible:outline-none focus-visible:after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-white focus-visible:after:ring-inset"
        >
          {authorName && (
            <span className="relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-700 text-xs">
              {album.author?.avatarUrl ? (
                <Image
                  src={album.author.avatarUrl}
                  alt={authorName}
                  fill
                  sizes="28px"
                  className="object-cover"
                />
              ) : (
                <span title={authorName} aria-label={authorName}>
                  {authorName.slice(0, 1).toUpperCase()}
                </span>
              )}
            </span>
          )}
          <span className="truncate">{title}</span>
        </Link>

        <button
          type="button"
          onClick={toggleLike}
          className={cn(
            "relative z-10 inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm tabular-nums transition-colors focus-visible:ring-2 focus-visible:ring-white",
            isLiked
              ? "bg-rose-900 text-white hover:bg-rose-800"
              : "bg-black/70 text-white hover:bg-black"
          )}
          aria-label={t("likeAlbumAria", { name: title })}
          aria-pressed={isLiked}
        >
          <Heart
            className={cn("size-4", isLiked && "fill-current")}
            aria-hidden="true"
          />
          <span>{likes.toLocaleString()}</span>
        </button>
      </div>
    </article>
  );
}
