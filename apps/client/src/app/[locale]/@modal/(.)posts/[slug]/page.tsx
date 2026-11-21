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
    const [rawPost, rawComments] = await Promise.all([
      serverFetch<PostDetailResDto>(`/api/v1/public/posts/${cleanSlug}`).catch(
        () => null
      ),
      serverFetch<PostCommentResDto[]>(
        `/api/v1/public/posts/${cleanSlug}/comments`
      ).catch(() => []),
    ]);

    if (!rawPost) {
      return null;
    }

    const commentsData = Array.isArray(rawComments)
      ? rawComments
      : (rawComments as any)?.data || [];

    return <PostDetailModal post={rawPost} comments={commentsData} />;
  } catch {
    return null;
  }
}
