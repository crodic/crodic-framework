"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Smile,
} from "lucide-react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
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
  getPostCommentsPaginated,
  toggleLikeComment,
  type PostCommentResDto,
} from "@/services/posts";
import { useAuthStore } from "@/store/use-auth-store";
import { useProfile } from "@/hooks/use-profile";

interface PostCommentsThreadProps {
  postId: string;
  initialComments?: PostCommentResDto[];
  headerContent?: React.ReactNode;
  isMobileView?: boolean;
  inlineStream?: boolean;
}

interface ReplyingTarget {
  rootCommentId: string;
  targetAuthorName: string;
}

export function PostCommentsThread({
  postId,
  initialComments = [],
  headerContent,
  isMobileView = false,
  inlineStream = false,
}: PostCommentsThreadProps) {
  const t = useTranslations("Feed");
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: profile } = useProfile();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);

  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<ReplyingTarget | null>(null);
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(
    new Set()
  );
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest");

  // Fetch paginated comments via TanStack Infinite Query
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["post-comments-infinite", postId, sortBy],
    queryFn: ({ pageParam = 1 }) =>
      getPostCommentsPaginated(postId, pageParam, 10, sortBy),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.meta;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 30 * 1000,
  });

  // Flatten comments across pages, falling back to initialComments
  const comments = useMemo(() => {
    if (!infiniteData?.pages || infiniteData.pages.length === 0) {
      return initialComments;
    }
    const flat = infiniteData.pages.flatMap((page) => page.data);
    return flat.length > 0 ? flat : initialComments;
  }, [infiniteData, initialComments]);

  const totalCommentsCount =
    infiniteData?.pages?.[0]?.meta?.totalItems ?? comments.length;

  // Auto load more when user scrolls down to sentinel
  useEffect(() => {
    const sentinel = bottomSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: "350px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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
    onSuccess: () => {
      setCommentText("");
      if (replyingTo) {
        setExpandedThreads(
          (prev) => new Set([...prev, replyingTo.rootCommentId])
        );
        setReplyingTo(null);
      }
      queryClient.invalidateQueries({
        queryKey: ["post-comments-infinite", postId],
      });
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["post-comments-infinite", postId],
      });
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["post-detail"] });
      toast.success(t("deleteCommentSuccess"));
    },
    onError: () => {
      toast.error(t("deleteCommentError"));
    },
  });

  const toggleLikeMutation = useMutation({
    mutationFn: (commentId: string) => toggleLikeComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["post-comments-infinite", postId],
      });
    },
  });

  const handleToggleLikeComment = (commentId: string) => {
    if (!isAuthenticated) {
      toast.info(t("loginToLikeComment"));
      router.push(
        `/auth/login?from=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }
    toggleLikeMutation.mutate(commentId);
  };

  const handleStartReply = (
    rootCommentId: string,
    targetAuthorName: string
  ) => {
    setReplyingTo({ rootCommentId, targetAuthorName });
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
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

    if (diffSec < 60) return t("justNow");
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
  const currentAuthorName = profile?.fullName || profile?.firstName || t("you");

  // RENDER FORM (Input box)
  const renderInputBox = (isTopStream = false) => (
    <div
      className={cn(
        "space-y-3",
        isTopStream
          ? "border-border/60 bg-card/60 rounded-2xl border p-4 shadow-sm backdrop-blur-md"
          : "border-border/60 bg-card/95 pb-safe shrink-0 border-t px-3.5 py-3 backdrop-blur-md sm:px-5"
      )}
    >
      {/* Replying banner */}
      {replyingTo && (
        <div className="bg-primary/10 text-primary flex items-center justify-between rounded-xl px-3 py-1.5 text-xs">
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
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="border-border/70 relative size-9 shrink-0 overflow-hidden rounded-full border sm:size-10">
            <Image
              src={currentAuthorAvatar}
              alt={currentAuthorName}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>

          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              rows={isTopStream ? 2 : 1}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                replyingTo
                  ? t("replyingTo", { name: replyingTo.targetAuthorName })
                  : t("writeCommentPlaceholder")
              }
              disabled={addCommentMutation.isPending}
              className="border-border/70 bg-background/50 text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:bg-background focus:ring-primary/25 block w-full resize-none rounded-xl border px-3.5 py-2.5 text-xs leading-relaxed focus:ring-2 focus:outline-hidden sm:text-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="text-muted-foreground flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground size-8 rounded-lg"
              title="Emoji"
            >
              <Smile className="size-4" />
            </Button>
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={!commentText.trim() || addCommentMutation.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 gap-1.5 rounded-xl px-4 text-xs font-semibold shadow-xs disabled:opacity-40"
          >
            {addCommentMutation.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Send className="size-3.5" />
            )}
            <span>{t("sendComment")}</span>
          </Button>
        </div>
      </form>
    </div>
  );

  // RENDER COMMENTS LIST
  const renderCommentItems = () => {
    if (isLoading && comments.length === 0) {
      return (
        <div className="flex min-h-[160px] items-center justify-center">
          <Loader2 className="text-primary size-6 animate-spin" />
        </div>
      );
    }

    if (rootComments.length === 0) {
      return (
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
      );
    }

    return (
      <div className="space-y-4">
        {rootComments.map((rootComment) => {
          const replies = repliesByParentId.get(String(rootComment.id)) || [];
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
                  className="border-border/60 relative size-8 shrink-0 overflow-hidden rounded-full border sm:size-9"
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
                  <div className="border-border/50 bg-muted/40 hover:bg-muted/60 inline-block max-w-full rounded-2xl rounded-tl-xs border px-3.5 py-2.5 shadow-2xs transition-colors dark:bg-zinc-800/50 dark:hover:bg-zinc-800/70">
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
                      onClick={() => handleToggleLikeComment(rootComment.id)}
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
                          <Heart className="size-2.5 fill-current" />
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
                      className="hover:text-foreground cursor-pointer font-semibold transition-colors"
                    >
                      {t("reply")}
                    </button>

                    {isOwnRoot && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="hover:text-foreground cursor-pointer opacity-0 transition-opacity group-hover/root:opacity-100"
                            aria-label={t("optionsAria")}
                          >
                            <MoreHorizontal className="size-3" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="w-28 text-xs"
                        >
                          <DropdownMenuItem
                            onClick={() =>
                              deleteCommentMutation.mutate(rootComment.id)
                            }
                            className="text-destructive focus:text-destructive cursor-pointer gap-2"
                          >
                            <Trash2 className="size-3" />
                            <span>{t("deleteComment")}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </div>

              {/* Nested Replies Section */}
              {replies.length > 0 && (
                <div className="ml-8 space-y-2 pt-1 sm:ml-10">
                  {!isExpanded && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedThreads(
                          (prev) => new Set([...prev, String(rootComment.id)])
                        )
                      }
                      className="text-primary hover:text-primary/80 flex cursor-pointer items-center gap-1.5 text-xs font-semibold transition-colors"
                    >
                      <CornerDownRight className="size-3.5" />
                      <span>
                        {t("viewReplies", { count: String(replies.length) })}
                      </span>
                    </button>
                  )}

                  {isExpanded && (
                    <div className="border-border/50 space-y-3 border-l-2 pl-3">
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
                            className="group/reply flex items-start gap-2.5 text-xs sm:text-sm"
                          >
                            <Link
                              href={`/cosplayer/${replyAuthorHandle}`}
                              className="border-border/60 relative size-7 shrink-0 overflow-hidden rounded-full border"
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
                              <div className="border-border/50 bg-muted/30 hover:bg-muted/50 inline-block max-w-full rounded-2xl rounded-tl-xs border px-3 py-2 shadow-2xs transition-colors dark:bg-zinc-800/40 dark:hover:bg-zinc-800/60">
                                <div className="flex items-center gap-1.5">
                                  <Link
                                    href={`/cosplayer/${replyAuthorHandle}`}
                                    className="text-foreground hover:text-primary truncate text-xs font-bold transition-colors hover:underline"
                                  >
                                    {reply.author?.displayName || "User"}
                                  </Link>
                                  {reply.author?.isVerified && (
                                    <BadgeCheck className="size-3 shrink-0 fill-sky-400/20 text-sky-400" />
                                  )}
                                </div>
                                <p className="text-foreground/90 mt-0.5 text-xs leading-relaxed break-words whitespace-pre-wrap">
                                  {reply.content}
                                </p>
                              </div>

                              <div className="text-muted-foreground flex items-center gap-3 px-1 text-[10px]">
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
                                    <span className="ml-1 inline-flex items-center gap-0.5 text-[9px] tabular-nums">
                                      <Heart className="size-2 fill-current" />
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
                                  className="hover:text-foreground cursor-pointer font-semibold transition-colors"
                                >
                                  {t("reply")}
                                </button>

                                {isOwnReply && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button
                                        type="button"
                                        className="hover:text-foreground cursor-pointer opacity-0 transition-opacity group-hover/reply:opacity-100"
                                        aria-label={t("optionsAria")}
                                      >
                                        <MoreHorizontal className="size-3" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="start"
                                      className="w-28 text-xs"
                                    >
                                      <DropdownMenuItem
                                        onClick={() =>
                                          deleteCommentMutation.mutate(reply.id)
                                        }
                                        className="text-destructive focus:text-destructive cursor-pointer gap-2"
                                      >
                                        <Trash2 className="size-3" />
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

        {/* Sentinel for auto-load more on scroll */}
        <div ref={bottomSentinelRef} className="h-6 w-full" />

        {isFetchingNextPage && (
          <div className="text-muted-foreground flex items-center justify-center gap-2 py-4 text-xs">
            <Loader2 className="text-primary size-4 animate-spin" />
            <span>Đang tải thêm bình luận...</span>
          </div>
        )}

        {!hasNextPage && comments.length > 5 && (
          <p className="text-muted-foreground/60 py-3 text-center text-xs">
            Đã hiển thị tất cả bình luận
          </p>
        )}
      </div>
    );
  };

  // INLINE STREAM MODE (For full page layout)
  if (inlineStream) {
    return (
      <div className="border-border/50 w-full space-y-6 border-t pt-6">
        {/* Header Row: Title & Sort */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="text-primary size-5" />
            <h3 className="text-foreground text-sm font-bold tracking-wider uppercase sm:text-base">
              {t("comment")}
            </h3>
            <span className="bg-muted/80 text-muted-foreground rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums">
              {totalCommentsCount}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setSortBy("newest")}
              className={cn(
                "cursor-pointer rounded-md px-2 py-1 font-medium transition-colors",
                sortBy === "newest"
                  ? "text-primary bg-primary/10 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("sortNewest")}
            </button>
            <span className="text-muted-foreground/40">•</span>
            <button
              type="button"
              onClick={() => setSortBy("popular")}
              className={cn(
                "cursor-pointer rounded-md px-2 py-1 font-medium transition-colors",
                sortBy === "popular"
                  ? "text-primary bg-primary/10 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("sortPopular")}
            </button>
          </div>
        </div>

        {/* Comment input form at the top */}
        {renderInputBox(true)}

        {/* Comment items list */}
        {renderCommentItems()}
      </div>
    );
  }

  // DEFAULT MODAL / SIDEBAR MODE
  return (
    <div className="flex h-full flex-col justify-between overflow-hidden">
      {!headerContent && (
        <div className="border-border/50 flex shrink-0 items-center justify-between border-b px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <MessageCircle className="text-primary size-4" />
            <h3 className="text-foreground text-xs font-bold tracking-wider uppercase sm:text-sm">
              {t("comment")}
            </h3>
            <span className="bg-muted/80 text-muted-foreground rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums">
              {totalCommentsCount}
            </span>
          </div>
        </div>
      )}

      <div
        className={cn(
          "space-y-4 px-4 py-4 sm:px-5",
          isMobileView ? "overflow-visible" : "flex-1 overflow-y-auto"
        )}
      >
        {headerContent}
        {renderCommentItems()}
      </div>

      {renderInputBox(false)}
    </div>
  );
}
