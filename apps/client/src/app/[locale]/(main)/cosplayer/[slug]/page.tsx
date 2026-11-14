import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { fetchActiveClientWhiteLabel } from "@/lib/white-label";
import Layout from "@/components/layouts/layout";
import { CosplayerProfileView } from "@/components/cosplayer-profile/cosplayer-profile-view";
import {
  KIRIKO_PROFILE,
  KIRIKO_ALBUMS,
  KIRIKO_CHARACTERS,
} from "@/components/cosplayer-profile/profile-data";
import type { WithContext, ProfilePage, Person } from "schema-dts";

interface CosplayerPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  return routing.locales.flatMap((locale) => [{ locale, slug: "kiriko" }]);
}

export async function generateMetadata({
  params,
}: CosplayerPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const whiteLabel = await fetchActiveClientWhiteLabel();
  const siteName = whiteLabel?.brandName || "Kosume";

  // For now using KIRIKO_PROFILE as primary showcase; slug can be dynamic
  const profile = KIRIKO_PROFILE;
  const title = `${profile.name} (${profile.handle}) - Hồ sơ Cosplayer chuyên nghiệp | ${siteName}`;
  const description = `${profile.bio} Khám phá ${profile.stats.albumsCount} album và ${profile.stats.charactersCount} nhân vật cosplay Genshin Impact, Honkai Star Rail của ${profile.name} trên ${siteName}.`;

  const canonicalUrl = `${baseUrl}/${locale}/cosplayer/${slug}`;
  const languages = Object.fromEntries(
    routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/cosplayer/${slug}`])
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
      type: "profile",
      images: [
        {
          url: profile.coverUrl,
          width: 1200,
          height: 630,
          alt: `${profile.name} Cosplayer Banner`,
        },
        {
          url: profile.avatarUrl,
          width: 400,
          height: 400,
          alt: `${profile.name} Avatar`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [profile.coverUrl],
    },
  };
}

export default async function CosplayerPage({ params }: CosplayerPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const whiteLabel = await fetchActiveClientWhiteLabel();
  const siteName = whiteLabel?.brandName || "Kosume";

  const profile = KIRIKO_PROFILE;

  // Rich SEO Schema (ProfilePage & Person)
  const jsonLd: WithContext<ProfilePage> = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${profile.name} - Cosplayer Profile`,
    url: `${baseUrl}/${locale}/cosplayer/${slug}`,
    description: profile.bio,
    mainEntity: {
      "@type": "Person",
      name: profile.name,
      alternateName: profile.handle,
      description: profile.bio,
      image: `${baseUrl}${profile.avatarUrl}`,
      jobTitle: "Cosplayer & Crafting Artist",
      address: {
        "@type": "PostalAddress",
        addressLocality: profile.location,
      },
      sameAs: [
        profile.contact.facebook || "",
        profile.contact.instagram || "",
        profile.contact.tiktok || "",
      ].filter(Boolean),
    } as Person,
  };

  return (
    <Layout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mx-auto max-w-[1440px] p-3.5 sm:p-6 lg:p-8">
        <CosplayerProfileView
          initialProfile={profile}
          initialAlbums={KIRIKO_ALBUMS}
          initialCharacters={KIRIKO_CHARACTERS}
        />
      </div>
    </Layout>
  );
}
