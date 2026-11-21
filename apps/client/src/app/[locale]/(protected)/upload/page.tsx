import React from "react";
import Layout from "@/components/layouts/layout";
import { StudioUploadView } from "@/components/studio/studio-upload-view";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

interface UploadPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: UploadPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Studio" });
  return {
    title: `${t("createAlbumTitle")} | Kosume Studio`,
    description: t("createAlbumDesc"),
  };
}

export default async function StudioUploadPage({ params }: UploadPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Studio" });

  return (
    <Layout showRightRail={false}>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            {t("createAlbumTitle")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("createAlbumDesc")}
          </p>
        </div>

        <StudioUploadView />
      </div>
    </Layout>
  );
}
