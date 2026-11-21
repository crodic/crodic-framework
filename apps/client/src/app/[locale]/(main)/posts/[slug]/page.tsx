import { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { PaginatedResponse } from "@repo/query-builder";
import { routing } from "@/i18n/routing";
import { fetchActiveClientWhiteLabel } from "@/lib/white-label";
import { serverFetch } from "@/lib/server-fetch";
import Layout from "@/components/layouts/layout";
import { PostStandaloneView } from "@/components/post-detail/post-standalone-view";
import type {
  PostDetailResDto,
  PostCommentResDto,
  PostSummaryResDto,
} from "@/services/posts";

interface PostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const whiteLabel = await fetchActiveClientWhiteLabel();
  const siteName = whiteLabel?.brandName || "Kosume";

  try {
    const cleanSlug = encodeURIComponent(decodeURIComponent(slug));
    const post = await serverFetch<PostDetailResDto>(
      `/api/v1/public/posts/${cleanSlug}`
    );
    const isVi = locale === "vi";
    const authorName = post.author?.displayName || "Cosplayer";
    const canonicalSlug = post.slug || slug;
    const title = `${post.title} - ${authorName} | ${siteName}`;
    const description = isVi
      ? `${post.caption ? `${post.caption}. ` : ""}Xem bộ ảnh cosplay ${post.title} của ${authorName} trên ${siteName}.`
      : `${post.caption ? `${post.caption}. ` : ""}View cosplay album ${post.title} by ${authorName} on ${siteName}.`;

    const canonicalUrl = `${baseUrl}/${locale}/posts/${canonicalSlug}`;
    const languages = Object.fromEntries(
      routing.locales.map((loc) => [
        loc,
        `${baseUrl}/${loc}/posts/${canonicalSlug}`,
      ])
    );

    const rawImageUrl =
      post.coverImageUrl || (post.media && post.media[0]?.mediaUrl);

    const absoluteImageUrl = rawImageUrl
      ? rawImageUrl.startsWith("http://") || rawImageUrl.startsWith("https://")
        ? rawImageUrl
        : `${baseUrl}${rawImageUrl.startsWith("/") ? "" : "/"}${rawImageUrl}`
      : `${baseUrl}/landing/hero-banner.png`;

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
            url: absoluteImageUrl,
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
        images: [absoluteImageUrl],
      },
    };
  } catch {
    const isVi = locale === "vi";
    return {
      title: isVi
        ? `Tác phẩm Cosplay | ${siteName}`
        : `Cosplay Album | ${siteName}`,
    };
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  try {
    const cleanSlug = encodeURIComponent(decodeURIComponent(slug));
    const [rawPost, rawComments] = await Promise.all([
      serverFetch<PostDetailResDto>(`/api/v1/public/posts/${cleanSlug}`).catch(
        () => null
      ),
      serverFetch<PostCommentResDto[]>(
        `/api/v1/public/posts/${cleanSlug}/comments`
      ).catch(() => []),
    ]);

    if (!rawPost) {
      notFound();
    }

    const [authorPostsRes, morePostsRes] = await Promise.all([
      serverFetch<PaginatedResponse<PostSummaryResDto>>(
        `/api/v1/public/posts?filter[authorId]=${rawPost.author.id}&limit=8`
      ).catch(() => null),
      serverFetch<PaginatedResponse<PostSummaryResDto>>(
        `/api/v1/public/posts?limit=8`
      ).catch(() => null),
    ]);

    const commentsData = Array.isArray(rawComments)
      ? rawComments
      : (rawComments as any)?.data || [];

    const authorPosts = (authorPostsRes?.data || []).filter(
      (item) => String(item.id) !== String(rawPost.id)
    );

    const authorPostIds = new Set(authorPosts.map((p) => String(p.id)));
    const discoverPosts = (morePostsRes?.data || []).filter(
      (item) =>
        String(item.id) !== String(rawPost.id) &&
        !authorPostIds.has(String(item.id))
    );

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const canonicalSlug = rawPost.slug || slug;
    const authorHandle =
      rawPost.author?.handle?.replace("@", "") || rawPost.author?.id;
    const rawImageUrl =
      rawPost.coverImageUrl || (rawPost.media && rawPost.media[0]?.mediaUrl);
    const absoluteImageUrl = rawImageUrl
      ? rawImageUrl.startsWith("http://") || rawImageUrl.startsWith("https://")
        ? rawImageUrl
        : `${baseUrl}${rawImageUrl.startsWith("/") ? "" : "/"}${rawImageUrl}`
      : `${baseUrl}/landing/hero-banner.png`;

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SocialMediaPosting",
      headline: rawPost.title,
      articleBody: rawPost.caption || rawPost.title,
      datePublished: rawPost.publishedAt,
      url: `${baseUrl}/${locale}/posts/${canonicalSlug}`,
      image: [absoluteImageUrl],
      author: {
        "@type": "Person",
        name: rawPost.author?.displayName || "Cosplayer",
        url: `${baseUrl}/${locale}/cosplayer/${authorHandle}`,
      },
      interactionStatistic: [
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/LikeAction",
          userInteractionCount: rawPost.likesCount || 0,
        },
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/CommentAction",
          userInteractionCount: rawPost.commentsCount || commentsData.length,
        },
      ],
    };

    return (
      <Layout showRightRail={false}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <PostStandaloneView
          post={rawPost}
          comments={commentsData}
          authorPosts={authorPosts}
          discoverPosts={discoverPosts}
        />
      </Layout>
    );
  } catch {
    notFound();
  }
}
