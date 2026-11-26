import React from "react";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { fetchActiveClientWhiteLabel } from "@/lib/white-label";
import Layout from "@/components/layouts/layout";
import { NotificationsView } from "@/components/notifications/notifications-view";

interface NotificationsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: NotificationsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Notifications" });
  const whiteLabel = await fetchActiveClientWhiteLabel();
  const siteName = whiteLabel?.brandName || "Kosume";

  return {
    title: `${t("title")} | ${siteName}`,
    description: t("desc"),
  };
}

export default async function NotificationsPage({
  params,
}: NotificationsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Layout showRightRail={false}>
      <div className="mx-auto w-full max-w-5xl">
        <NotificationsView />
      </div>
    </Layout>
  );
}
