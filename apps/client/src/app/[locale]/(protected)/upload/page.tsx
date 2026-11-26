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
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("createAlbumTitle")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("createAlbumDesc")}
          </p>
        </header>

        <StudioUploadView />
      </div>
    </Layout>
  );
}
