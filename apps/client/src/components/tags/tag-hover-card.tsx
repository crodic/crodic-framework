"use client";

import React, { useState } from "react";
import { ArrowUpRight, BookOpenText, GitBranch } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useTagTooltip } from "@/services/tags";
import { TagChip, type TagChipProps } from "./tag-chip";
import { getTagCategoryToken } from "./tag-tokens";

export interface TagHoverCardProps extends TagChipProps {
  locale?: string;
  featuredImageUrl?: string | null;
}

export function TagHoverCard({
  locale = "en",
  featuredImageUrl,
  ...chipProps
}: TagHoverCardProps) {
  const t = useTranslations("Tags");
  const [hasOpened, setHasOpened] = useState(false);

  const { data: tooltip, isLoading } = useTagTooltip(
    chipProps.slug,
    locale,
    hasOpened
  );

  const categoryToken = getTagCategoryToken(
    tooltip?.category ?? chipProps.category
  );
  const previewImageUrl = tooltip?.featuredImageUrl || featuredImageUrl;

  return (
    <HoverCard
      openDelay={220}
      closeDelay={120}
      onOpenChange={(open) => {
        if (open) setHasOpened(true);
      }}
    >
      <HoverCardTrigger asChild>
        <TagChip {...chipProps} />
      </HoverCardTrigger>
      <HoverCardContent align="start" className="w-80 space-y-3 p-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        ) : (
          <>
            {previewImageUrl && (
              <Link
                href={`/dic/${chipProps.slug}`}
                className="bg-muted/20 block overflow-hidden rounded-lg border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewImageUrl}
                  alt={
                    tooltip?.translatedName ||
                    chipProps.translatedName ||
                    chipProps.name
                  }
                  className="aspect-[16/9] max-h-28 w-full object-cover"
                />
              </Link>
            )}

            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wider uppercase">
                  <span
                    className={`size-2 rounded-full ${categoryToken.dot}`}
                    aria-hidden="true"
                  />
                  {categoryToken.label}
                </span>
                <span className="text-muted-foreground font-mono text-[11px] tabular-nums">
                  {(
                    tooltip?.usageCount ??
                    chipProps.usageCount ??
                    0
                  ).toLocaleString()}{" "}
                  tagged
                </span>
              </div>

              <p className="text-sm leading-snug font-semibold">
                #
                {tooltip?.translatedName ||
                  chipProps.translatedName ||
                  chipProps.name}
              </p>
              {(tooltip?.translatedName || chipProps.translatedName) &&
                (tooltip?.name || chipProps.name) !==
                  (tooltip?.translatedName || chipProps.translatedName) && (
                  <p className="text-muted-foreground font-mono text-xs">
                    Canonical: #{tooltip?.name ?? chipProps.name}
                  </p>
                )}
            </div>

            {tooltip?.parentTag && (
              <div className="bg-muted/40 flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs">
                <GitBranch
                  className="text-muted-foreground size-3.5 shrink-0"
                  aria-hidden="true"
                />
                <span className="text-muted-foreground">
                  {t("parentLabel")}
                </span>
                <Link
                  href={`/tags/${tooltip.parentTag.slug}`}
                  className="truncate font-medium hover:underline"
                >
                  #{tooltip.parentTag.translatedName || tooltip.parentTag.name}
                </Link>
              </div>
            )}

            <p className="text-muted-foreground line-clamp-3 text-xs leading-relaxed text-pretty">
              {tooltip?.summary || t("hoverCardDefaultSummary")}
            </p>

            <div className="flex items-center justify-between gap-2 border-t pt-2.5 text-xs font-medium">
              <Link
                href={`/dic/${chipProps.slug}`}
                className="text-primary inline-flex items-center gap-1 hover:underline"
              >
                <BookOpenText className="size-3.5" aria-hidden="true" />
                {t("readEncyclopedia")}
              </Link>
              <Link
                href={`/tags/${chipProps.slug}`}
                className="text-foreground/80 hover:text-foreground inline-flex items-center gap-1 hover:underline"
              >
                {t("viewTaggedWorks")}
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
