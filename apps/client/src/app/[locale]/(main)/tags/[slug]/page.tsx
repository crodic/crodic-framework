import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { fetchActiveClientWhiteLabel } from "@/lib/white-label";
import Layout from "@/components/layouts/layout";
import { TagDetailView } from "@/components/tags/tag-detail-view";
import { getTagBySlug, getTagEncyclopedia } from "@/services/tags";
import type { WithContext, DefinedTerm } from "schema-dts";

interface TagDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: TagDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const whiteLabel = await fetchActiveClientWhiteLabel();

  try {
    const tag = await getTagBySlug(slug, locale);
    const wiki = await getTagEncyclopedia(slug, locale, false);

    const titlePrefix =
      tag.translatedName && tag.translatedName !== tag.name
        ? `#${tag.name} (${tag.translatedName})`
        : `#${tag.name}`;

    const title = `${titlePrefix} - Bách khoa toàn thư & Tác phẩm | ${whiteLabel?.brandName || "Kosume"}`;
    const description =
      wiki?.summary ||
      tag.shortSummary ||
      `Khám phá thông tin bách khoa toàn thư, nhân vật và các bộ ảnh cosplay gắn tag #${tag.name} trên Kosume.`;

    const canonicalUrl = `${baseUrl}/${locale}/tags/${encodeURIComponent(slug)}`;
    const siteName = whiteLabel?.brandName || "Kosume";

    const imageUrl =
      wiki?.featuredImageUrl ||
      tag.featuredImageUrl ||
      "/landing/hero-banner.png";

    const languages = Object.fromEntries(
      routing.locales.map((loc) => [
        loc,
        `${baseUrl}/${loc}/tags/${encodeURIComponent(slug)}`,
      ])
    );

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
        type: "article",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: tag.name,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    return {
      title: `Tag | ${whiteLabel?.brandName || "Kosume"}`,
    };
  }
}

export default async function TagDetailPage({ params }: TagDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  let tag = null;
  let wiki = null;

  try {
    [tag, wiki] = await Promise.all([
      getTagBySlug(slug, locale),
      getTagEncyclopedia(slug, locale),
    ]);
  } catch (err: any) {
    if (err?.response?.status === 404) {
      notFound();
    }
  }

  if (!tag) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const whiteLabel = await fetchActiveClientWhiteLabel();

  const jsonLd: WithContext<DefinedTerm> = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: tag.name,
    termCode: tag.slug,
    description:
      wiki?.summary ||
      tag.shortSummary ||
      `Tag bách khoa toàn thư #${tag.name}`,
    inDefinedTermSet: `${baseUrl}/tags`,
    url: `${baseUrl}/tags/${tag.slug}`,
  };

  return (
    <Layout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="bg-muted/40 h-36 w-full animate-pulse rounded-3xl" />
            <div className="bg-muted/30 h-10 w-64 animate-pulse rounded-2xl" />
            <div className="bg-muted/20 h-96 w-full animate-pulse rounded-2xl" />
          </div>
        }
      >
        <TagDetailView tag={tag} wiki={wiki} />
      </Suspense>
    </Layout>
  );
}
