import { Footer } from "@/components/layouts/footer";
import { Header } from "@/components/layouts/header";
import Layout from "@/components/layouts/layout";
import { CtaSection } from "@/components/landing/cta-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HeroSection } from "@/components/landing/hero-section";
import { PortalSection } from "@/components/landing/portal-section";
import { TechStackSection } from "@/components/landing/tech-stack-section";
import { routing } from "@/i18n/routing";
import { fetchActiveClientWhiteLabel } from "@/lib/white-label";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { WithContext, WebSite } from "schema-dts";

interface RootPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: RootPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Landing" });
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const whiteLabel = await fetchActiveClientWhiteLabel();

  const languages = Object.fromEntries(
    routing.locales.map((loc) => [loc, `${baseUrl}/${loc}`])
  );

  const title =
    whiteLabel?.metaTitle ||
    whiteLabel?.siteTitle ||
    whiteLabel?.brandName ||
    t("metaTitle");

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
      ...(whiteLabel?.ogImage
        ? {
            images: [
              {
                url: whiteLabel.ogImage,
                width: 1200,
                height: 630,
                alt: title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(whiteLabel?.twitterImage || whiteLabel?.ogImage
        ? { images: [whiteLabel.twitterImage || whiteLabel.ogImage!] }
        : {}),
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
      {/* nosemgrep: typescript.react.security.audit.react-dangerouslysetinnerhtml */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Header />
      <main className="flex-1">
        <HeroSection />
        <TechStackSection />
        <FeaturesSection />
        <PortalSection />
        <CtaSection />
      </main>
      <Footer />
    </Layout>
  );
}
