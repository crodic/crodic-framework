"use client";

import React, { useState } from "react";
import {
  ArrowUpRight,
  BookOpenText,
  Check,
  Copy,
  GitBranch,
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useTagTooltip } from "@/services/tags";
import { TagChip, type TagChipProps } from "./tag-chip";
import { getTagCategoryI18nKey, getTagCategoryToken } from "./tag-tokens";

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
  const [isCopied, setIsCopied] = useState(false);

  const { data: tooltip, isLoading } = useTagTooltip(
    chipProps.slug,
    locale,
    hasOpened
  );

  const categoryToken = getTagCategoryToken(
    tooltip?.category ?? chipProps.category
  );
  const previewImageUrl = tooltip?.featuredImageUrl || featuredImageUrl;
  const primaryName =
    tooltip?.translatedName || chipProps.translatedName || chipProps.name;

  const copyTag = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`#${primaryName}`);
      setIsCopied(true);
      toast.success(t("copied") || `Copied #${primaryName}`);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

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
      <HoverCardContent
        align="start"
        className="border-border/80 bg-popover/95 w-80 space-y-3 rounded-2xl p-4 shadow-xl backdrop-blur-md"
      >
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
                href={`/explore?q=${encodeURIComponent(chipProps.slug)}`}
                className="bg-muted/20 border-border/60 relative block overflow-hidden rounded-xl border transition-transform duration-200 hover:scale-[1.01]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewImageUrl}
                  alt={primaryName}
                  className="aspect-[16/9] max-h-32 w-full object-cover"
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
                  {t(
                    getTagCategoryI18nKey(
                      tooltip?.category ?? chipProps.category
                    )
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-mono text-[11px] tabular-nums">
                    {t("worksCount", {
                      count: (
                        tooltip?.usageCount ??
                        chipProps.usageCount ??
                        0
                      ).toLocaleString(),
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={copyTag}
                    title="Copy tag"
                    aria-label={`Copy #${primaryName}`}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer rounded-md p-1 transition-colors"
                  >
                    {isCopied ? (
                      <Check className="size-3 text-emerald-500" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </button>
                </div>
              </div>

              <p className="text-foreground text-sm leading-snug font-bold tracking-tight">
                #{primaryName}
              </p>
              {(tooltip?.translatedName || chipProps.translatedName) &&
                (tooltip?.name || chipProps.name) !==
                  (tooltip?.translatedName || chipProps.translatedName) && (
                  <p className="text-muted-foreground font-mono text-xs">
                    {t("canonicalPrefix")} #{tooltip?.name ?? chipProps.name}
                  </p>
                )}
            </div>

            {tooltip?.parentTag && (
              <div className="bg-muted/40 border-border/60 flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs">
                <GitBranch
                  className="text-muted-foreground size-3.5 shrink-0"
                  aria-hidden="true"
                />
                <span className="text-muted-foreground text-[11px]">
                  {t("parentLabel")}
                </span>
                <Link
                  href={`/explore?q=${encodeURIComponent(tooltip.parentTag.slug)}`}
                  className="text-foreground truncate font-semibold hover:underline"
                >
                  #{tooltip.parentTag.translatedName || tooltip.parentTag.name}
                </Link>
              </div>
            )}

            <p className="text-muted-foreground line-clamp-3 text-xs leading-relaxed text-pretty">
              {tooltip?.summary || t("hoverCardDefaultSummary")}
            </p>

            <div className="border-border/60 flex items-center justify-between gap-2 border-t pt-2.5 text-xs font-medium">
              <Link
                href={`/explore?q=${encodeURIComponent(chipProps.slug)}`}
                className="text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors"
              >
                <BookOpenText className="size-3.5" aria-hidden="true" />
                <span>Khám phá thêm</span>
              </Link>
              <Link
                href={`/explore?q=${encodeURIComponent(chipProps.slug)}`}
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
              >
                <span>Xem tác phẩm</span>
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
