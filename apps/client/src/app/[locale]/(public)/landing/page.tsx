import React from "react";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { fetchActiveClientWhiteLabel } from "@/lib/white-label";
import { fetchPublishedCmsPages } from "@/services/cms-pages";
import {
  fetchLandingPosts,
  fetchLandingCosplayers,
} from "@/services/landing-server";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroBanner } from "@/components/landing/hero-banner";
import { FeaturesHighlight } from "@/components/landing/features-highlight";
import { CosplayerShowcase } from "@/components/landing/cosplayer-showcase";
import { AlbumShowcase } from "@/components/landing/album-showcase";
import { CtaBanner } from "@/components/landing/cta-banner";
import { LandingFooter } from "@/components/landing/landing-footer";
import type { WithContext, WebSite, Organization } from "schema-dts";

// Incremental Static Regeneration (ISR): revalidate page every 5 minutes
export const revalidate = 300;

// Pre-render static paths for all configured locales at build time (SSG)
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LandingPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: LandingPageProps): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const whiteLabel = await fetchActiveClientWhiteLabel();
  const t = await getTranslations({ locale, namespace: "Landing" });

  const siteName = whiteLabel?.brandName || whiteLabel?.siteTitle || "Kosume";

  const title =
    whiteLabel?.metaTitle || whiteLabel?.siteTitle || t("metaTitle");

  const description =
    whiteLabel?.metaDescription ||
    whiteLabel?.siteTagline ||
    t("metaDescription");

  const canonicalUrl = `${baseUrl}/${locale}/landing`;

  const languages = Object.fromEntries(
    routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/landing`])
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
      type: "website",
      locale,
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
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function LandingPage({ params }: LandingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const [whiteLabel, cmsPages, albums, cosplayers] = await Promise.all([
    fetchActiveClientWhiteLabel(),
    fetchPublishedCmsPages(),
    fetchLandingPosts(4),
    fetchLandingCosplayers(4),
  ]);
  const t = await getTranslations({ locale, namespace: "Landing" });

  const siteName = whiteLabel?.brandName || whiteLabel?.siteTitle || "Kosume";
  const description =
    whiteLabel?.metaDescription ||
    whiteLabel?.siteTagline ||
    t("metaDescription");

  const websiteSchema: WithContext<WebSite> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: `${baseUrl}/${locale}/landing`,
    inLanguage: routing.locales,
    description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/${locale}/tags?q={search_term_string}`,
      query: "required name=search_term_string",
    },
  };

  const organizationSchema: WithContext<Organization> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: baseUrl,
    logo: whiteLabel?.siteLogo || `${baseUrl}/favicon.ico`,
    description,
  };

  return (
    <div className="bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c"),
        }}
      />

      <LandingNavbar />
      <main className="flex-1">
        <HeroBanner />
        <FeaturesHighlight />
        <CosplayerShowcase initialCosplayers={cosplayers} />
        <AlbumShowcase initialAlbums={albums} />
        <CtaBanner />
      </main>
      <LandingFooter initialCmsPages={cmsPages} />
    </div>
  );
}
