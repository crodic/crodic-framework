import { notFound } from "next/navigation";
import { PostDetailModal } from "@/components/post-detail/post-detail-modal";
import { getPostBySlug, getPostComments } from "@/services/posts";

interface InterceptedPostPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function InterceptedPostPage({
  params,
}: InterceptedPostPageProps) {
  const { id } = await params;

  try {
    const [rawPost, rawComments] = await Promise.all([
      getPostBySlug(id).catch(() => null),
      getPostComments(id).catch(() => []),
    ]);

    if (!rawPost) {
      notFound();
    }

    return <PostDetailModal post={rawPost} comments={rawComments} />;
  } catch {
    notFound();
  }
}
