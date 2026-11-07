"use client";

import React from "react";
import { BadgeCheck, BookOpenText, Lock } from "lucide-react";
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
          "inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs whitespace-nowrap transition-colors",
          token.ring,
          className
        )}
      >
        <Link
          href={`/tags/${slug}`}
          className="inline-flex min-w-0 items-center gap-1.5 focus-visible:underline focus-visible:outline-none"
        >
          <span
            className={cn("size-1.5 shrink-0 rounded-full", token.dot)}
            aria-hidden="true"
          />
          {isAuthorTag && (
            <span className="text-primary font-bold" aria-label="Creator tag">
              *
            </span>
          )}
          <span className="text-foreground max-w-44 truncate font-medium">
            #{primaryLabel}
          </span>
          {hasSecondary && (
            <span className="text-muted-foreground max-w-32 truncate text-[11px]">
              {name}
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
            className="text-muted-foreground hover:text-primary border-border/70 ml-0.5 border-l pl-1.5 transition-colors"
          >
            <BookOpenText className="size-3.5" aria-hidden="true" />
          </Link>
        )}

        {trailingSlot}
      </div>
    );
  }
);
