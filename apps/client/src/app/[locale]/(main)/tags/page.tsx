import { Suspense } from "react";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { fetchActiveClientWhiteLabel } from "@/lib/white-label";
import Layout from "@/components/layouts/layout";
import { TagDirectoryView } from "@/components/tags/tag-directory-view";
import type { WithContext, CollectionPage } from "schema-dts";

interface TagsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: TagsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const whiteLabel = await fetchActiveClientWhiteLabel();

  const languages = Object.fromEntries(
    routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/tags`])
  );

  const t = await getTranslations({ locale, namespace: "Tags" });

  const title = `${t("title")} | ${whiteLabel?.brandName || "Kosume"}`;
  const description = t("subtitle");
  const canonicalUrl = `${baseUrl}/${locale}/tags`;
  const siteName = whiteLabel?.brandName || "Kosume";

  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName,
      type: "website",
      images: [
        {
          url: "/landing/hero-banner.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/landing/hero-banner.png"],
    },
  };
}

export default async function TagsPage({ params }: TagsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const whiteLabel = await fetchActiveClientWhiteLabel();
  const siteName = whiteLabel?.brandName || "Kosume";

  const jsonLd: WithContext<CollectionPage> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${siteName} - Từ điển & Tags`,
    url: `${baseUrl}/tags`,
    inLanguage: routing.locales,
    description:
      "Khám phá nhân vật, tác phẩm anime & game, cosplayer và bách khoa toàn thư cộng đồng.",
  };

  return (
    <Layout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="space-y-6">
        <Suspense
          fallback={
            <div className="space-y-6">
              <div className="bg-muted/40 h-44 w-full animate-pulse rounded-3xl" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-muted/30 aspect-[3/4] animate-pulse rounded-2xl"
                  />
                ))}
              </div>
            </div>
          }
        >
          <TagDirectoryView />
        </Suspense>
      </div>
    </Layout>
  );
}
