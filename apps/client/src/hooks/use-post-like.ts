"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { toggleLikePost, type ToggleLikeResDto } from "@/services/posts";
import { useAuthStore } from "@/store/use-auth-store";

export interface UsePostLikeOptions {
  postId: string;
  initialLiked?: boolean;
  initialLikesCount?: number;
  postSlugOrId?: string;
  onSuccess?: (res: ToggleLikeResDto) => void;
}

export function usePostLike({
  postId,
  initialLiked = false,
  initialLikesCount = 0,
  postSlugOrId,
  onSuccess,
}: UsePostLikeOptions) {
  const t = useTranslations("Feed");
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [isLiked, setIsLiked] = useState(Boolean(initialLiked));
  const [likesCount, setLikesCount] = useState(
    Math.max(0, Number(initialLikesCount || 0))
  );

  const likeMutation = useMutation({
    mutationFn: () => toggleLikePost(postId),
    onMutate: () => {
      const currentLiked = isLiked;
      const currentCount = likesCount;
      const nextLiked = !currentLiked;
      const nextCount = nextLiked
        ? currentCount + 1
        : Math.max(0, currentCount - 1);

      setIsLiked(nextLiked);
      setLikesCount(nextCount);

      return { prevLiked: currentLiked, prevCount: currentCount };
    },
    onSuccess: (res: ToggleLikeResDto) => {
      setIsLiked(res.liked);
      setLikesCount(res.likesCount);

      const updateDetailCache = (old: unknown) =>
        old
          ? {
              ...(old as Record<string, unknown>),
              isLikedByCurrentUser: res.liked,
              likesCount: res.likesCount,
            }
          : old;

      if (postSlugOrId) {
        queryClient.setQueryData(
          ["post-detail", postSlugOrId],
          updateDetailCache
        );
        queryClient.invalidateQueries({
          queryKey: ["post-detail", postSlugOrId],
        });
      }
      if (postId) {
        queryClient.setQueryData(["post-detail", postId], updateDetailCache);
      }
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["public-posts"] });
      queryClient.invalidateQueries({ queryKey: ["public-feed-posts"] });
      queryClient.invalidateQueries({ queryKey: ["explore-posts"] });
      queryClient.invalidateQueries({ queryKey: ["my-liked-posts"] });

      onSuccess?.(res);
    },
    onError: (_err, _vars, context) => {
      if (context) {
        setIsLiked(context.prevLiked);
        setLikesCount(context.prevCount);
      }
      toast.error(t("likeError"));
    },
  });

  useEffect(() => {
    if (!likeMutation.isPending) {
      setIsLiked(Boolean(initialLiked));
      setLikesCount(Math.max(0, Number(initialLikesCount || 0)));
    }
  }, [initialLiked, initialLikesCount, likeMutation.isPending]);

  const toggleLike = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!isAuthenticated) {
      toast.info(t("loginToLike"));
      return;
    }

    likeMutation.mutate();
  };

  return {
    isLiked,
    likesCount,
    toggleLike,
    isPending: likeMutation.isPending,
  };
}
