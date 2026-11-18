import { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { fetchActiveClientWhiteLabel } from "@/lib/white-label";
import Layout from "@/components/layouts/layout";
import { CosplayerProfileView } from "@/components/cosplayer-profile/cosplayer-profile-view";
import { getCosplayerBySlug } from "@/services/cosplayer";
import type { WithContext, ProfilePage, Person } from "schema-dts";

interface CosplayerPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: CosplayerPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const whiteLabel = await fetchActiveClientWhiteLabel();
  const siteName = whiteLabel?.brandName || "Kosume";

  try {
    const profile = await getCosplayerBySlug(slug);
    const title = `${profile.displayName} (${profile.handle}) - Hồ sơ Cosplayer chuyên nghiệp | ${siteName}`;
    const description = `${profile.bio || profile.displayName}. Khám phá hồ sơ cosplay ${profile.displayName} trên ${siteName}.`;

    const canonicalUrl = `${baseUrl}/${locale}/cosplayer/${slug}`;
    const languages = Object.fromEntries(
      routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/cosplayer/${slug}`])
    );

    const coverUrl = profile.coverUrl || "/landing/hero-banner.png";
    const avatarUrl = profile.avatarUrl || coverUrl;

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
            url: coverUrl,
            width: 1200,
            height: 630,
            alt: `${profile.displayName} Cosplayer Banner`,
          },
          {
            url: avatarUrl,
            width: 400,
            height: 400,
            alt: `${profile.displayName} Avatar`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [coverUrl],
      },
    };
  } catch {
    return {
      title: `Hồ sơ Cosplayer | ${siteName}`,
    };
  }
}

export default async function CosplayerPage({ params }: CosplayerPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const profile = await getCosplayerBySlug(slug);

    // Rich SEO Schema (ProfilePage & Person)
    const jsonLd: WithContext<ProfilePage> = {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      name: `${profile.displayName} - Cosplayer Profile`,
      url: `${baseUrl}/${locale}/cosplayer/${slug}`,
      description: profile.bio || profile.displayName,
      mainEntity: {
        "@type": "Person",
        name: profile.displayName,
        alternateName: profile.handle,
        description: profile.bio || profile.displayName,
        image: profile.avatarUrl?.startsWith("http")
          ? profile.avatarUrl
          : `${baseUrl}${profile.avatarUrl || ""}`,
        jobTitle: profile.roleBadge || "Cosplayer",
        address: {
          "@type": "PostalAddress",
          addressLocality: profile.locationLabel || "Việt Nam",
        },
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
            initialAlbums={[]}
            initialCharacters={profile.characters || []}
          />
        </div>
      </Layout>
    );
  } catch {
    notFound();
  }
}
