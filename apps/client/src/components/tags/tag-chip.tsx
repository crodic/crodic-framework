"use client";

import React from "react";
import { BadgeCheck, BookOpenText, Lock, Star } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { TagCategory } from "@/services/tags";
import { getTagCategoryToken } from "./tag-tokens";

export interface TagChipProps extends React.HTMLAttributes<HTMLDivElement> {
  slug: string;
  name: string;
  translatedName?: string | null;
  category?: TagCategory;
  isOfficial?: boolean;
  isAuthorTag?: boolean;
  locked?: boolean;
  usageCount?: number;
  showWikiLink?: boolean;
  trailingSlot?: React.ReactNode;
}

export const TagChip = React.forwardRef<HTMLDivElement, TagChipProps>(
  function TagChip(
    {
      slug,
      name,
      translatedName,
      category = "general",
      isOfficial = false,
      isAuthorTag = false,
      locked = false,
      usageCount,
      showWikiLink = false,
      trailingSlot,
      className,
      ...divProps
    },
    ref
  ) {
    const token = getTagCategoryToken(category);
    const primaryLabel = translatedName?.trim() || name;
    const hasSecondary =
      Boolean(translatedName?.trim()) && translatedName?.trim() !== name.trim();

    return (
      <div
        ref={ref}
        {...divProps}
        className={cn(
          "group/chip inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs whitespace-nowrap shadow-2xs transition-all duration-150 hover:scale-[1.02] hover:shadow-xs active:scale-[0.98]",
          token.ring,
          className
        )}
      >
        <Link
          href={`/tags/${slug}`}
          className="focus-visible:ring-primary inline-flex min-w-0 items-center gap-1.5 rounded-full focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none"
        >
          <span
            className={cn(
              "size-2 shrink-0 rounded-full transition-transform duration-150 group-hover/chip:scale-125",
              token.dot
            )}
            aria-hidden="true"
          />
          {isAuthorTag && (
            <span
              className="bg-primary/10 py-0.2 text-primary inline-flex items-center gap-0.5 rounded-full px-1 text-[10px] font-bold"
              title="Creator Tag"
              aria-label="Creator tag"
            >
              <Star
                className="size-2.5 fill-amber-400 text-amber-400"
                aria-hidden="true"
              />
            </span>
          )}
          <span className="text-foreground group-hover/chip:text-primary max-w-48 truncate font-medium transition-colors">
            #{primaryLabel}
          </span>
          {hasSecondary && (
            <span className="text-muted-foreground max-w-32 truncate font-mono text-[11px]">
              ({name})
            </span>
          )}
          {isOfficial && (
            <BadgeCheck
              className="text-primary size-3.5 shrink-0"
              aria-hidden="true"
            />
          )}
          {locked && (
            <Lock
              className="text-muted-foreground size-3 shrink-0"
              aria-hidden="true"
            />
          )}
          {typeof usageCount === "number" && (
            <span className="text-muted-foreground font-mono text-[11px] tabular-nums">
              {usageCount.toLocaleString()}
            </span>
          )}
        </Link>

        {showWikiLink && (
          <Link
            href={`/dic/${slug}`}
            aria-label={`Open encyclopedia entry for ${primaryLabel}`}
            className="text-muted-foreground hover:text-primary border-border/70 focus-visible:ring-primary ml-0.5 rounded-sm border-l pl-1.5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <BookOpenText className="size-3.5" aria-hidden="true" />
          </Link>
        )}

        {trailingSlot}
      </div>
    );
  }
);
