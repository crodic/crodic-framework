import { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { fetchActiveClientWhiteLabel } from "@/lib/white-label";
import Layout from "@/components/layouts/layout";
import { PostStandaloneView } from "@/components/post-detail/post-standalone-view";
import { getPostBySlug, getPostComments } from "@/services/posts";

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

  try {
    const post = await getPostBySlug(id);
    const authorName = post.author?.displayName || "Cosplayer";
    const title = `${post.title} - ${authorName} | ${siteName}`;
    const description = `${post.caption || post.title}. Xem bộ ảnh cosplay ${post.title} của ${authorName} trên ${siteName}.`;

    const canonicalUrl = `${baseUrl}/${locale}/post/${id}`;
    const languages = Object.fromEntries(
      routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/post/${id}`])
    );

    const imageUrl =
      post.coverImageUrl || (post.media && post.media[0]?.mediaUrl);

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
        images: imageUrl
          ? [
              {
                url: imageUrl,
                width: 1200,
                height: 630,
                alt: post.title,
              },
            ]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch {
    return {
      title: `Tác phẩm Cosplay | ${siteName}`,
    };
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  try {
    const [rawPost, rawComments] = await Promise.all([
      getPostBySlug(id).catch(() => null),
      getPostComments(id).catch(() => []),
    ]);

    if (!rawPost) {
      notFound();
    }

    return (
      <Layout>
        <PostStandaloneView post={rawPost} comments={rawComments} />
      </Layout>
    );
  } catch {
    notFound();
  }
}
