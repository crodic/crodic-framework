"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowRight, BadgeCheck, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getPosts, type PostSummaryResDto } from "@/services/posts";
import { usePostLike } from "@/hooks/use-post-like";
import { useAuthStore } from "@/store/use-auth-store";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

function WorkCard({
  post,
  index = 0,
}: {
  post: PostSummaryResDto;
  index?: number;
}) {
  const t = useTranslations("Home.featuredWorks");
  const tCommon = useTranslations("Common");
  const { isLiked, likesCount, toggleLike } = usePostLike({
    postId: post.id,
    initialLiked: post.isLikedByCurrentUser,
    initialLikesCount: post.likesCount,
    postSlugOrId: post.slug || post.id,
  });

  const coverUrl = post.coverImageUrl || "/logo.png";
  const likesDisplay =
    likesCount >= 1000 ? `${(likesCount / 1000).toFixed(1)}K` : `${likesCount}`;
  type CategoryKey =
    | "series"
    | "general"
    | "group"
    | "premium"
    | "studio"
    | "event"
    | "original"
    | "casual";

  const knownCategories: readonly string[] = [
    "series",
    "general",
    "group",
    "premium",
    "studio",
    "event",
    "original",
    "casual",
  ];

  const primaryTag =
    (post.tagNamesCache && post.tagNamesCache.length > 0
      ? post.tagNamesCache[0]
      : null) ||
    post.characterName ||
    post.fandomName;

  const tagBadgeLabel = primaryTag
    ? `#${primaryTag}`
    : post.albumCategory && knownCategories.includes(post.albumCategory)
      ? t(`categories.${post.albumCategory as CategoryKey}`)
      : t("album");

  const postSlugOrId = encodeURIComponent(String(post.slug || post.id).trim());

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{
        duration: 0.45,
        delay: Math.min(index * 0.05, 0.3),
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      whileHover={{
        y: -6,
        transition: { type: "spring", stiffness: 350, damping: 25 },
      }}
      className="h-full"
    >
      <Card className="group border-border/70 bg-card/60 hover:border-primary/50 hover:shadow-primary/10 flex h-full flex-col justify-between gap-0 overflow-hidden rounded-2xl p-0 backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
        {/* Top Image Showcase */}
        <Link
          href={`/posts/${postSlugOrId}`}
          className="bg-muted relative block aspect-[4/3.6] w-full cursor-pointer overflow-hidden"
        >
          <Image
            src={coverUrl}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-top transition-opacity duration-300 group-hover:opacity-95"
          />

          {/* Top-Right Tag Badge */}
          <span className="absolute top-2.5 right-2.5 rounded-full border border-white/10 bg-black/60 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md select-none">
            {tagBadgeLabel}
          </span>

          {/* Bottom-Right Heart Like Badge */}
          <motion.button
            type="button"
            onClick={toggleLike}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.82 }}
            className={cn(
              "absolute right-2.5 bottom-2.5 z-10 inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-md transition-colors select-none",
              isLiked
                ? "border-rose-500/50 bg-rose-500/25 text-rose-300"
                : "border-white/10 bg-black/60 text-white hover:bg-black/80"
            )}
            aria-label={`Like ${post.title}`}
          >
            <motion.div
              animate={isLiked ? { scale: [1, 1.4, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Heart
                className={cn(
                  "size-3 text-rose-500 transition-colors",
                  isLiked && "fill-rose-500"
                )}
              />
            </motion.div>
            <span>{likesDisplay}</span>
          </motion.button>
        </Link>

        {/* Info */}
        <CardContent className="flex flex-1 flex-col justify-between space-y-2 p-3 sm:p-3.5">
          <div className="space-y-1.5">
            <Link href={`/posts/${postSlugOrId}`} className="block">
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
                  aria-label={tCommon("verified")}
                />
              )}
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function FeaturedWorks() {
  const t = useTranslations("Home.featuredWorks");
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["public-featured-works", isAuthenticated],
      queryFn: ({ pageParam = 1 }) =>
        getPosts({ page: pageParam, limit: 9, sort: "-likesCount" }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        const currentPage = lastPage.meta?.currentPage ?? 1;
        const totalPages = lastPage.meta?.totalPages ?? 1;
        return currentPage < totalPages ? currentPage + 1 : undefined;
      },
      enabled: !isHydrating,
      staleTime: 60 * 1000,
    });

  const posts = data?.pages.flatMap((page) => page.data) || [];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-lg font-bold tracking-tight sm:text-xl">
          {t("title")}
        </h2>
        <Link
          href="/explore"
          className="text-primary hover:text-primary/80 group inline-flex items-center gap-1 text-xs font-semibold transition-colors sm:text-sm"
        >
          <span>{t("exploreMore")}</span>
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1 sm:size-4" />
        </Link>
      </div>

      {isLoading || isHydrating ? (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="border-border/70 bg-card/40 flex aspect-[4/3.6] animate-pulse items-center justify-center rounded-2xl border"
            >
              <Loader2 className="text-muted-foreground size-5 animate-spin" />
            </div>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {posts.map((post, idx) => (
              <WorkCard key={post.id} post={post} index={idx % 9} />
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="border-border/80 hover:bg-accent h-10 cursor-pointer gap-2 rounded-xl px-6 text-xs font-semibold shadow-xs sm:text-sm"
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>{t("loadingMore")}</span>
                    </>
                  ) : (
                    <span>{t("loadMore")}</span>
                  )}
                </Button>
              </motion.div>
            </div>
          )}
        </>
      ) : (
        <div className="border-border/60 bg-card/40 flex min-h-[180px] flex-col items-center justify-center rounded-2xl border p-8 text-center backdrop-blur-xs">
          <p className="text-muted-foreground text-sm font-medium">
            {t("noWorks")}
          </p>
        </div>
      )}
    </section>
  );
}
