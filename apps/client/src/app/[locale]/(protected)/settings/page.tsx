import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { fetchActiveClientWhiteLabel } from "@/lib/white-label";
import Layout from "@/components/layouts/layout";
import { SettingsView } from "@/components/settings/settings-view";

interface SettingsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: SettingsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const whiteLabel = await fetchActiveClientWhiteLabel();
  const siteName = whiteLabel?.brandName || "Kosume";
  const t = await getTranslations({ locale, namespace: "Settings" });

  const title = t("metaTitle", { siteName });
  const description = t("metaDescription");

  return {
    title: {
      absolute: title,
    },
    description,
  };
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Layout>
      <div className="space-y-6">
        <SettingsView />
      </div>
    </Layout>
  );
}
