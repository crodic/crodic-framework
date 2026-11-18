"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  BadgeCheck,
  Bookmark,
  Check,
  Heart,
  Plus,
  Send,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPostCommentSchema, type PostCommentFormValues } from "./schema";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { PostDetailResDto, PostCommentResDto } from "@/services/posts";
import { cn } from "@/lib/utils";
import { toggleLikePost, addPostComment } from "@/services/posts";
import { toggleFollow } from "@/services/social";
import {
  getMyCollections,
  createCollection,
  addCollectionItem,
} from "@/services/collections";
import { useAuthStore } from "@/store/use-auth-store";
import { useProfile } from "@/hooks/use-profile";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface PostInfoProps {
  post: PostDetailResDto;
  comments?: PostCommentResDto[];
}

export function PostInfo({
  post,
  comments: initialComments = [],
}: PostInfoProps) {
  const t = useTranslations("Feed");
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: profile } = useProfile();
  const currentAuthorName = profile?.fullName || profile?.firstName || "You";
  const currentAuthorAvatar = profile?.avatar || "/logo.png";

  const [isFollowing, setIsFollowing] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser ?? false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isSaved, setIsSaved] = useState(post.isSavedByCurrentUser ?? false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [comments, setComments] =
    useState<PostCommentResDto[]>(initialComments);

  const authorHandle = post.author.handle.replace("@", "") || post.author.id;

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

  const likeMutation = useMutation({
    mutationFn: () => toggleLikePost(post.id),
    onSuccess: (res) => {
      setLikesCount(res.likesCount);
      queryClient.invalidateQueries({ queryKey: ["public-posts"] });
      queryClient.invalidateQueries({ queryKey: ["public-feed-posts"] });
      queryClient.invalidateQueries({ queryKey: ["explore-posts"] });
    },
    onError: () => {
      setIsLiked((prev) => !prev);
      setLikesCount((prev) => (isLiked ? prev + 1 : prev - 1));
    },
  });

  const followMutation = useMutation({
    mutationFn: () => toggleFollow(post.author.id),
    onSuccess: (res) => {
      setIsFollowing(res.following);
      queryClient.invalidateQueries({ queryKey: ["my-following"] });
    },
    onError: () => {
      setIsFollowing((prev) => !prev);
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
    setIsFollowing(next);
    followMutation.mutate();
  };

  const handleToggleLike = () => {
    if (!isAuthenticated) {
      toast.info(t("loginToLike"));
      return;
    }
    const next = !isLiked;
    setIsLiked(next);
    setLikesCount((prev) => (next ? prev + 1 : prev - 1));
    likeMutation.mutate();
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
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      toast.success(t("copiedShareLink"));
      setTimeout(() => setCopiedShare(false), 2500);
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
    <div className="flex h-full flex-col justify-between">
      {/* Scrollable Information Body */}
      <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
        {/* Author Header */}
        <div className="border-border/50 flex items-center justify-between gap-3 border-b pb-4">
          <Link
            href={`/cosplayer/${authorHandle}`}
            className="group flex items-center gap-3"
          >
            <div className="border-border/80 relative size-11 shrink-0 overflow-hidden rounded-full border">
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
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-foreground group-hover:text-primary text-sm font-bold transition-colors">
                  {post.author.displayName}
                </span>
                {post.author.isVerified && (
                  <BadgeCheck className="size-3.5 fill-sky-400/20 text-sky-400" />
                )}
              </div>
              <span className="text-muted-foreground text-xs">
                {post.author.handle}
              </span>
            </div>
          </Link>

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
        </div>

        {/* Title, Caption & Tags */}
        <div className="space-y-2">
          <h1 className="text-foreground text-base leading-snug font-bold sm:text-lg">
            {post.title}
          </h1>
          {post.caption && (
            <p className="text-foreground/85 text-xs leading-relaxed whitespace-pre-line sm:text-sm">
              {post.caption}
            </p>
          )}

          {/* Tags */}
          {post.tagNamesCache && post.tagNamesCache.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {post.tagNamesCache.map((tag, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="bg-muted/50 hover:bg-muted text-muted-foreground rounded-lg text-[11px] font-medium"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Collaborators / Credits */}
          {post.collaborators && post.collaborators.length > 0 && (
            <div className="border-border/50 bg-muted/20 space-y-1.5 rounded-xl border p-3">
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
        <div className="space-y-3 pt-2">
          <h3 className="text-foreground text-xs font-bold tracking-wider uppercase">
            {t("comment")} ({comments.length})
          </h3>

          <div className="space-y-3">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="flex items-start gap-2.5 text-xs"
              >
                <div className="border-border/60 relative size-8 shrink-0 overflow-hidden rounded-full border">
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
                </div>
                <div className="border-border/50 bg-muted/30 flex-1 rounded-2xl border p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-foreground font-bold">
                      {comment.author?.displayName || "User"}
                    </span>
                    <span className="text-muted-foreground text-[10px]">
                      {comment.createdAt
                        ? new Date(comment.createdAt).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                  <p className="text-foreground/90 mt-0.5 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions & Comment Input Form */}
      <div className="border-border/50 bg-card/90 shrink-0 space-y-3 border-t p-4 backdrop-blur-md">
        {/* Interaction Buttons Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleToggleLike}
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
              <span>{formattedLikes}</span>
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
              <span>{post.savesCount || 0}</span>
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-muted-foreground h-9 cursor-pointer gap-1.5 rounded-xl px-2.5 text-xs font-semibold"
          >
            <Share2 className="size-4.5" />
            <span>{copiedShare ? "Đã chép link" : t("share")}</span>
          </Button>
        </div>

        {/* Comment input form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmitComment)}
            className="flex items-center gap-2"
          >
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
            >
              <Send className="size-3.5" />
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
