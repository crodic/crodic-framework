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
import { FounderMission } from "@/components/landing/founder-mission";
import { CommunityTestimonials } from "@/components/landing/community-testimonials";
import { FaqSection } from "@/components/landing/faq-section";
import { CtaBanner } from "@/components/landing/cta-banner";
import { LandingFooter } from "@/components/landing/landing-footer";
import type { WithContext, WebSite, Organization, FAQPage } from "schema-dts";
import { getAppExternalUrl, getRootExternalUrl } from "@/lib/subdomain";

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
  const rootBaseUrl = getRootExternalUrl().replace(/\/+$/, "");
  const whiteLabel = await fetchActiveClientWhiteLabel();
  const t = await getTranslations({ locale, namespace: "Landing" });

  const siteName = whiteLabel?.brandName || whiteLabel?.siteTitle || "Kosume";

  const title =
    whiteLabel?.metaTitle || whiteLabel?.siteTitle || t("metaTitle");

  const description =
    whiteLabel?.metaDescription ||
    whiteLabel?.siteTagline ||
    t("metaDescription");

  const canonicalPath = locale === routing.defaultLocale ? "" : `/${locale}`;
  const canonicalUrl = `${rootBaseUrl}${canonicalPath || "/"}`;

  const languages = Object.fromEntries(
    routing.locales.map((loc) => [
      loc,
      `${rootBaseUrl}${loc === routing.defaultLocale ? "" : `/${loc}` || "/"}`,
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

  const rootBaseUrl = getRootExternalUrl().replace(/\/+$/, "");
  const appBaseUrl = getAppExternalUrl().replace(/\/+$/, "");
  const canonicalPath = locale === routing.defaultLocale ? "" : `/${locale}`;
  const canonicalUrl = `${rootBaseUrl}${canonicalPath || "/"}`;

  const [whiteLabel, cmsPages, albums, cosplayers] = await Promise.all([
    fetchActiveClientWhiteLabel(),
    fetchPublishedCmsPages(),
    fetchLandingPosts(4),
    fetchLandingCosplayers(4),
  ]);
  const t = (await getTranslations({ locale, namespace: "Landing" })) as any;

  const siteName = whiteLabel?.brandName || whiteLabel?.siteTitle || "Kosume";
  const description =
    whiteLabel?.metaDescription ||
    whiteLabel?.siteTagline ||
    t("metaDescription");

  const websiteSchema: WithContext<WebSite> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: canonicalUrl,
    inLanguage: routing.locales,
    description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${appBaseUrl}/${locale}/tags?q={search_term_string}`,
      query: "required name=search_term_string",
    },
  };

  const organizationSchema: WithContext<Organization> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: rootBaseUrl,
    logo: whiteLabel?.siteLogo || `${rootBaseUrl}/favicon.ico`,
    description,
    email: "alice01422@gmail.com",
    sameAs: [
      "https://www.facebook.com/share/1FyiNu3VMJ/",
      "https://x.com/alice01422",
    ],
    founder: {
      "@type": "Person",
      name: "Crodic",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      email: "alice01422@gmail.com",
    },
  };

  const faqSchema: WithContext<FAQPage> = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: t("faq.q1.question"),
        acceptedAnswer: {
          "@type": "Answer",
          text: t("faq.q1.answer"),
        },
      },
      {
        "@type": "Question",
        name: t("faq.q2.question"),
        acceptedAnswer: {
          "@type": "Answer",
          text: t("faq.q2.answer"),
        },
      },
      {
        "@type": "Question",
        name: t("faq.q3.question"),
        acceptedAnswer: {
          "@type": "Answer",
          text: t("faq.q3.answer"),
        },
      },
      {
        "@type": "Question",
        name: t("faq.q4.question"),
        acceptedAnswer: {
          "@type": "Answer",
          text: t("faq.q4.answer"),
        },
      },
      {
        "@type": "Question",
        name: t("faq.q5.question"),
        acceptedAnswer: {
          "@type": "Answer",
          text: t("faq.q5.answer"),
        },
      },
      {
        "@type": "Question",
        name: t("faq.q6.question"),
        acceptedAnswer: {
          "@type": "Answer",
          text: t("faq.q6.answer"),
        },
      },
    ],
  };

  return (
    <div className="bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground flex min-h-dvh flex-col">
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c"),
        }}
      />

      <LandingNavbar />
      <main className="flex-1">
        <HeroBanner />
        <FeaturesHighlight />
        <FounderMission />
        <CosplayerShowcase initialCosplayers={cosplayers} />
        <AlbumShowcase initialAlbums={albums} />
        <CommunityTestimonials />
        <FaqSection />
        <CtaBanner />
      </main>
      <LandingFooter initialCmsPages={cmsPages} />
    </div>
  );
}
