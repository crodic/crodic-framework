import type { PaginatedResponse } from "@repo/query-builder";
import { serverFetch } from "@/lib/server-fetch";
import { PostDetailModal } from "@/components/post-detail/post-detail-modal";
import type { PostDetailResDto, PostCommentResDto } from "@/services/posts";

interface InterceptedPostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function InterceptedPostPage({
  params,
}: InterceptedPostPageProps) {
  const { slug } = await params;

  try {
    const cleanSlug = encodeURIComponent(decodeURIComponent(slug));
    const [rawPost, commentsRes] = await Promise.all([
      serverFetch<PostDetailResDto>(`/api/v1/public/posts/${cleanSlug}`).catch(
        () => null
      ),
      serverFetch<PaginatedResponse<PostCommentResDto>>(
        `/api/v1/public/posts/${cleanSlug}/comments`
      ).catch(() => null),
    ]);

    if (!rawPost) {
      return null;
    }

    return (
      <PostDetailModal post={rawPost} comments={commentsRes?.data ?? []} />
    );
  } catch {
    return null;
  }
}
