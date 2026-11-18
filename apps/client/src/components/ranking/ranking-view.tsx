"use client";

import React, { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
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

      {/* 2. Top 3 Podium Cards */}
      {isLoading ? (
        <div className="flex min-h-[240px] items-center justify-center">
          <Loader2 className="text-primary size-8 animate-spin" />
        </div>
      ) : (
        <>
          {podiumItems.length > 0 && (
            <section aria-label="Top 3 Cosplayer">
              <RankingPodium podiumItems={podiumItems} />
            </section>
          )}

          {/* 3. Leaderboard Table (#4+) */}
          {tableItems.length > 0 && (
            <section aria-label="Bảng xếp hạng">
              <RankingTable items={tableItems} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
