"use client";

import React from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { ArrowLeft, ChevronRight, Compass, Sparkles, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ExploreCard } from "@/components/explore/explore-card";
import type {
  PostDetailResDto,
  PostCommentResDto,
  PostSummaryResDto,
} from "@/services/posts";
import { PostCarousel } from "./post-carousel";
import { PostInfo } from "./post-info";

interface PostStandaloneViewProps {
  post: PostDetailResDto;
  comments?: PostCommentResDto[];
  authorPosts?: PostSummaryResDto[];
  discoverPosts?: PostSummaryResDto[];
}

export function PostStandaloneView({
  post,
  comments = [],
  authorPosts = [],
  discoverPosts = [],
}: PostStandaloneViewProps) {
  const router = useRouter();
  const t = useTranslations("Feed");
  const tNav = useTranslations("Navigation");

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/explore");
    }
  };

  const photos =
    post.media && post.media.length > 0
      ? post.media.map((m) => m.mediaUrl)
      : post.coverImageUrl
        ? [post.coverImageUrl]
        : [];

  const authorHandle = post.author.handle.replace("@", "") || post.author.id;
  const visibleAuthorPosts = authorPosts.slice(0, 4);
  const visibleDiscoverPosts = discoverPosts.slice(0, 4);

  return (
    <div className="mx-auto max-w-[1440px] space-y-8 p-3.5 sm:p-6 lg:p-8">
      {/* 1. Top Navigation & Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            onClick={handleBack}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer gap-1.5 rounded-xl font-medium"
          >
            <ArrowLeft className="size-4" />
            <span>{t("back")}</span>
          </Button>

          <nav
            aria-label="Breadcrumb"
            className="text-muted-foreground hidden items-center gap-1.5 text-xs sm:flex"
          >
            <Link
              href="/explore"
              className="hover:text-foreground transition-colors"
            >
              {tNav("explore")}
            </Link>
            <ChevronRight className="size-3.5 shrink-0 opacity-60" />
            <Link
              href={`/cosplayer/${authorHandle}`}
              className="hover:text-foreground max-w-[160px] truncate transition-colors"
            >
              {post.author.displayName}
            </Link>
            <ChevronRight className="size-3.5 shrink-0 opacity-60" />
            <span className="text-foreground max-w-[240px] truncate font-medium">
              {post.title}
            </span>
          </nav>
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-border/70 bg-card/60 hover:bg-muted/80 shrink-0 rounded-xl text-xs font-medium"
        >
          <Link href={`/cosplayer/${authorHandle}`}>
            <User className="mr-1.5 size-3.5" />
            <span>{t("viewProfile")}</span>
          </Link>
        </Button>
      </div>

      {/* 2. Primary Edge-to-Edge Theater Showcase Card */}
      <div className="border-border/70 bg-card/70 grid grid-cols-1 overflow-hidden rounded-2xl border shadow-2xl sm:rounded-3xl md:h-[720px] md:grid-cols-12 lg:h-[780px]">
        {/* Left Column: Edge-to-Edge Photo Carousel */}
        <div className="border-border/50 relative h-[380px] overflow-hidden border-b bg-zinc-950 p-0 sm:h-[480px] md:col-span-7 md:h-full md:border-r md:border-b-0 lg:col-span-8">
          <PostCarousel photos={photos} title={post.title} />
        </div>

        {/* Right Column: Post Info & Comments */}
        <div className="bg-card/50 flex min-h-[420px] flex-col overflow-hidden p-0 md:col-span-5 md:h-full md:min-h-0 lg:col-span-4">
          <PostInfo post={post} comments={comments} />
        </div>
      </div>

      {/* 3. More Works from Same Author */}
      {visibleAuthorPosts.length > 0 && (
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="bg-primary/15 text-primary flex size-8 items-center justify-center rounded-xl">
                <Sparkles className="size-4" />
              </div>
              <h2 className="text-foreground text-base font-bold sm:text-lg">
                {t("moreFromAuthor", { name: post.author.displayName })}
              </h2>
            </div>

            <Link
              href={`/cosplayer/${authorHandle}`}
              className="text-primary text-xs font-semibold hover:underline sm:text-sm"
            >
              {t("viewAll")}
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {visibleAuthorPosts.map((item) => (
              <ExploreCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* 4. Discover More Community Works */}
      {visibleDiscoverPosts.length > 0 && (
        <section className="border-border/50 space-y-4 border-t pt-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="bg-muted text-foreground flex size-8 items-center justify-center rounded-xl">
                <Compass className="size-4" />
              </div>
              <h2 className="text-foreground text-base font-bold sm:text-lg">
                {t("discoverMoreWorks")}
              </h2>
            </div>

            <Link
              href="/explore"
              className="text-primary text-xs font-semibold hover:underline sm:text-sm"
            >
              {t("viewAll")}
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {visibleDiscoverPosts.map((item) => (
              <ExploreCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
