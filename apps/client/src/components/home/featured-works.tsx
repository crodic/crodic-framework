"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowRight, BadgeCheck, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListError } from "@/components/common/list-error";
import { Card, CardContent } from "@/components/ui/card";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getPosts, type PostSummaryResDto } from "@/services/posts";
import { usePostLike } from "@/hooks/use-post-like";
import { useAuthStore } from "@/store/use-auth-store";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

function WorkCard({ post }: { post: PostSummaryResDto }) {
  const t = useTranslations("Home.featuredWorks");
  const tCommon = useTranslations("Common");
  const tExplore = useTranslations("Explore");
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
    <Card className="group h-full justify-between gap-0 overflow-hidden p-0">
      <div className="relative">
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
          <span className="absolute top-2.5 right-2.5 rounded-full bg-black/75 px-2.5 py-1 text-xs font-medium text-white">
            {tagBadgeLabel}
          </span>
        </Link>
        <button
          type="button"
          onClick={toggleLike}
          aria-label={tExplore("likeArtwork", { title: post.title })}
          aria-pressed={isLiked}
          className={cn(
            "focus-visible:ring-ring absolute right-2 bottom-2 inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-black/75 px-2.5 text-xs font-medium text-white transition-colors hover:bg-black focus-visible:ring-2",
            isLiked && "text-rose-200"
          )}
        >
          <Heart
            className={cn("size-4", isLiked && "fill-current")}
            aria-hidden="true"
          />
          <span className="tabular-nums">{likesDisplay}</span>
        </button>
      </div>

      {/* Info */}
      <CardContent className="flex flex-1 flex-col justify-between space-y-2 p-3 sm:p-4">
        <div className="space-y-1.5">
          <Link href={`/posts/${postSlugOrId}`} className="block">
            <h3 className="text-foreground group-hover:text-primary line-clamp-2 text-sm font-semibold transition-colors">
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
  );
}

export function FeaturedWorks() {
  const t = useTranslations("Home.featuredWorks");
  const tCommon = useTranslations("Common");
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
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
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          role="status"
        >
          <span className="sr-only">{tCommon("loading")}</span>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Skeleton key={n} className="aspect-[4/3.6] rounded-xl" />
          ))}
        </div>
      ) : isError && !data ? (
        <ListError onRetry={() => void refetch()} />
      ) : posts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {posts.map((post) => (
              <WorkCard key={post.id} post={post} />
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="h-10 rounded-lg px-5"
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
            </div>
          )}
        </>
      ) : (
        <div className="border-border flex flex-col items-center justify-center rounded-xl border px-4 py-10 text-center">
          <p className="text-muted-foreground text-sm font-medium">
            {t("noWorks")}
          </p>
        </div>
      )}
    </section>
  );
}
