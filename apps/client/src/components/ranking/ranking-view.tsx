"use client";

import React, { useState } from "react";
import { RankingTimeFilter } from "./ranking-types";
import { MOCK_LEADERBOARD_LIST, MOCK_PODIUM_DATA } from "./ranking-data";
import { RankingFilterBar } from "./ranking-filter-bar";
import { RankingPodium } from "./ranking-podium";
import { RankingTable } from "./ranking-table";

export function RankingView() {
  const [selectedFilter, setSelectedFilter] =
    useState<RankingTimeFilter>("week");

  // Active podium items based on selected tab
  const activePodiumItems =
    MOCK_PODIUM_DATA[selectedFilter] || MOCK_PODIUM_DATA.week;

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      {/* 1. Time / Category Filter Pills */}
      <section aria-label="Bộ lọc thời gian và danh mục bảng xếp hạng">
        <RankingFilterBar
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
        />
      </section>

      {/* 2. Top 3 Podium Cards */}
      <section aria-label="Top 3 Cosplayer nổi bật">
        <RankingPodium podiumItems={activePodiumItems} />
      </section>

      {/* 3. Leaderboard Table (#4 to #10+) */}
      <section aria-label="Danh sách chi tiết bảng xếp hạng">
        <RankingTable items={MOCK_LEADERBOARD_LIST} />
      </section>
    </div>
  );
}
