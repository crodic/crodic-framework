import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { COOKIE_ACCESS_TOKEN } from "@/lib/cookies";
import { PostDetailModal } from "@/components/post-detail/post-detail-modal";
import { getPostBySlug, getPostComments } from "@/services/posts";

interface InterceptedPostPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function InterceptedPostPage({
  params,
}: InterceptedPostPageProps) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;

  try {
    const [rawPost, rawComments] = await Promise.all([
      getPostBySlug(id, { token }).catch(() => null),
      getPostComments(id, { token }).catch(() => []),
    ]);

    if (!rawPost) {
      notFound();
    }

    return <PostDetailModal post={rawPost} comments={rawComments} />;
  } catch {
    notFound();
  }
}
