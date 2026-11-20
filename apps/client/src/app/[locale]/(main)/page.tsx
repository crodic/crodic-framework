import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { fetchActiveClientWhiteLabel } from "@/lib/white-label";
import Layout from "@/components/layouts/layout";
import { SpotlightBanner } from "@/components/home/spotlight-banner";
import { FeaturedWorks } from "@/components/home/featured-works";
import type { WithContext, WebSite } from "schema-dts";

interface RootPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: RootPageProps): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const whiteLabel = await fetchActiveClientWhiteLabel();

  const languages = Object.fromEntries(
    routing.locales.map((loc) => [loc, `${baseUrl}/${loc}`])
  );

  const t = await getTranslations({ locale, namespace: "Home" });

  const title =
    whiteLabel?.metaTitle || whiteLabel?.siteTitle || t("metaTitle");

  const description =
    whiteLabel?.metaDescription ||
    whiteLabel?.siteTagline ||
    t("metaDescription");

  const canonicalUrl = whiteLabel?.canonicalUrl || `${baseUrl}/${locale}`;
  const siteName = whiteLabel?.brandName || whiteLabel?.siteTitle || "Kosume";

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

export default async function RootPage({ params }: RootPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Landing" });
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const whiteLabel = await fetchActiveClientWhiteLabel();

  const siteName = whiteLabel?.brandName || whiteLabel?.siteTitle || "Kosume";
  const description = whiteLabel?.metaDescription || t("metaDescription");

  const jsonLd: WithContext<WebSite> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: baseUrl,
    inLanguage: routing.locales,
    description,
  };

  return (
    <Layout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="space-y-6 sm:space-y-8">
        <SpotlightBanner />
        <FeaturedWorks />
      </div>
    </Layout>
  );
}
