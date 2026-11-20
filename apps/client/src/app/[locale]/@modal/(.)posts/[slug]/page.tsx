import { notFound } from "next/navigation";
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
    const [rawPost, rawComments] = await Promise.all([
      serverFetch<PostDetailResDto>(`/api/v1/public/posts/${slug}`).catch(
        () => null
      ),
      serverFetch<PostCommentResDto[]>(
        `/api/v1/public/posts/${slug}/comments`
      ).catch(() => []),
    ]);

    if (!rawPost) {
      notFound();
    }

    const commentsData = Array.isArray(rawComments)
      ? rawComments
      : (rawComments as any)?.data || [];

    return <PostDetailModal post={rawPost} comments={commentsData} />;
  } catch {
    notFound();
  }
}
