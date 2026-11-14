import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { fetchActiveClientWhiteLabel } from "@/lib/white-label";
import Layout from "@/components/layouts/layout";
import { PostStandaloneView } from "@/components/post-detail/post-standalone-view";
import { getPostById } from "@/components/post-detail/post-data";

interface PostPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const whiteLabel = await fetchActiveClientWhiteLabel();
  const siteName = whiteLabel?.brandName || "Kosume";

  const post = getPostById(id);
  const title = `${post.title} - ${post.author.name} | ${siteName}`;
  const description = `${post.caption} Xem bộ ảnh cosplay ${post.title} của ${post.author.name} trên ${siteName}.`;

  const canonicalUrl = `${baseUrl}/${locale}/post/${id}`;
  const languages = Object.fromEntries(
    routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/post/${id}`])
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
          url: post.photos[0] || "/landing/hero-banner.png",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [post.photos[0] || "/landing/hero-banner.png"],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const post = getPostById(id);

  return (
    <Layout>
      <PostStandaloneView post={post} />
    </Layout>
  );
}
