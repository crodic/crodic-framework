"use client";

import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import {
  BadgeCheck,
  CornerDownRight,
  Heart,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  addPostComment,
  deletePostComment,
  getPostComments,
  toggleLikeComment,
  type PostCommentResDto,
} from "@/services/posts";
import { useAuthStore } from "@/store/use-auth-store";
import { useProfile } from "@/hooks/use-profile";

interface PostCommentsThreadProps {
  postId: string;
  initialComments?: PostCommentResDto[];
  headerContent?: React.ReactNode;
}

interface ReplyingTarget {
  rootCommentId: string;
  targetAuthorName: string;
}

export function PostCommentsThread({
  postId,
  initialComments = [],
  headerContent,
}: PostCommentsThreadProps) {
  const t = useTranslations("Feed");
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: profile } = useProfile();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<ReplyingTarget | null>(null);
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(
    new Set()
  );

  // Fetch / sync comments via TanStack Query
  const { data: comments = initialComments, isLoading } = useQuery({
    queryKey: ["post-comments", postId],
    queryFn: () => getPostComments(postId),
    initialData: initialComments,
    staleTime: 30 * 1000,
  });

  // Group comments into root comments & nested replies
  const { rootComments, repliesByParentId } = useMemo(() => {
    const roots: PostCommentResDto[] = [];
    const repliesMap = new Map<string, PostCommentResDto[]>();

    for (const comment of comments) {
      if (comment.parentCommentId) {
        const parentId = String(comment.parentCommentId);
        const existing = repliesMap.get(parentId) || [];
        existing.push(comment);
        repliesMap.set(parentId, existing);
      } else {
        roots.push(comment);
      }
    }

    return { rootComments: roots, repliesByParentId: repliesMap };
  }, [comments]);

  // Mutations
  const addCommentMutation = useMutation({
    mutationFn: ({
      content,
      parentCommentId,
    }: {
      content: string;
      parentCommentId?: string;
    }) => addPostComment(postId, content, parentCommentId),
    onSuccess: (newComment) => {
      setCommentText("");
      if (replyingTo) {
        // Automatically expand the thread we just replied to
        setExpandedThreads(
          (prev) => new Set([...prev, replyingTo.rootCommentId])
        );
        setReplyingTo(null);
      }
      queryClient.setQueryData<PostCommentResDto[]>(
        ["post-comments", postId],
        (old = []) => [newComment, ...old]
      );
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["post-detail"] });
      toast.success(t("commentSuccess"));
    },
    onError: () => {
      toast.error(t("commentError"));
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deletePostComment(commentId),
    onSuccess: (_, commentId) => {
      queryClient.setQueryData<PostCommentResDto[]>(
        ["post-comments", postId],
        (old = []) => old.filter((c) => String(c.id) !== String(commentId))
      );
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["post-detail"] });
      toast.success(t("commentDeleted"));
    },
    onError: () => {
      toast.error(t("commentError"));
    },
  });

  const toggleCommentLikeMutation = useMutation({
    mutationFn: (commentId: string) => toggleLikeComment(commentId),
    onSuccess: ({ liked, likesCount }, commentId) => {
      queryClient.setQueryData<PostCommentResDto[]>(
        ["post-comments", postId],
        (old = []) =>
          old.map((c) =>
            String(c.id) === String(commentId)
              ? { ...c, isLikedByCurrentUser: liked, likesCount }
              : c
          )
      );
    },
  });

  const handleStartReply = (
    rootCommentId: string,
    targetAuthorName: string
  ) => {
    if (!isAuthenticated) {
      toast.info(t("loginToComment"));
      router.push(
        `/auth/login?from=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }
    setReplyingTo({ rootCommentId, targetAuthorName });
    // Auto expand the parent thread
    setExpandedThreads((prev) => new Set([...prev, rootCommentId]));
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleToggleReplies = (rootCommentId: string) => {
    setExpandedThreads((prev) => {
      const next = new Set(prev);
      if (next.has(rootCommentId)) {
        next.delete(rootCommentId);
      } else {
        next.add(rootCommentId);
      }
      return next;
    });
  };

  const handleToggleLikeComment = (commentId: string) => {
    if (!isAuthenticated) {
      toast.info(t("loginToComment"));
      router.push(
        `/auth/login?from=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }
    toggleCommentLikeMutation.mutate(commentId);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isAuthenticated) {
      toast.info(t("loginToComment"));
      router.push(
        `/auth/login?from=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }
    const trimmed = commentText.trim();
    if (!trimmed) {
      toast.error(t("inputCommentError"));
      return;
    }

    addCommentMutation.mutate({
      content: trimmed,
      parentCommentId: replyingTo?.rootCommentId,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return t("justNow") || "vừa xong";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay}d`;

    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const currentAuthorAvatar = profile?.avatar || "/logo.png";
  const currentAuthorName = profile?.fullName || profile?.firstName || "You";

  return (
    <div className="flex h-full flex-col justify-between overflow-hidden">
      {/* 1. Header with Comment Count Pill (rendered only when headerContent is not supplied) */}
      {!headerContent && (
        <div className="border-border/50 flex shrink-0 items-center justify-between border-b px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <MessageCircle className="text-primary size-4" />
            <h3 className="text-foreground text-xs font-bold tracking-wider uppercase sm:text-sm">
              {t("comment")}
            </h3>
            <span className="bg-muted/80 text-muted-foreground rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums">
              {comments.length}
            </span>
          </div>
        </div>
      )}

      {/* 2. Scrollable Comments List (with optional headerContent at the top) */}
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
        {headerContent}

        {headerContent && (
          <div className="border-border/50 flex items-center justify-between border-t pt-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="text-primary size-4" />
              <h3 className="text-foreground text-xs font-bold tracking-wider uppercase">
                {t("comment")}
              </h3>
              <span className="bg-muted/80 text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums">
                {comments.length}
              </span>
            </div>
          </div>
        )}
        {isLoading && comments.length === 0 ? (
          <div className="flex min-h-[160px] items-center justify-center">
            <Loader2 className="text-primary size-6 animate-spin" />
          </div>
        ) : rootComments.length === 0 ? (
          <div className="border-border/50 bg-muted/20 flex flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center">
            <div className="bg-muted/60 text-muted-foreground mb-2.5 flex size-11 items-center justify-center rounded-2xl">
              <MessageCircle className="size-5" />
            </div>
            <p className="text-foreground text-xs font-bold sm:text-sm">
              {t("noCommentsTitle")}
            </p>
            <p className="text-muted-foreground mt-1 max-w-[260px] text-xs leading-relaxed">
              {t("noCommentsDesc")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {rootComments.map((rootComment) => {
              const replies =
                repliesByParentId.get(String(rootComment.id)) || [];
              const isExpanded = expandedThreads.has(String(rootComment.id));
              const rootAuthorHandle =
                rootComment.author?.handle?.replace("@", "") ||
                rootComment.author?.id;
              const isOwnRoot =
                Boolean(profile?.id) &&
                String(profile?.id) === String(rootComment.userId);

              return (
                <div key={rootComment.id} className="group/root space-y-2">
                  {/* Root Comment Bubble */}
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm">
                    <Link
                      href={`/cosplayer/${rootAuthorHandle}`}
                      className="border-border/60 relative size-8 shrink-0 overflow-hidden rounded-full border transition-transform hover:scale-105 sm:size-9"
                    >
                      {rootComment.author?.avatarUrl ? (
                        <Image
                          src={rootComment.author.avatarUrl}
                          alt={rootComment.author.displayName}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="bg-primary/20 text-primary flex size-full items-center justify-center text-[10px] font-bold">
                          {rootComment.author?.displayName?.slice(0, 1) || "U"}
                        </div>
                      )}
                    </Link>

                    <div className="min-w-0 flex-1 space-y-1">
                      {/* Bubble */}
                      <div className="border-border/50 bg-muted/50 hover:bg-muted/70 inline-block max-w-full rounded-2xl rounded-tl-xs border px-3.5 py-2.5 shadow-2xs transition-colors dark:bg-zinc-800/60 dark:hover:bg-zinc-800/80">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/cosplayer/${rootAuthorHandle}`}
                            className="text-foreground hover:text-primary truncate text-xs font-bold transition-colors hover:underline sm:text-[13px]"
                          >
                            {rootComment.author?.displayName || "User"}
                          </Link>
                          {rootComment.author?.isVerified && (
                            <BadgeCheck className="size-3 shrink-0 fill-sky-400/20 text-sky-400" />
                          )}
                        </div>
                        <p className="text-foreground/90 mt-0.5 text-xs leading-relaxed break-words whitespace-pre-wrap sm:text-[13px]">
                          {rootComment.content}
                        </p>
                      </div>

                      {/* Micro Action Bar */}
                      <div className="text-muted-foreground flex items-center gap-3 px-1 text-[11px]">
                        <span>{formatRelativeTime(rootComment.createdAt)}</span>

                        <button
                          type="button"
                          onClick={() =>
                            handleToggleLikeComment(rootComment.id)
                          }
                          className={cn(
                            "hover:text-foreground cursor-pointer font-semibold transition-colors",
                            rootComment.isLikedByCurrentUser
                              ? "text-rose-500 hover:text-rose-600"
                              : "text-muted-foreground"
                          )}
                        >
                          <span>{t("likeComment")}</span>
                          {rootComment.likesCount > 0 && (
                            <span className="ml-1 inline-flex items-center gap-0.5 text-[10px] tabular-nums">
                              <Heart className="size-2.5 fill-rose-500 text-rose-500" />
                              <span>{rootComment.likesCount}</span>
                            </span>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleStartReply(
                              rootComment.id,
                              rootComment.author?.displayName || "User"
                            )
                          }
                          className="hover:text-primary cursor-pointer font-semibold transition-colors"
                        >
                          {t("reply")}
                        </button>

                        {isOwnRoot && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="text-muted-foreground hover:text-foreground cursor-pointer opacity-0 transition-opacity group-hover/root:opacity-100"
                                aria-label="Tùy chọn"
                              >
                                <MoreHorizontal className="size-3.5" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="start"
                              className="w-28 rounded-xl p-1"
                            >
                              <DropdownMenuItem
                                onClick={() =>
                                  deleteCommentMutation.mutate(rootComment.id)
                                }
                                className="cursor-pointer text-xs text-rose-500 focus:text-rose-500"
                              >
                                <Trash2 className="mr-1.5 size-3.5" />
                                <span>{t("deleteComment")}</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Threaded Replies */}
                  {replies.length > 0 && (
                    <div className="pl-9 sm:pl-11">
                      {/* Toggle button */}
                      <button
                        type="button"
                        onClick={() => handleToggleReplies(rootComment.id)}
                        className="text-primary inline-flex cursor-pointer items-center gap-1.5 py-1 text-xs font-semibold transition-colors hover:underline"
                      >
                        <CornerDownRight className="size-3.5 stroke-[2.5]" />
                        <span>
                          {isExpanded
                            ? t("hideReplies")
                            : t("viewReplies", {
                                count: String(replies.length),
                              })}
                        </span>
                      </button>

                      {/* Expanded replies list with vertical branch line */}
                      {isExpanded && (
                        <div className="border-border/50 relative mt-2 space-y-3 border-l-2 pl-3 sm:pl-4">
                          {replies.map((reply) => {
                            const replyAuthorHandle =
                              reply.author?.handle?.replace("@", "") ||
                              reply.author?.id;
                            const isOwnReply =
                              Boolean(profile?.id) &&
                              String(profile?.id) === String(reply.userId);

                            return (
                              <div
                                key={reply.id}
                                className="group/reply flex items-start gap-2 text-xs sm:text-sm"
                              >
                                <Link
                                  href={`/cosplayer/${replyAuthorHandle}`}
                                  className="border-border/60 relative size-6.5 shrink-0 overflow-hidden rounded-full border transition-transform hover:scale-105 sm:size-7"
                                >
                                  {reply.author?.avatarUrl ? (
                                    <Image
                                      src={reply.author.avatarUrl}
                                      alt={reply.author.displayName}
                                      fill
                                      sizes="28px"
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="bg-primary/20 text-primary flex size-full items-center justify-center text-[9px] font-bold">
                                      {reply.author?.displayName?.slice(0, 1) ||
                                        "U"}
                                    </div>
                                  )}
                                </Link>

                                <div className="min-w-0 flex-1 space-y-1">
                                  {/* Bubble */}
                                  <div className="border-border/50 bg-muted/50 hover:bg-muted/70 inline-block max-w-full rounded-2xl rounded-tl-xs border px-3 py-2 shadow-2xs transition-colors dark:bg-zinc-800/60 dark:hover:bg-zinc-800/80">
                                    <div className="flex items-center gap-1">
                                      <Link
                                        href={`/cosplayer/${replyAuthorHandle}`}
                                        className="text-foreground hover:text-primary truncate text-[11px] font-bold transition-colors hover:underline sm:text-xs"
                                      >
                                        {reply.author?.displayName || "User"}
                                      </Link>
                                      {reply.author?.isVerified && (
                                        <BadgeCheck className="size-3 shrink-0 fill-sky-400/20 text-sky-400" />
                                      )}
                                    </div>
                                    <p className="text-foreground/90 mt-0.5 text-[11px] leading-relaxed break-words whitespace-pre-wrap sm:text-xs">
                                      {reply.content}
                                    </p>
                                  </div>

                                  {/* Micro bar */}
                                  <div className="text-muted-foreground flex items-center gap-3 px-1 text-[10px] sm:text-[11px]">
                                    <span>
                                      {formatRelativeTime(reply.createdAt)}
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleToggleLikeComment(reply.id)
                                      }
                                      className={cn(
                                        "hover:text-foreground cursor-pointer font-semibold transition-colors",
                                        reply.isLikedByCurrentUser
                                          ? "text-rose-500 hover:text-rose-600"
                                          : "text-muted-foreground"
                                      )}
                                    >
                                      <span>{t("likeComment")}</span>
                                      {reply.likesCount > 0 && (
                                        <span className="ml-1 inline-flex items-center gap-0.5 text-[10px] tabular-nums">
                                          <Heart className="size-2.5 fill-rose-500 text-rose-500" />
                                          <span>{reply.likesCount}</span>
                                        </span>
                                      )}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleStartReply(
                                          rootComment.id,
                                          reply.author?.displayName || "User"
                                        )
                                      }
                                      className="hover:text-primary cursor-pointer font-semibold transition-colors"
                                    >
                                      {t("reply")}
                                    </button>

                                    {isOwnReply && (
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <button
                                            type="button"
                                            className="text-muted-foreground hover:text-foreground cursor-pointer opacity-0 transition-opacity group-hover/reply:opacity-100"
                                            aria-label="Tùy chọn"
                                          >
                                            <MoreHorizontal className="size-3.5" />
                                          </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                          align="start"
                                          className="w-28 rounded-xl p-1"
                                        >
                                          <DropdownMenuItem
                                            onClick={() =>
                                              deleteCommentMutation.mutate(
                                                reply.id
                                              )
                                            }
                                            className="cursor-pointer text-xs text-rose-500 focus:text-rose-500"
                                          >
                                            <Trash2 className="mr-1.5 size-3.5" />
                                            <span>{t("deleteComment")}</span>
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Sticky Bottom Reply Form */}
      <div className="border-border/60 bg-card/95 pb-safe shrink-0 border-t px-3.5 py-3 backdrop-blur-md sm:px-5">
        {/* Replying banner */}
        {replyingTo && (
          <div className="bg-primary/10 text-primary mb-2 flex items-center justify-between rounded-xl px-3 py-1.5 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <CornerDownRight className="size-3.5" />
              <span>
                {t("replyingTo", { name: replyingTo.targetAuthorName })}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="hover:bg-primary/20 flex size-5 cursor-pointer items-center justify-center rounded-full"
              aria-label={t("cancelReply")}
            >
              <X className="size-3" />
            </button>
          </div>
        )}

        {/* Input box */}
        <form onSubmit={handleSubmit} className="flex items-end gap-2.5">
          <div className="border-border/70 relative size-8 shrink-0 overflow-hidden rounded-full border sm:size-9">
            <Image
              src={currentAuthorAvatar}
              alt={currentAuthorName}
              fill
              sizes="36px"
              className="object-cover"
            />
          </div>

          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              rows={1}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                replyingTo
                  ? t("replyingTo", { name: replyingTo.targetAuthorName })
                  : t("writeCommentPlaceholder")
              }
              disabled={addCommentMutation.isPending}
              className="border-border/60 bg-muted/40 text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:bg-background focus:ring-primary/25 block max-h-28 min-h-[38px] w-full resize-none scrollbar-none rounded-2xl border px-3.5 py-2 text-xs leading-relaxed focus:ring-2 focus:outline-hidden sm:text-sm"
            />
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={!commentText.trim() || addCommentMutation.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90 size-9 shrink-0 cursor-pointer rounded-xl p-0 shadow-xs disabled:opacity-40"
            aria-label={t("sendComment")}
          >
            {addCommentMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
