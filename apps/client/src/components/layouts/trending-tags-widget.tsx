"use client";

import React from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { ArrowRight, Flame } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { getTrendingTags, type TagSummaryResDto } from "@/services/tags";

export function TrendingTagsWidget() {
  const t = useTranslations("Feed");
  const locale = useLocale();
  const router = useRouter();

  const { data: tags = [], isLoading } = useQuery<TagSummaryResDto[]>({
    queryKey: ["right-rail-trending-tags", locale],
    queryFn: async () => {
      const trending = await getTrendingTags(8, locale);
      return trending.filter((tag) => tag.usageCount > 0);
    },
    staleTime: 60 * 1000,
  });

  if (!isLoading && (!tags || tags.length === 0)) return null;

  return (
    <div className="border-border/70 bg-card/70 rounded-2xl border p-4 shadow-xs backdrop-blur-xs">
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500">
            <Flame className="size-3.5 fill-amber-500" />
          </div>
          <h3 className="text-foreground text-sm font-bold">
            {t("trendingTags")}
          </h3>
        </div>
        <Link
          href="/tags"
          className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-xs font-semibold transition-colors"
        >
          <span>{t("viewAll")}</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-muted h-7 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {tags.slice(0, 6).map((tag) => {
            const targetSlug = tag.slug || encodeURIComponent(tag.name);
            return (
              <Link
                key={tag.id}
                href={`/tags/${targetSlug}`}
                className="border-border/70 bg-background/60 hover:bg-primary/10 hover:border-primary/40 hover:text-primary text-muted-foreground group inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-medium transition-colors select-none"
              >
                <span className="text-primary/70 group-hover:text-primary font-semibold">
                  #
                </span>
                <span>{tag.name}</span>
                {tag.usageCount > 0 && (
                  <span className="text-muted-foreground/60 text-[10px] tabular-nums">
                    {tag.usageCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
