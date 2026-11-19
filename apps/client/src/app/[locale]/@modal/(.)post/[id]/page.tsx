import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/server-fetch";
import { PostDetailModal } from "@/components/post-detail/post-detail-modal";
import type { PostDetailResDto, PostCommentResDto } from "@/services/posts";

interface InterceptedPostPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function InterceptedPostPage({
  params,
}: InterceptedPostPageProps) {
  const { id } = await params;

  try {
    const [rawPost, rawComments] = await Promise.all([
      serverFetch<PostDetailResDto>(`/api/v1/public/posts/${id}`).catch(
        () => null
      ),
      serverFetch<PostCommentResDto[]>(
        `/api/v1/public/posts/${id}/comments`
      ).catch(() => []),
    ]);

    if (!rawPost) {
      notFound();
    }

    return <PostDetailModal post={rawPost} comments={rawComments} />;
  } catch {
    notFound();
  }
}
