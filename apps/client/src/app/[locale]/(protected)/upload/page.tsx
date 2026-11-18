import React from "react";
import Layout from "@/components/layouts/layout";
import { SortableImageUpload } from "@/components/form/sortable-image-upload";
import { CreateAlbumForm } from "@/components/studio/create-album-form";
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
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            {t("createAlbumTitle")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("createAlbumDesc")}
          </p>
        </div>

        {/* Studio Upload Frame */}
        <div className="bg-card border-border/80 flex flex-col overflow-hidden rounded-2xl border shadow-xl md:flex-row">
          {/* Left Column: Sortable Image Grid */}
          <div className="border-border/60 flex flex-1 flex-col border-r p-6 md:w-[58%]">
            <SortableImageUpload
              variant="studio"
              showInlineAddSlot={true}
              existingImages={[]}
              maxFiles={20}
              gridClassName="grid-cols-2 sm:grid-cols-3 gap-3"
            />
          </div>

          {/* Right Column: Studio Form */}
          <div className="bg-card/60 p-6 md:w-[42%]">
            <div className="border-border/60 mb-5 border-b pb-3">
              <h2 className="text-foreground text-base font-bold">
                {t("titleLabel")}
              </h2>
              <p className="text-muted-foreground text-xs">
                {t("descPlaceholder")}
              </p>
            </div>

            <CreateAlbumForm />
          </div>
        </div>
      </div>
    </Layout>
  );
}
