import React from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/layouts/footer";
import { Header } from "@/components/layouts/header";
import Layout from "@/components/layouts/layout";
import { Link } from "@/i18n/navigation";
import { MutedTagsManager } from "./muted-tags-manager";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Tags" });
  return {
    title: t("mutedSettingsTitle"),
    description: t("mutedSettingsDesc"),
  };
}

export default async function MutedTagsSettingsPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Tags" });

  return (
    <Layout>
      <Header />
      <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10 sm:px-6 md:py-14">
        <div className="flex items-center justify-between">
          <Link
            href="/explore"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Quay lại Khám phá
          </Link>
        </div>

        <MutedTagsManager
          locale={locale}
          title={t("mutedSettingsTitle")}
          description={t("mutedSettingsDesc")}
        />
      </main>
      <Footer />
    </Layout>
  );
}
