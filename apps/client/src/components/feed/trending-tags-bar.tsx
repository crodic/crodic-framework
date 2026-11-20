"use client";

import React from "react";
import { Flame } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { getTrendingTags, type TagSummaryResDto } from "@/services/tags";
import { useRouter } from "@/i18n/navigation";

export function TrendingTagsBar() {
  const t = useTranslations("Feed");
  const locale = useLocale();
  const router = useRouter();

  const { data: tags = [] } = useQuery<TagSummaryResDto[]>({
    queryKey: ["feed-trending-tags", locale],
    queryFn: async () => {
      const fandoms = await getTrendingTags(10, locale, "copyright");
      if (fandoms && fandoms.length >= 4) return fandoms;
      return getTrendingTags(10, locale);
    },
    staleTime: 60 * 1000,
  });

  if (!tags || tags.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="text-foreground flex items-center gap-1.5 text-xs font-bold">
        <span>{t("trendingTags")}</span>
        <Flame className="size-3.5 fill-amber-500 text-amber-500" />
      </div>

      <div className="flex scrollbar-none items-center gap-2 overflow-x-auto pb-1">
        {tags.map((tag: TagSummaryResDto) => (
          <button
            key={tag.id}
            type="button"
            onClick={() =>
              router.push(`/explore?q=${encodeURIComponent(tag.name)}`)
            }
            className="border-border/70 bg-card/60 hover:bg-primary/15 hover:border-primary/40 hover:text-primary text-muted-foreground inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors select-none"
          >
            <span>#{tag.name}</span>
            {tag.usageCount > 0 && (
              <span className="text-muted-foreground/80 text-[10px]">
                {tag.usageCount.toLocaleString()}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
