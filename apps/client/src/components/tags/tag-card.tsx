"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { BadgeCheck, Flame, Image as ImageIcon, BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import type { TagSummaryResDto } from "@/services/tags";
import { TagCategoryBadge } from "./tag-category-badge";
import { TagSafetyBadge } from "./tag-safety-badge";
import { Card, CardContent } from "@/components/ui/card";

interface TagCardProps {
  tag: TagSummaryResDto;
}

export function TagCard({ tag }: TagCardProps) {
  const t = useTranslations("Tags");
  const targetSlug = tag.slug || encodeURIComponent(tag.name);

  return (
    <Link href={`/tags/${targetSlug}`} className="group block h-full">
      <Card className="border-border/70 bg-card hover:border-primary/40 hover:shadow-primary/5 flex h-full flex-col overflow-hidden shadow-xs transition-all duration-300 hover:shadow-md">
        {/* Cover / Avatar Thumbnail Banner */}
        <div className="bg-muted/50 border-border/50 relative aspect-[16/9] w-full overflow-hidden border-b">
          {tag.featuredImageUrl ? (
            <Image
              src={tag.featuredImageUrl}
              alt={tag.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="bg-muted/40 flex h-full w-full items-center justify-center">
              <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-2xl">
                <span className="font-mono text-2xl font-bold">#</span>
              </div>
            </div>
          )}

          {/* Top-Right Badges Overlay */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
            {tag.isOfficial && (
              <span className="flex items-center gap-1 rounded-full border border-sky-500/20 bg-sky-500/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow-xs backdrop-blur-md">
                <BadgeCheck className="size-3" />
                <span>{t("hoverTooltip.official")}</span>
              </span>
            )}
            {tag.trendingScore > 0 && (
              <span className="flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow-xs backdrop-blur-md">
                <Flame className="size-3 fill-white" />
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <CardContent className="flex flex-1 flex-col justify-between p-4 sm:p-5">
          <div className="space-y-2">
            {/* Header: Canonical Name & Translated Name */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-foreground group-hover:text-primary truncate text-base font-bold transition-colors">
                  #{tag.name}
                </h3>
              </div>

              {tag.translatedName && tag.translatedName !== tag.name && (
                <p className="text-muted-foreground truncate text-xs font-medium">
                  {tag.translatedName}
                </p>
              )}
            </div>

            {/* Category & Safety Badges */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <TagCategoryBadge category={tag.category} />
              {tag.safetyRating && tag.safetyRating !== "safe" && (
                <TagSafetyBadge safetyRating={tag.safetyRating} />
              )}
            </div>

            {/* Summary Excerpt */}
            {tag.shortSummary && (
              <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                {tag.shortSummary}
              </p>
            )}
          </div>

          {/* Bottom Stats Footer */}
          <div className="border-border/50 text-muted-foreground mt-4 flex items-center justify-between border-t pt-3 text-xs">
            <div className="flex items-center gap-1.5">
              <ImageIcon className="text-primary/70 size-3.5" />
              <span className="text-foreground font-semibold tabular-nums">
                {tag.usageCount.toLocaleString()}
              </span>
              <span className="text-[11px]">
                {t("postsCount", { count: "" }).trim()}
              </span>
            </div>

            <div className="text-primary group-hover:text-primary/80 flex items-center gap-1 text-[11px] font-semibold">
              <BookOpen className="size-3" />
              <span>{t("tabWiki")}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
