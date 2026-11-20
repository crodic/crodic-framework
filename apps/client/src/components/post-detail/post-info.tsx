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
  MessageCircle,
  Plus,
  Send,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPostCommentSchema, type PostCommentFormValues } from "./schema";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import type { PostDetailResDto, PostCommentResDto } from "@/services/posts";
import { cn } from "@/lib/utils";
import { addPostComment, getPostBySlug } from "@/services/posts";
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
  const locale = useLocale();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: profile } = useProfile();
  const currentAuthorName = profile?.fullName || profile?.firstName || "You";
  const currentAuthorAvatar = profile?.avatar || "/logo.png";

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
    enabled: Boolean(isAuthenticated && !isOwnPost && post.author.id),
    staleTime: 1000 * 60 * 2,
  });

  const [followOverride, setFollowOverride] = useState<boolean | null>(null);
  const isFollowing = followOverride ?? remoteIsFollowing;

  const [isSaved, setIsSaved] = useState(post.isSavedByCurrentUser ?? false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [comments, setComments] =
    useState<PostCommentResDto[]>(initialComments);

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

  const form = useForm<PostCommentFormValues>({
    resolver: zodResolver(
      createPostCommentSchema(
        t("inputCommentError") || "Please enter a comment"
      )
    ),
    defaultValues: {
      comment: "",
    },
  });

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

  const commentMutation = useMutation({
    mutationFn: (content: string) => addPostComment(post.id, content),
    onSuccess: (created) => {
      setComments((prev) => [created, ...prev]);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["post-comments", post.id] });
      toast.success(t("commentSuccess"));
    },
    onError: () => {
      toast.error(t("commentError"));
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (nextState: boolean) => {
      const myCols = await getMyCollections({ limit: 1 });
      let targetColId = myCols?.data?.[0]?.id;
      if (!targetColId) {
        const created = await createCollection({
          title: "Saved Works",
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

  const onSubmitComment = (values: PostCommentFormValues) => {
    if (!isAuthenticated) {
      toast.info(t("loginToComment"));
      return;
    }
    commentMutation.mutate(values.comment.trim());
  };

  const formattedLikes =
    likesCount >= 1000
      ? `${(likesCount / 1000).toFixed(1)}k`
      : String(likesCount);

  return (
    <div className="flex h-full flex-col justify-between overflow-hidden">
      {/* 1. Sticky Author Header with Integrated Close Button (no collision) */}
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
          {!isOwnPost && (
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

      {/* 2. Scrollable Content & Comments Body */}
      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
        {/* Title, Metadata Pills, Caption & Clickable Tags */}
        <div className="space-y-3">
          <h1 className="text-foreground text-base leading-snug font-bold tracking-tight sm:text-lg">
            {post.title}
          </h1>

          {/* Character / Fandom / Views Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            {post.characterName && (
              <span className="bg-primary/10 text-primary border-primary/20 inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-medium">
                <Sparkles className="size-3" />
                <span className="text-primary/75">{t("characterLabel")}:</span>
                <span className="font-semibold">{post.characterName}</span>
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

          {/* Clickable Tags -> Navigate to /explore?q=tag */}
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

        {/* Comments Section */}
        <div className="border-border/50 space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-foreground flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
              <span>{t("comment")}</span>
              <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums">
                {comments.length}
              </span>
            </h3>
          </div>

          {comments.length === 0 ? (
            <div className="border-border/50 bg-muted/20 flex flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center">
              <div className="bg-muted/60 text-muted-foreground mb-2.5 flex size-10 items-center justify-center rounded-full">
                <MessageCircle className="size-5" />
              </div>
              <p className="text-foreground text-xs font-semibold">
                {t("noCommentsTitle")}
              </p>
              <p className="text-muted-foreground mt-1 max-w-[240px] text-[11px] leading-relaxed">
                {t("noCommentsDesc")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => {
                const commentHandle =
                  comment.author?.handle?.replace("@", "") ||
                  comment.author?.id;
                return (
                  <div
                    key={comment.id}
                    className="flex items-start gap-2.5 text-xs"
                  >
                    <Link
                      href={`/cosplayer/${commentHandle}`}
                      className="border-border/60 relative size-8 shrink-0 overflow-hidden rounded-full border"
                    >
                      {comment.author?.avatarUrl ? (
                        <Image
                          src={comment.author.avatarUrl}
                          alt={comment.author.displayName}
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="bg-primary/20 text-primary flex size-full items-center justify-center text-[10px] font-bold">
                          {comment.author?.displayName?.slice(0, 1) || "U"}
                        </div>
                      )}
                    </Link>
                    <div className="border-border/50 bg-muted/30 flex-1 rounded-2xl border p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <Link
                          href={`/cosplayer/${commentHandle}`}
                          className="text-foreground hover:text-primary font-bold transition-colors"
                        >
                          {comment.author?.displayName || "User"}
                        </Link>
                        <span className="text-muted-foreground text-[10px]">
                          {comment.createdAt
                            ? new Intl.DateTimeFormat(locale, {
                                dateStyle: "short",
                              }).format(new Date(comment.createdAt))
                            : ""}
                        </span>
                      </div>
                      <p className="text-foreground/90 mt-0.5 leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Sticky Bottom Actions & Comment Input Form */}
      <div className="border-border/60 bg-card/90 shrink-0 space-y-3 border-t px-4 py-3.5 backdrop-blur-md sm:px-5">
        {/* Interaction Buttons Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => toggleLike()}
              className={cn(
                "h-9 cursor-pointer gap-1.5 rounded-xl px-2.5 text-xs font-semibold",
                isLiked
                  ? "text-rose-500 hover:text-rose-600"
                  : "text-muted-foreground"
              )}
            >
              <Heart
                className={cn(
                  "size-4.5",
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
                "h-9 cursor-pointer gap-1.5 rounded-xl px-2.5 text-xs font-semibold",
                isSaved ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Bookmark
                className={cn(
                  "size-4.5",
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
              className="text-muted-foreground hover:text-foreground h-9 cursor-pointer gap-1.5 rounded-xl px-2.5 text-xs font-semibold"
            >
              <Share2 className="size-4" />
              <span>{copiedShare ? t("copiedShort") : t("share")}</span>
            </Button>

            {isModal && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleOpenFullPage}
                className="text-muted-foreground hover:text-foreground size-9 cursor-pointer rounded-xl"
                title={t("openFullPage")}
                aria-label={t("openFullPage")}
              >
                <ExternalLink className="size-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Comment input form with current user avatar */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmitComment)}
            className="flex items-center gap-2"
          >
            <div className="border-border/70 relative size-8 shrink-0 overflow-hidden rounded-full border">
              <Image
                src={currentAuthorAvatar}
                alt={currentAuthorName}
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-0">
                  <FormControl>
                    <Input
                      placeholder={t("writeCommentPlaceholder")}
                      disabled={commentMutation.isPending}
                      className="bg-muted/40 border-border/70 h-9 rounded-xl text-xs"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              size="sm"
              disabled={commentMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 shrink-0 cursor-pointer rounded-xl px-3"
              aria-label={t("sendComment")}
            >
              <Send className="size-3.5" />
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
