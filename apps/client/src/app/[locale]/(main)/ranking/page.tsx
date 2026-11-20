import React from "react";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { fetchActiveClientWhiteLabel } from "@/lib/white-label";
import Layout from "@/components/layouts/layout";
import { RankingView } from "@/components/ranking/ranking-view";

interface RankingPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: RankingPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Ranking" });
  const whiteLabel = await fetchActiveClientWhiteLabel();
  const siteName = whiteLabel?.brandName || "Kosume";

  return {
    title: `${t("title")} | ${siteName}`,
    description: t("metaDescription"),
  };
}

export default async function RankingPage({ params }: RankingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Layout>
      <RankingView />
    </Layout>
  );
}
