import React from "react";
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
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
  const whiteLabel = await fetchActiveClientWhiteLabel();
  const siteName = whiteLabel?.brandName || "Kosume";

  return {
    title: `Thông báo | ${siteName}`,
    description:
      "Quản lý và cập nhật những thông báo và tương tác mới nhất trên Kosume.",
  };
}

export default async function NotificationsPage({
  params,
}: NotificationsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Layout>
      <NotificationsView />
    </Layout>
  );
}
