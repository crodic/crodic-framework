"use client";

import React, { useMemo, useState } from "react";
import { Compass, Loader2, Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { RankingTimeFilter } from "./ranking-types";
import { RankingFilterBar } from "./ranking-filter-bar";
import { RankingPodium } from "./ranking-podium";
import { RankingTable } from "./ranking-table";
import { getLeaderboard, type LeaderboardItemResDto } from "@/services/ranking";

export function RankingView() {
  const t = useTranslations("Ranking");
  const [selectedFilter, setSelectedFilter] =
    useState<RankingTimeFilter>("week");

  const { data: rankingResponse, isLoading } = useQuery({
    queryKey: ["public-rankings", selectedFilter],
    queryFn: () => getLeaderboard(selectedFilter),
  });

  const { podiumItems, tableItems } = useMemo(() => {
    const rawItems: LeaderboardItemResDto[] = rankingResponse?.data || [];
    const sorted = [...rawItems].sort((a, b) => a.rank - b.rank);
    const podium = sorted.filter((item) => item.rank <= 3);
    const table = sorted.filter((item) => item.rank > 3);

    return { podiumItems: podium, tableItems: table };
  }, [rankingResponse]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      {/* 1. Time / Category Filter Pills */}
      <section aria-label={t("title")}>
        <RankingFilterBar
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
        />
      </section>

      {/* 2. Podium and Leaderboard Content or Empty State */}
      {isLoading ? (
        <div className="flex min-h-[240px] items-center justify-center">
          <Loader2 className="text-primary size-8 animate-spin" />
        </div>
      ) : podiumItems.length === 0 && tableItems.length === 0 ? (
        <div className="border-border/60 bg-card/60 flex min-h-[380px] flex-col items-center justify-center rounded-3xl border p-8 text-center backdrop-blur-sm sm:p-12">
          <div className="border-primary/20 bg-primary/10 text-primary mb-4 flex size-16 items-center justify-center rounded-2xl border shadow-inner">
            <Trophy className="size-8 stroke-[1.75]" />
          </div>
          <h3 className="text-foreground text-lg font-bold sm:text-xl">
            {t("emptyState.title")}
          </h3>
          <p className="text-muted-foreground mt-2 max-w-md text-xs sm:text-sm">
            {t("emptyState.desc")}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="default"
              className="rounded-xl px-5 text-sm font-semibold shadow-sm"
            >
              <Link href="/explore">
                <Compass className="mr-2 size-4" />
                {t("emptyState.cta")}
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          {podiumItems.length > 0 && (
            <section aria-label={t("podiumAria")}>
              <RankingPodium podiumItems={podiumItems} />
            </section>
          )}

          {/* 3. Leaderboard Table (#4+) */}
          {tableItems.length > 0 && (
            <section aria-label={t("rankingTableAria")}>
              <RankingTable items={tableItems} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
