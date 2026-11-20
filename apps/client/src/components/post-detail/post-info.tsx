"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link, getPathname } from "@/i18n/navigation";
import {
  BadgeCheck,
  Bookmark,
  Check,
  ExternalLink,
  Eye,
  Heart,
  Plus,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import type { PostDetailResDto, PostCommentResDto } from "@/services/posts";
import { cn } from "@/lib/utils";
import { getPostBySlug } from "@/services/posts";
import { checkIsFollowing, toggleFollow } from "@/services/social";
import {
  getMyCollections,
  createCollection,
  addCollectionItem,
} from "@/services/collections";
import { useAuthStore } from "@/store/use-auth-store";
import { useProfile } from "@/hooks/use-profile";
import { usePostLike } from "@/hooks/use-post-like";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PostCommentsThread } from "./post-comments-thread";

interface PostInfoProps {
  post: PostDetailResDto;
  comments?: PostCommentResDto[];
  onClose?: () => void;
  isModal?: boolean;
}

export function PostInfo({
  post: initialPost,
  comments: initialComments = [],
  onClose,
  isModal = false,
}: PostInfoProps) {
  const t = useTranslations("Feed");
  const tPost = useTranslations("PostDetail");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const { data: profile, isLoading: isProfileLoading } = useProfile();

  const postSlugOrId = initialPost.slug || initialPost.id;
  const { data: post = initialPost } = useQuery({
    queryKey: ["post-detail", postSlugOrId],
    queryFn: () => getPostBySlug(postSlugOrId),
    initialData: initialPost,
    staleTime: 60 * 1000,
  });

  const { isLiked, likesCount, toggleLike } = usePostLike({
    postId: post.id,
    initialLiked: post.isLikedByCurrentUser,
    initialLikesCount: post.likesCount,
    postSlugOrId,
  });

  const isOwnPost =
    Boolean(profile?.id) && String(profile?.id) === String(post.author.id);

  const { data: remoteIsFollowing = false } = useQuery({
    queryKey: ["is-following", post.author.id],
    queryFn: () => checkIsFollowing(post.author.id),
    enabled: Boolean(
      !isHydrating &&
      isAuthenticated &&
      !isProfileLoading &&
      !isOwnPost &&
      post.author.id
    ),
    staleTime: 1000 * 60 * 2,
  });

  const [followOverride, setFollowOverride] = useState<boolean | null>(null);
  const isFollowing = followOverride ?? remoteIsFollowing;

  const [isSaved, setIsSaved] = useState(post.isSavedByCurrentUser ?? false);
  const [copiedShare, setCopiedShare] = useState(false);

  React.useEffect(() => {
    if (typeof post.isSavedByCurrentUser === "boolean") {
      setIsSaved(post.isSavedByCurrentUser);
    }
  }, [post.isSavedByCurrentUser]);

  const authorHandle = post.author.handle.replace("@", "") || post.author.id;
  const publishedDateLabel = post.publishedAt
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
        new Date(post.publishedAt)
      )
    : "";

  const followMutation = useMutation({
    mutationFn: () => toggleFollow(post.author.id),
    onSuccess: (res) => {
      setFollowOverride(res.following);
      queryClient.setQueryData(["is-following", post.author.id], res.following);
      queryClient.invalidateQueries({
        queryKey: ["is-following", post.author.id],
      });
      queryClient.invalidateQueries({ queryKey: ["my-following"] });
      queryClient.invalidateQueries({ queryKey: ["following-feed-posts"] });
      queryClient.invalidateQueries({ queryKey: ["suggested-cosplayers"] });
    },
    onError: () => {
      setFollowOverride(null);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (nextState: boolean) => {
      const myCols = await getMyCollections({ limit: 1 });
      let targetColId = myCols?.data?.[0]?.id;
      if (!targetColId) {
        const created = await createCollection({
          title: tPost("defaultCollectionTitle"),
          isPublic: false,
        });
        targetColId = created.id;
      }

      if (nextState) {
        await addCollectionItem(targetColId, { postId: post.id });
      }
      return { nextState };
    },
    onSuccess: ({ nextState }) => {
      queryClient.invalidateQueries({ queryKey: ["my-collections"] });
      if (nextState) {
        toast.success(t("savedToCollection"));
      } else {
        toast.info(t("removedFromSaved"));
      }
    },
    onError: () => {
      setIsSaved((prev) => !prev);
    },
  });

  const handleToggleFollow = () => {
    if (!isAuthenticated) {
      toast.info(t("loginToFollow"));
      return;
    }
    const next = !isFollowing;
    setFollowOverride(next);
    followMutation.mutate();
  };

  const handleToggleSave = () => {
    if (!isAuthenticated) {
      toast.info(t("loginToSave"));
      return;
    }
    const nextState = !isSaved;
    setIsSaved(nextState);
    saveMutation.mutate(nextState);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      const targetPath = getPathname({
        href: `/posts/${postSlugOrId}`,
        locale,
      });
      navigator.clipboard?.writeText(`${window.location.origin}${targetPath}`);
      setCopiedShare(true);
      toast.success(t("copiedShareLink"));
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const handleOpenFullPage = () => {
    if (typeof window !== "undefined") {
      const targetPath = getPathname({
        href: `/posts/${postSlugOrId}`,
        locale,
      });
      window.location.href = targetPath;
    }
  };

  const formattedLikes =
    likesCount >= 1000
      ? `${(likesCount / 1000).toFixed(1)}k`
      : String(likesCount);

  return (
    <div className="flex h-full flex-col justify-between overflow-hidden">
      {/* 1. Sticky Author Header with Integrated Close Button */}
      <div className="border-border/60 bg-card/85 sticky top-0 z-10 flex shrink-0 items-center justify-between gap-2 border-b px-4 py-3.5 backdrop-blur-md sm:px-5">
        <Link
          href={`/cosplayer/${authorHandle}`}
          className="group flex min-w-0 items-center gap-3"
        >
          <div className="border-border/80 ring-primary/15 group-hover:ring-primary/50 relative size-10 shrink-0 overflow-hidden rounded-full border ring-2 transition-all sm:size-11">
            {post.author.avatarUrl ? (
              <Image
                src={post.author.avatarUrl}
                alt={post.author.displayName}
                fill
                sizes="44px"
                className="object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="bg-primary/20 text-primary flex size-full items-center justify-center font-bold">
                {post.author.displayName.slice(0, 1)}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-foreground group-hover:text-primary truncate text-sm font-bold transition-colors">
                {post.author.displayName}
              </span>
              {post.author.isVerified && (
                <BadgeCheck className="size-3.5 shrink-0 fill-sky-400/20 text-sky-400" />
              )}
            </div>
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <span className="truncate">{post.author.handle}</span>
              {publishedDateLabel && (
                <>
                  <span>•</span>
                  <span className="shrink-0">{publishedDateLabel}</span>
                </>
              )}
            </div>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          {!isHydrating &&
            !(isAuthenticated && isProfileLoading) &&
            !isOwnPost && (
              <Button
                type="button"
                size="sm"
                variant={isFollowing ? "outline" : "default"}
                onClick={handleToggleFollow}
                className={cn(
                  "h-8 cursor-pointer rounded-xl px-3 text-xs font-semibold",
                  !isFollowing &&
                    "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {isFollowing ? (
                  <>
                    <Check className="mr-1 size-3" />
                    <span>{t("following")}</span>
                  </>
                ) : (
                  <>
                    <Plus className="mr-1 size-3" />
                    <span>{t("follow")}</span>
                  </>
                )}
              </Button>
            )}

          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground border-border/60 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors"
              aria-label={t("close")}
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Embedded Facebook-style Threaded Comments with Post Header Content */}
      <div className="flex-1 overflow-hidden">
        <PostCommentsThread
          postId={post.id}
          initialComments={initialComments}
          headerContent={
            <div className="space-y-4 pb-4">
              {/* Title, Metadata Badges & Caption */}
              <div className="space-y-3">
                <h1 className="text-foreground text-base leading-snug font-bold tracking-tight sm:text-lg">
                  {post.title}
                </h1>

                {/* Character / Fandom / Views Badges */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {post.characterName && (
                    <span className="bg-primary/10 text-primary border-primary/20 inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-medium">
                      <Sparkles className="size-3" />
                      <span className="text-primary/75">
                        {t("characterLabel")}:
                      </span>
                      <span className="font-semibold">
                        {post.characterName}
                      </span>
                    </span>
                  )}
                  {post.fandomName && (
                    <span className="bg-muted/60 text-foreground/85 border-border/60 inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-medium">
                      {post.fandomName}
                    </span>
                  )}
                  <span className="bg-muted/40 text-muted-foreground border-border/50 inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-medium tabular-nums">
                    <Eye className="size-3" />
                    <span>
                      {t("viewsCount", {
                        count: (post.viewsCount || 0).toLocaleString(locale),
                      })}
                    </span>
                  </span>
                </div>

                {post.caption && (
                  <p className="text-foreground/85 text-xs leading-relaxed whitespace-pre-line sm:text-sm">
                    {post.caption}
                  </p>
                )}

                {/* Clickable Tags */}
                {post.tagNamesCache && post.tagNamesCache.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {post.tagNamesCache.map((tag, idx) => (
                      <Link
                        key={idx}
                        href={`/explore?q=${encodeURIComponent(tag)}`}
                        className="bg-muted/50 hover:bg-primary/15 text-muted-foreground hover:text-primary border-border/50 hover:border-primary/30 inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[11px] font-medium transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Collaborators / Credits */}
                {post.collaborators && post.collaborators.length > 0 && (
                  <div className="border-border/50 bg-muted/20 space-y-2 rounded-xl border p-3">
                    <p className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                      {t("collaboratorsTitle")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {post.collaborators.map((collab, idx) => (
                        <div
                          key={idx}
                          className="bg-background/80 border-border/60 flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs"
                        >
                          <span className="text-muted-foreground font-medium">
                            {t(`collaboratorRoles.${collab.role}`)}:
                          </span>
                          {collab.socialUrl ? (
                            <a
                              href={collab.socialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary font-semibold hover:underline"
                            >
                              {collab.name}
                            </a>
                          ) : (
                            <span className="text-foreground font-semibold">
                              {collab.name}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Engagement Toolbar: Like, Save, Share, Fullpage */}
              <div className="border-border/60 bg-muted/20 flex items-center justify-between gap-2 rounded-2xl border p-2">
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike()}
                    className={cn(
                      "h-8 cursor-pointer gap-1.5 rounded-xl px-2.5 text-xs font-semibold transition-all",
                      isLiked
                        ? "bg-rose-500/10 text-rose-500 hover:text-rose-600"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Heart
                      className={cn(
                        "size-4",
                        isLiked && "fill-rose-500 text-rose-500"
                      )}
                    />
                    <span className="tabular-nums">{formattedLikes}</span>
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleSave}
                    className={cn(
                      "h-8 cursor-pointer gap-1.5 rounded-xl px-2.5 text-xs font-semibold transition-all",
                      isSaved
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Bookmark
                      className={cn(
                        "size-4",
                        isSaved && "fill-primary text-primary"
                      )}
                    />
                    <span className="tabular-nums">{post.savesCount || 0}</span>
                  </Button>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="text-muted-foreground hover:text-foreground h-8 cursor-pointer gap-1.5 rounded-xl px-2.5 text-xs font-semibold"
                  >
                    <Share2 className="size-3.5" />
                    <span>{copiedShare ? t("copiedShort") : t("share")}</span>
                  </Button>

                  {isModal && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleOpenFullPage}
                      className="text-muted-foreground hover:text-foreground size-8 cursor-pointer rounded-xl"
                      title={t("openFullPage")}
                      aria-label={t("openFullPage")}
                    >
                      <ExternalLink className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}
