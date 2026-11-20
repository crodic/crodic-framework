"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Compass,
  Film,
  Images,
  Maximize2,
  Rows3,
  Sparkles,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ExploreCard } from "@/components/explore/explore-card";
import { PhotoLightbox } from "@/components/feed/photo-lightbox";
import { cn } from "@/lib/utils";
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
  const tPost = useTranslations("PostDetail");

  const [viewMode, setViewMode] = useState<"scroll" | "carousel">("scroll");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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
    <div className="mx-auto max-w-[1480px] space-y-8 p-3.5 sm:p-6 lg:p-8">
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
            aria-label={tPost("breadcrumb")}
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
            <span className="text-foreground max-w-[260px] truncate font-medium">
              {post.title}
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher for multi-photo sets */}
          {photos.length > 1 && (
            <div className="border-border/60 bg-card/70 flex items-center gap-1 rounded-2xl border p-1 shadow-xs backdrop-blur-md">
              <button
                type="button"
                onClick={() => setViewMode("scroll")}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all sm:px-3 sm:py-1.5",
                  viewMode === "scroll"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title={t("scrollGallery")}
              >
                <Rows3 className="size-3.5" />
                <span className="hidden sm:inline">{t("scrollGallery")}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("carousel")}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all sm:px-3 sm:py-1.5",
                  viewMode === "carousel"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title={t("slideView")}
              >
                <Film className="size-3.5" />
                <span className="hidden sm:inline">{t("slideView")}</span>
              </button>
            </div>
          )}

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
      </div>

      {/* 2. Editorial Artwork Showcase: Multi-photo Gallery on Left, Sticky Sidebar on Right */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
        {/* Left Column: Artwork Showcase Stage */}
        <div className="min-w-0 lg:col-span-7 xl:col-span-8">
          {viewMode === "scroll" ? (
            /* Vertical Scroll Gallery Mode (ArtStation / Behance Style) */
            <div className="space-y-4 sm:space-y-6">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  onClick={() => setLightboxIndex(index)}
                  className="group border-border/50 bg-card/60 hover:border-primary/40 relative cursor-pointer overflow-hidden rounded-2xl border shadow-xl transition-all hover:shadow-2xl sm:rounded-3xl"
                >
                  {/* Photo Container */}
                  <div className="relative flex w-full items-center justify-center bg-zinc-950 p-2 sm:p-4">
                    <img
                      src={photo}
                      alt={`${post.title} - ${index + 1}`}
                      className="max-h-[88vh] w-full rounded-xl object-contain transition-transform duration-300 select-none group-hover:scale-[1.008] sm:rounded-2xl"
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                  </div>

                  {/* Hover Overlay with counter & zoom trigger */}
                  <div className="pointer-events-none absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/75 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:p-5">
                    <span className="rounded-full border border-white/15 bg-black/60 px-3 py-1 text-xs font-semibold text-white/90 tabular-nums shadow-sm backdrop-blur-md">
                      {index + 1} / {photos.length}
                    </span>
                    <span className="bg-primary text-primary-foreground inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold shadow-md">
                      <Maximize2 className="size-3.5" />
                      <span>{t("fullscreen")}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Cinema Carousel Slide Mode */
            <div className="border-border/60 relative h-[480px] overflow-hidden rounded-2xl border bg-zinc-950 shadow-2xl sm:h-[620px] sm:rounded-3xl lg:h-[780px]">
              <PostCarousel photos={photos} title={post.title} />
            </div>
          )}
        </div>

        {/* Right Column: Sticky Post Details, Author Card & Threaded Comments */}
        <div className="lg:sticky lg:top-20 lg:col-span-5 lg:max-h-[calc(100vh-6rem)] xl:col-span-4">
          <div className="border-border/70 bg-card/85 flex max-h-[720px] flex-col overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl sm:rounded-3xl lg:max-h-[calc(100vh-6rem)]">
            <PostInfo post={post} comments={comments} />
          </div>
        </div>
      </div>

      {/* 3. More Works from Same Author */}
      {visibleAuthorPosts.length > 0 && (
        <section className="space-y-4 pt-4 sm:pt-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="bg-primary/15 text-primary flex size-8 items-center justify-center rounded-xl">
                <Sparkles className="size-4" />
              </div>
              <div>
                <h2 className="text-foreground text-base font-bold sm:text-lg">
                  {t("moreFromAuthor", { name: post.author.displayName })}
                </h2>
                <p className="text-muted-foreground text-xs">
                  {t("moreFromAuthorSubtitle", {
                    name: post.author.displayName,
                  })}
                </p>
              </div>
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
        <section className="border-border/50 space-y-4 border-t pt-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="bg-muted text-foreground flex size-8 items-center justify-center rounded-xl">
                <Compass className="size-4" />
              </div>
              <div>
                <h2 className="text-foreground text-base font-bold sm:text-lg">
                  {t("discoverMoreWorks")}
                </h2>
                <p className="text-muted-foreground text-xs">
                  {t("discoverMoreSubtitle")}
                </p>
              </div>
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

      {/* Fullscreen Photo Lightbox Modal for Scroll Gallery */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          images={photos}
          currentIndex={lightboxIndex}
          isOpen={lightboxIndex !== null}
          onClose={() => setLightboxIndex(null)}
          onChangeIndex={(idx) => setLightboxIndex(idx)}
          author={{
            name: post.author.displayName,
            handle: post.author.handle,
            avatarUrl: post.author.avatarUrl,
          }}
          caption={post.title}
        />
      )}
    </div>
  );
}
