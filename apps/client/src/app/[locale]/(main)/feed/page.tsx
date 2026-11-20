import React from "react";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { fetchActiveClientWhiteLabel } from "@/lib/white-label";
import Layout from "@/components/layouts/layout";
import { FeedView } from "@/components/feed/feed-view";

interface FeedPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: FeedPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Feed" });
  const whiteLabel = await fetchActiveClientWhiteLabel();
  const siteName = whiteLabel?.brandName || "Kosume";

  return {
    title: `${t("pageTitle")} | ${siteName}`,
    description: t("pageDescription"),
  };
}

export default async function FeedPage({ params }: FeedPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Layout>
      <FeedView />
    </Layout>
  );
}
