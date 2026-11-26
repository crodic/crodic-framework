"use client";

import React, { useMemo, useState } from "react";
import { Compass, Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ListError } from "@/components/common/list-error";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { RankingTimeFilter } from "./ranking-types";
import { RankingFilterBar } from "./ranking-filter-bar";
import { RankingPodium } from "./ranking-podium";
import { RankingTable } from "./ranking-table";
import { getLeaderboard, type LeaderboardItemResDto } from "@/services/ranking";

export function RankingView() {
  const t = useTranslations("Ranking");
  const tCommon = useTranslations("Common");
  const [selectedFilter, setSelectedFilter] =
    useState<RankingTimeFilter>("week");

  const {
    data: rankingResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["public-rankings", selectedFilter],
    queryFn: () => getLeaderboard(selectedFilter),
  });

  const { podiumItems, tableItems } = useMemo(() => {
    const rawItems: LeaderboardItemResDto[] = rankingResponse?.data || [];
    const sorted = [...rawItems]
      .sort((a, b) => a.rank - b.rank || b.score - a.score)
      .map((item, idx) => ({
        ...item,
        rank: idx + 1,
      }));
    const podium = sorted.slice(0, 3);
    const table = sorted.slice(3);

    return { podiumItems: podium, tableItems: table };
  }, [rankingResponse]);

  return (
    <div className="space-y-6">
      <h1 className="page-title">{t("title")}</h1>
      {/* 1. Time / Category Filter Pills */}
      <section aria-label={t("title")}>
        <RankingFilterBar
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
        />
      </section>

      {/* 2. Podium and Leaderboard Content or Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-3 sm:gap-4" role="status">
          <span className="sr-only">{tCommon("loading")}</span>
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-36 rounded-xl motion-reduce:animate-none sm:h-48"
            />
          ))}
        </div>
      ) : isError && !rankingResponse ? (
        <ListError onRetry={() => void refetch()} />
      ) : podiumItems.length === 0 && tableItems.length === 0 ? (
        <Empty className="border-border gap-4 rounded-xl border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Trophy aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>{t("emptyState.title")}</EmptyTitle>
            <EmptyDescription>{t("emptyState.desc")}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/explore">
                <Compass aria-hidden="true" />
                {t("emptyState.cta")}
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
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
