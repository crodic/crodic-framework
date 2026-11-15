import { PostDetailModal } from "@/components/post-detail/post-detail-modal";
import { getPostById } from "@/components/post-detail/post-data";

interface InterceptedPostPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function InterceptedPostPage({
  params,
}: InterceptedPostPageProps) {
  const { id } = await params;
  const post = getPostById(id);

  return <PostDetailModal post={post} />;
}
