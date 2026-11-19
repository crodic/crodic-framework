import { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { fetchActiveClientWhiteLabel } from "@/lib/white-label";
import Layout from "@/components/layouts/layout";
import { CosplayerProfileView } from "@/components/cosplayer-profile/cosplayer-profile-view";
import { getCosplayerBySlug } from "@/services/cosplayer";
import { getPosts } from "@/services/posts";
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
    const isVi = locale === "vi";
    const handleSuffix = profile.handle ? ` (${profile.handle})` : "";
    const title = isVi
      ? `${profile.displayName}${handleSuffix} - Hồ sơ Cosplayer | ${siteName}`
      : `${profile.displayName}${handleSuffix} - Cosplayer Profile | ${siteName}`;

    const description = isVi
      ? `${profile.bio ? `${profile.bio}. ` : ""}Khám phá các bộ ảnh và tác phẩm cosplay của ${profile.displayName} trên ${siteName}.`
      : `${profile.bio ? `${profile.bio}. ` : ""}Explore cosplay photosets, characters, and albums by ${profile.displayName} on ${siteName}.`;

    const canonicalUrl = `${baseUrl}/${locale}/cosplayer/${slug}`;
    const languages = Object.fromEntries(
      routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/cosplayer/${slug}`])
    );

    const toAbsoluteUrl = (
      url: string | null | undefined,
      fallback: string
    ) => {
      const target = url || fallback;
      if (target.startsWith("http://") || target.startsWith("https://")) {
        return target;
      }
      return `${baseUrl}${target.startsWith("/") ? "" : "/"}${target}`;
    };

    const absoluteCoverUrl = toAbsoluteUrl(
      profile.coverUrl,
      "/landing/hero-banner.png"
    );
    const absoluteAvatarUrl = toAbsoluteUrl(
      profile.avatarUrl,
      profile.coverUrl || "/landing/hero-banner.png"
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
        firstName: profile.displayName,
        username: profile.handle?.replace(/^@/, ""),
        images: [
          {
            url: absoluteCoverUrl,
            width: 1200,
            height: 630,
            alt: `${profile.displayName} Cosplayer Banner`,
          },
          {
            url: absoluteAvatarUrl,
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
        images: [absoluteCoverUrl],
        creator: profile.twitterUrl
          ? `@${profile.twitterUrl.replace(/.*(?:twitter\.com|x\.com)\/?@?/, "")}`
          : undefined,
      },
    };
  } catch {
    const isVi = locale === "vi";
    return {
      title: isVi
        ? `Hồ sơ Cosplayer | ${siteName}`
        : `Cosplayer Profile | ${siteName}`,
    };
  }
}

export default async function CosplayerPage({ params }: CosplayerPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const profile = await getCosplayerBySlug(slug);
    const albumsRes = await getPosts({
      authorId: profile.userId,
      limit: 50,
    }).catch(() => ({ data: [] }));

    // Rich SEO Schema (ProfilePage & Person)
    const isVi = locale === "vi";
    const avatarUrl = profile.avatarUrl?.startsWith("http")
      ? profile.avatarUrl
      : profile.avatarUrl
        ? `${baseUrl}${profile.avatarUrl.startsWith("/") ? "" : "/"}${profile.avatarUrl}`
        : `${baseUrl}/landing/hero-banner.png`;

    const sameAs = [
      profile.facebookUrl,
      profile.instagramUrl,
      profile.tiktokUrl,
      profile.twitterUrl,
    ].filter((url): url is string => Boolean(url && url.startsWith("http")));

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
        image: avatarUrl,
        jobTitle: profile.roleBadge || "Cosplayer",
        address: {
          "@type": "PostalAddress",
          addressLocality:
            profile.locationLabel || (isVi ? "Việt Nam" : "Vietnam"),
        },
        sameAs: sameAs.length > 0 ? sameAs : undefined,
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
            initialAlbums={albumsRes.data || []}
            initialCharacters={profile.characters || []}
          />
        </div>
      </Layout>
    );
  } catch {
    notFound();
  }
}
