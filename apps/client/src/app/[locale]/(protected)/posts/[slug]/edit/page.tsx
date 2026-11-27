import React from "react";
import Layout from "@/components/layouts/layout";
import { StudioEditView } from "@/components/studio/studio-edit-view";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

interface EditPostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: EditPostPageProps): Promise<Metadata> {
  const { locale } = await params;
  const tFeed = await getTranslations({ locale, namespace: "Feed" });
  return {
    title: `${tFeed("editPost")} | Kosume Studio`,
    description: tFeed("editPostDesc"),
  };
}

export default async function StudioEditPostPage({
  params,
}: EditPostPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const tFeed = await getTranslations({ locale, namespace: "Feed" });

  return (
    <Layout showRightRail={false}>
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
            {tFeed("editPost")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {tFeed("editPostDesc")}
          </p>
        </header>

        <StudioEditView postSlug={decodeURIComponent(slug)} />
      </div>
    </Layout>
  );
}
