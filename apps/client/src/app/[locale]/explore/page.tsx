import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { fetchActiveClientWhiteLabel } from "@/lib/white-label";
import Layout from "@/components/layouts/layout";
import { ExploreFeed } from "@/components/explore/explore-feed";
import type { WithContext, WebSite } from "schema-dts";

interface ExplorePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ExplorePageProps): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const whiteLabel = await fetchActiveClientWhiteLabel();

  const languages = Object.fromEntries(
    routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/explore`])
  );

  const title = "Khám phá tác phẩm Cosplay nổi bật & Xu hướng | CosSpace";
  const description =
    "Khám phá các bộ ảnh cosplay, nhân vật yêu thích từ Genshin Impact, Honkai Star Rail, Fate Series, Frieren và nhiều hơn nữa trên CosSpace.";

  const canonicalUrl = `${baseUrl}/${locale}/explore`;
  const siteName = whiteLabel?.brandName || "CosSpace";

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

export default async function ExplorePage({ params }: ExplorePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const whiteLabel = await fetchActiveClientWhiteLabel();
  const siteName = whiteLabel?.brandName || "CosSpace";

  const jsonLd: WithContext<WebSite> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${siteName} - Khám phá`,
    url: `${baseUrl}/explore`,
    inLanguage: routing.locales,
    description: "Khám phá tác phẩm Cosplay nổi bật & Xu hướng",
  };

  return (
    <Layout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
        <ExploreFeed />
      </div>
    </Layout>
  );
}
