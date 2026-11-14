import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { fetchActiveClientWhiteLabel } from "@/lib/white-label";
import Layout from "@/components/layouts/layout";
import { SpotlightBanner } from "@/components/home/spotlight-banner";
import { FeaturedWorks } from "@/components/home/featured-works";
import { BookingWidget } from "@/components/home/booking-widget";
import { RecruitmentWidget } from "@/components/home/recruitment-widget";
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

  const title =
    whiteLabel?.metaTitle ||
    whiteLabel?.siteTitle ||
    whiteLabel?.brandName ||
    "CosSpace - Trang chủ Portfolio Hub & Showcase";

  const description =
    whiteLabel?.metaDescription ||
    whiteLabel?.siteTagline ||
    "Tập trung xây dựng thương hiệu cho Cosplayer - Nơi phô diễn tác phẩm và kết nối booking chuyên nghiệp.";

  const canonicalUrl = whiteLabel?.canonicalUrl || `${baseUrl}/${locale}`;
  const siteName = whiteLabel?.brandName || whiteLabel?.siteTitle || "CosSpace";

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

  const siteName = whiteLabel?.brandName || whiteLabel?.siteTitle || "CosSpace";
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

      <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 items-start gap-6 lg:gap-8 xl:grid-cols-12">
          {/* Main Content Column (70-75% on desktop) */}
          <div className="space-y-6 sm:space-y-8 xl:col-span-8 2xl:col-span-9">
            <SpotlightBanner />
            <FeaturedWorks />
          </div>

          {/* Right Widget Column (25-30% on desktop) */}
          <div className="space-y-5 xl:col-span-4 2xl:col-span-3">
            <BookingWidget />
            <RecruitmentWidget />
          </div>
        </div>
      </div>
    </Layout>
  );
}
