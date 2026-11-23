"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import {
  BadgeCheck,
  BookOpen,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getTagTooltip, type TagTooltipResDto } from "@/services/tags";
import { TagCategoryBadge } from "./tag-category-badge";
import { TagSafetyBadge } from "./tag-safety-badge";

interface TagHoverCardProps {
  slugOrName: string;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
}

export function TagHoverCard({
  slugOrName,
  children,
  side = "top",
  align = "center",
}: TagHoverCardProps) {
  const t = useTranslations("Tags");
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  const cleanQuery = slugOrName.replace(/^#+/, "").trim();

  const { data: tooltip, isLoading } = useQuery<TagTooltipResDto | null>({
    queryKey: ["tag-tooltip", cleanQuery, locale],
    queryFn: () => getTagTooltip(cleanQuery, locale),
    enabled: isOpen && cleanQuery.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const targetSlug = tooltip?.slug || cleanQuery;

  return (
    <HoverCard openDelay={250} closeDelay={150} onOpenChange={setIsOpen}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent
        side={side}
        align={align}
        className="border-border/80 bg-popover w-80 overflow-hidden rounded-2xl p-0 shadow-lg"
      >
        {isLoading ? (
          <div className="space-y-3 p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-11 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : tooltip ? (
          <div className="flex flex-col">
            {/* Top Info Banner */}
            <div className="border-border/50 bg-muted/20 flex items-start gap-3 border-b p-4">
              <div className="border-border/70 bg-muted/60 relative size-12 shrink-0 overflow-hidden rounded-xl border">
                {tooltip.featuredImageUrl ? (
                  <Image
                    src={tooltip.featuredImageUrl}
                    alt={tooltip.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <div className="bg-primary/10 text-primary flex h-full w-full items-center justify-center font-mono text-base font-bold">
                    #
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-foreground truncate text-sm font-bold">
                    #{tooltip.name}
                  </h4>
                  {tooltip.isOfficial && (
                    <BadgeCheck className="size-4 shrink-0 text-sky-500" />
                  )}
                </div>

                {tooltip.translatedName &&
                  tooltip.translatedName !== tooltip.name && (
                    <p className="text-muted-foreground truncate text-xs">
                      {tooltip.translatedName}
                    </p>
                  )}

                <div className="flex items-center gap-1.5 pt-0.5">
                  <TagCategoryBadge category={tooltip.category} />
                  {tooltip.safetyRating && tooltip.safetyRating !== "safe" && (
                    <TagSafetyBadge safetyRating={tooltip.safetyRating} />
                  )}
                </div>
              </div>
            </div>

            {/* Middle Lore Summary */}
            <div className="space-y-3 p-4">
              {tooltip.summary ? (
                <p className="text-muted-foreground line-clamp-3 text-xs leading-relaxed">
                  {tooltip.summary}
                </p>
              ) : (
                <p className="text-muted-foreground/80 text-xs italic">
                  {t("noWikiDesc")}
                </p>
              )}

              {/* Stats Row */}
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <ImageIcon className="text-primary size-3.5" />
                <span className="text-foreground font-semibold tabular-nums">
                  {tooltip.usageCount.toLocaleString()}
                </span>
                <span>{t("postsCount", { count: "" }).trim()}</span>
              </div>
            </div>

            {/* Bottom Actions Cluster */}
            <div className="grid grid-cols-2 gap-2 p-3 pt-0">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 rounded-xl text-xs font-semibold shadow-2xs"
              >
                <Link href={`/tags/${targetSlug}`}>
                  <BookOpen className="text-primary size-3.5" />
                  <span>{t("tabWiki")}</span>
                </Link>
              </Button>

              <Button
                asChild
                size="sm"
                className="h-8 gap-1.5 rounded-xl text-xs font-semibold shadow-xs"
              >
                <Link href={`/tags/${targetSlug}?tab=artworks`}>
                  <ImageIcon className="size-3.5" />
                  <span>{t("tabArtworks")}</span>
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 p-4 text-center">
            <h4 className="text-foreground text-sm font-bold">#{cleanQuery}</h4>
            <p className="text-muted-foreground text-xs">{t("noWikiDesc")}</p>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="mt-2 h-8 w-full text-xs"
            >
              <Link href={`/tags/${encodeURIComponent(cleanQuery)}`}>
                <span>{t("tabWiki")}</span>
              </Link>
            </Button>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
