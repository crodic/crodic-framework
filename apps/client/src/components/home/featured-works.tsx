"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { BadgeCheck, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  getPosts,
  toggleLikePost,
  type PostSummaryResDto,
} from "@/services/posts";
import { cn } from "@/lib/utils";

function WorkCard({ post }: { post: PostSummaryResDto }) {
  const t = useTranslations("Home.featuredWorks");
  const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser ?? false);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked((prev) => !prev);
    setLikesCount((prev) => (isLiked ? Math.max(0, prev - 1) : prev + 1));
    await toggleLikePost(post.id).catch(() => undefined);
  };

  const coverUrl = post.coverImageUrl || "/logo.png";
  const likesDisplay =
    likesCount >= 1000 ? `${(likesCount / 1000).toFixed(1)}K` : `${likesCount}`;

  return (
    <Card className="group border-border/70 bg-card/60 hover:border-primary/50 hover:shadow-primary/5 flex flex-col justify-between gap-0 overflow-hidden rounded-2xl p-0 backdrop-blur-sm transition-all duration-300 hover:shadow-md">
      {/* Top Image Showcase */}
      <Link
        href={`/post/${post.slug || post.id}`}
        className="bg-muted relative block aspect-[4/3.6] w-full cursor-pointer overflow-hidden"
      >
        <Image
          src={coverUrl}
          alt={post.title}
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top-Right Tag Badge */}
        <span className="absolute top-2.5 right-2.5 rounded-full border border-white/10 bg-black/60 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md select-none">
          {post.albumCategoryLabel || post.albumCategory || t("photoset")}
        </span>

        {/* Bottom-Right Heart Like Badge */}
        <button
          type="button"
          onClick={handleLike}
          className={cn(
            "absolute right-2.5 bottom-2.5 z-10 inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-md transition-all select-none",
            isLiked
              ? "border-rose-500/50 bg-rose-500/25 text-rose-300"
              : "border-white/10 bg-black/60 text-white hover:bg-black/80"
          )}
          aria-label={`Like ${post.title}`}
        >
          <Heart className="size-3 fill-rose-500 text-rose-500" />
          <span>{likesDisplay}</span>
        </button>
      </Link>

      {/* Info & Actions */}
      <CardContent className="flex flex-1 flex-col justify-between space-y-2.5 p-3 sm:p-3.5">
        <div className="space-y-1.5">
          <Link href={`/post/${post.slug || post.id}`} className="block">
            <h3 className="text-foreground group-hover:text-primary line-clamp-1 text-sm font-bold transition-colors">
              {post.title}
            </h3>
          </Link>

          {/* Author Row */}
          <Link
            href={`/cosplayer/${post.author.handle.replace("@", "") || post.author.id}`}
            className="group/author flex cursor-pointer items-center gap-2"
          >
            <div className="border-border/80 bg-muted relative size-6 shrink-0 overflow-hidden rounded-full border">
              {post.author.avatarUrl ? (
                <Image
                  src={post.author.avatarUrl}
                  alt={post.author.displayName}
                  fill
                  sizes="24px"
                  className="object-cover"
                />
              ) : (
                <div className="bg-primary/20 text-primary flex size-full items-center justify-center text-[10px] font-bold">
                  {post.author.displayName.slice(0, 1)}
                </div>
              )}
            </div>
            <span className="text-muted-foreground group-hover/author:text-primary truncate text-xs font-medium transition-colors">
              {post.author.displayName}
            </span>
            {post.author.isVerified && (
              <BadgeCheck
                className="size-3.5 shrink-0 fill-sky-400/20 text-sky-400"
                aria-label="Verified"
              />
            )}
          </Link>
        </div>

        {/* Card CTA */}
        <div className="border-border/30 border-t pt-1">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hover:bg-primary/10 hover:text-primary h-7.5 w-full cursor-pointer rounded-lg text-xs font-semibold"
          >
            <Link href={`/post/${post.slug || post.id}`}>
              {t("viewProject")}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function FeaturedWorks() {
  const t = useTranslations("Home.featuredWorks");
  const { data: postsRes, isLoading } = useQuery({
    queryKey: ["public-featured-works"],
    queryFn: () => getPosts({ limit: 6, sort: "-likesCount" }),
    staleTime: 60 * 1000,
  });

  const posts = postsRes?.data || [];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-lg font-bold tracking-tight sm:text-xl">
          {t("title")}
        </h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="border-border/70 bg-card/40 flex aspect-[4/3.6] animate-pulse items-center justify-center rounded-2xl border"
            >
              <Loader2 className="text-muted-foreground size-5 animate-spin" />
            </div>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {posts.map((post) => (
            <WorkCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="border-border/60 bg-card/30 flex flex-col items-center justify-center rounded-2xl border border-dashed py-12 text-center">
          <p className="text-muted-foreground text-sm">{t("noWorks")}</p>
        </div>
      )}
    </section>
  );
}
