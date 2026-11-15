import React from "react";
import { Metadata } from "next";
import Layout from "@/components/layouts/layout";
import { RankingView } from "@/components/ranking/ranking-view";

export const metadata: Metadata = {
  title: "Bảng Xếp Hạng Cosplayer | Kosume",
  description:
    "Bảng xếp hạng Cosplayer và Leaderboard dự án cosplay xuất sắc nhất theo tuần, tháng và toàn thời gian.",
};

export default function RankingPage() {
  return (
    <Layout>
      <RankingView />
    </Layout>
  );
}
