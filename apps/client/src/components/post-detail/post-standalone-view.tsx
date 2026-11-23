"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import {
  BadgeCheck,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Folder,
  Heart,
  Maximize2,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  Share2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PhotoLightbox } from "@/components/feed/photo-lightbox";
import { EditPostModal } from "@/components/studio/edit-post-modal";
import { cn } from "@/lib/utils";
import type {
  PostDetailResDto,
  PostCommentResDto,
  PostSummaryResDto,
} from "@/services/posts";
import type { CosplayerSummaryResDto } from "@/services/cosplayer";
import { getPostBySlug, deletePost } from "@/services/posts";
import { getCosplayerBySlug } from "@/services/cosplayer";
import { checkIsFollowing, toggleFollow } from "@/services/social";
import { TagHoverCard } from "@/components/tags/tag-hover-card";
import {
  getMyCollections,
  createCollection,
  addCollectionItem,
  removeCollectionItem,
  getCollectionItems,
} from "@/services/collections";
import { useAuthStore } from "@/store/use-auth-store";
import { useProfile } from "@/hooks/use-profile";
import { usePostLike } from "@/hooks/use-post-like";
import { PostCommentsThread } from "./post-comments-thread";

interface PostStandaloneViewProps {
  post: PostDetailResDto;
  comments?: PostCommentResDto[];
  authorPosts?: PostSummaryResDto[];
  suggestedCosplayers?: CosplayerSummaryResDto[];
}

export function PostStandaloneView({
  post: initialPost,
  comments: initialComments = [],
  authorPosts = [],
  suggestedCosplayers = [],
}: PostStandaloneViewProps) {
  const router = useRouter();
  const locale = useLocale();
  const queryClient = useQueryClient();
  const tPost = useTranslations("PostDetail");
  const tCommon = useTranslations("Common");

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const { data: profile, isLoading: isProfileLoading } = useProfile();

  // Photo viewer state (NO SCROLL VIEW: single active photo + thumbnail strip)
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Edit / Delete modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Synchronized Post detail
  const postSlugOrId = initialPost.slug || initialPost.id;
  const { data: post = initialPost } = useQuery({
    queryKey: ["post-detail", postSlugOrId],
    queryFn: () => getPostBySlug(postSlugOrId),
    initialData: initialPost,
    staleTime: 60 * 1000,
    refetchOnMount: true,
  });

  const photos = useMemo(() => {
    if (post.media && post.media.length > 0) {
      return post.media.map((m) => m.mediaUrl);
    }
    return post.coverImageUrl ? [post.coverImageUrl] : [];
  }, [post.media, post.coverImageUrl]);

  const authorHandle = post.author?.handle?.replace("@", "") || post.author?.id;
  const isOwnPost =
    Boolean(profile?.id) && String(profile?.id) === String(post.author.id);

  // Author details (for followersCount, etc.)
  const { data: authorProfile } = useQuery({
    queryKey: ["author-profile", authorHandle],
    queryFn: () => getCosplayerBySlug(authorHandle),
    enabled: Boolean(authorHandle),
    staleTime: 60 * 1000,
  });

  // Like reaction hook
  const { isLiked, likesCount, toggleLike } = usePostLike({
    postId: post.id,
    initialLiked: post.isLikedByCurrentUser,
    initialLikesCount: post.likesCount,
    postSlugOrId,
  });

  // Follow author state
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

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      toast.info(tPost("loginToFollow"));
      router.push(
        `/auth/login?from=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }
    const previous = isFollowing;
    setFollowOverride(!previous);
    try {
      const res = await toggleFollow(post.author.id);
      setFollowOverride(res.following);
      queryClient.invalidateQueries({
        queryKey: ["is-following", post.author.id],
      });
      queryClient.invalidateQueries({ queryKey: ["suggested-cosplayers"] });
      toast.success(res.following ? tPost("following") : tPost("follow"));
    } catch {
      setFollowOverride(previous);
      toast.error(tCommon("error"));
    }
  };

  // Keyboard navigation for active photo (< > arrows)
  const handlePrevPhoto = useCallback(() => {
    setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  }, [photos.length]);

  const handleNextPhoto = useCallback(() => {
    setActivePhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  }, [photos.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevPhoto();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNextPhoto();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrevPhoto, handleNextPhoto]);

  // Bookmark / Save collection logic
  const [isSaved, setIsSaved] = useState(
    Boolean(post.isSavedByCurrentUser ?? false)
  );
  const [savesCount, setSavesCount] = useState(
    Math.max(0, Number(post.savesCount || 0))
  );

  useEffect(() => {
    if (typeof post.isSavedByCurrentUser === "boolean") {
      setIsSaved(post.isSavedByCurrentUser);
    }
    setSavesCount(Math.max(0, Number(post.savesCount || 0)));
  }, [post.id, post.isSavedByCurrentUser, post.savesCount]);

  const toggleSaveMutation = useMutation({
    mutationFn: async ({
      nextState,
      nextCount,
    }: {
      nextState: boolean;
      previousSaved: boolean;
      previousCount: number;
      nextCount: number;
    }) => {
      const myCols = await getMyCollections({ limit: 50 });
      const collections = myCols?.data ?? [];
      const defaultCol = collections.find((c) => c.isDefault) || collections[0];

      if (nextState) {
        let targetColId = defaultCol?.id;
        if (!targetColId) {
          const created = await createCollection({
            title: tPost("defaultCollectionTitle"),
            isPublic: false,
          });
          targetColId = created.id;
        }
        try {
          await addCollectionItem(targetColId, { postId: String(post.id) });
        } catch (err: any) {
          const status = err?.status ?? err?.response?.status;
          if (status !== 409) {
            throw err;
          }
        }
      } else if (collections.length > 0) {
        const orderedCollections = defaultCol
          ? [defaultCol, ...collections.filter((c) => c.id !== defaultCol.id)]
          : collections;

        for (const col of orderedCollections) {
          try {
            const itemsRes = await getCollectionItems(col.id, { limit: 100 });
            const matchingItem = itemsRes?.data?.find(
              (item) => String(item.postId) === String(post.id)
            );
            if (matchingItem) {
              await removeCollectionItem(col.id, matchingItem.id);
              break;
            }
          } catch {
            // Continue checking next collection
          }
        }
      }

      return { nextState, nextCount };
    },
    onSuccess: ({ nextState, nextCount }) => {
      setIsSaved(nextState);
      setSavesCount(nextCount);
      queryClient.setQueryData<PostDetailResDto | undefined>(
        ["post-detail", postSlugOrId],
        (prev) =>
          prev
            ? {
                ...prev,
                isSavedByCurrentUser: nextState,
                savesCount: nextCount,
              }
            : prev
      );
      queryClient.invalidateQueries({ queryKey: ["my-collections"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["following-feed-posts"] });
      queryClient.invalidateQueries({ queryKey: ["explore-posts"] });
      queryClient.invalidateQueries({ queryKey: ["public-posts"] });
      toast.success(nextState ? tPost("saveSuccess") : tPost("unsavedSuccess"));
    },
    onError: (_err, variables) => {
      setIsSaved(variables.previousSaved);
      setSavesCount(variables.previousCount);
      toast.error(tPost("saveError"));
    },
  });

  const handleToggleSave = () => {
    if (!isAuthenticated) {
      toast.info(tPost("loginToSave"));
      router.push(
        `/auth/login?from=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }
    if (toggleSaveMutation.isPending) return;

    const previousSaved = isSaved;
    const previousCount = savesCount;
    const nextState = !previousSaved;
    const nextCount = nextState
      ? previousCount + 1
      : Math.max(0, previousCount - 1);

    setIsSaved(nextState);
    setSavesCount(nextCount);
    toggleSaveMutation.mutate({
      nextState,
      previousSaved,
      previousCount,
      nextCount,
    });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(tPost("linkCopied"));
    } catch {
      toast.error(tPost("shareError"));
    }
  };

  const handleDeletePost = async () => {
    try {
      setIsDeleting(true);
      await deletePost(post.id);
      toast.success(tPost("deleteSuccess"));
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      queryClient.invalidateQueries({ queryKey: ["explore-posts"] });
      router.push(`/cosplayer/${authorHandle}`);
    } catch {
      toast.error(tPost("deleteError"));
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(dateString));
  };

  const activePhotoUrl = photos[activePhotoIndex] || post.coverImageUrl;
  const isVideo = post.postType === "video" || Boolean(post.videoUrl);

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* 2-Column Responsive Grid: Center Stream + Right Sidebar */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px] xl:gap-8">
        {/* ========================================================= */}
        {/* CENTER COLUMN: MAIN ARTWORK POST & COMMENTS STREAM       */}
        {/* ========================================================= */}
        <div className="min-w-0 space-y-6">
          {/* 1. Header Card: Top Options, Title, Author Info */}
          <div className="border-border/60 bg-card/70 space-y-4 rounded-2xl border p-4 shadow-sm backdrop-blur-md sm:p-5">
            {/* Top Bar: Collection Badge & 3-Dots Menu */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20 gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold"
                >
                  <Folder className="size-3.5" />
                  <span>
                    {post.characterName
                      ? tPost("cosplayCharacter", {
                          character: post.characterName,
                        })
                      : post.fandomName
                        ? tPost("seriesFandom", { fandom: post.fandomName })
                        : tPost("originalOrCosplay")}
                  </span>
                </Badge>
              </div>

              {/* Options Menu (3-dots) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground size-8 cursor-pointer rounded-lg"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 text-xs">
                  {isOwnPost ? (
                    <>
                      <DropdownMenuItem
                        onClick={() => setIsEditModalOpen(true)}
                        className="cursor-pointer gap-2.5"
                      >
                        <Pencil className="size-3.5" />
                        <span>{tPost("editPost")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="text-destructive focus:text-destructive cursor-pointer gap-2.5"
                      >
                        <Trash2 className="size-3.5" />
                        <span>{tPost("deletePost")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  ) : null}
                  <DropdownMenuItem
                    onClick={handleShare}
                    className="cursor-pointer gap-2.5"
                  >
                    <Share2 className="size-3.5" />
                    <span>{tPost("share")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Post Title */}
            <h1 className="text-foreground text-lg font-bold tracking-tight sm:text-2xl">
              {post.title}
            </h1>

            {/* Author Profile Bar */}
            <div className="border-border/40 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
              <div className="flex items-center gap-3">
                <Link
                  href={`/cosplayer/${authorHandle}`}
                  className="border-border/60 relative size-10 shrink-0 overflow-hidden rounded-full border sm:size-11"
                >
                  {post.author?.avatarUrl ? (
                    <Image
                      src={post.author.avatarUrl}
                      alt={post.author.displayName}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="bg-primary/20 text-primary flex size-full items-center justify-center text-sm font-bold">
                      {post.author?.displayName?.slice(0, 1) || "C"}
                    </div>
                  )}
                </Link>

                <div>
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/cosplayer/${authorHandle}`}
                      className="text-foreground hover:text-primary text-xs font-bold transition-colors hover:underline sm:text-sm"
                    >
                      {post.author?.displayName}
                    </Link>
                    {post.author?.isVerified && (
                      <BadgeCheck className="size-3.5 fill-sky-400/20 text-sky-400" />
                    )}
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    {formatDate(post.publishedAt)}
                  </p>
                </div>
              </div>

              {!isOwnPost && (
                <Button
                  size="sm"
                  onClick={handleToggleFollow}
                  variant={isFollowing ? "outline" : "default"}
                  className={cn(
                    "h-8 cursor-pointer gap-1.5 rounded-xl px-3.5 text-xs font-semibold transition-all",
                    isFollowing
                      ? "border-primary/40 text-primary hover:bg-primary/10"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {isFollowing ? (
                    <>
                      <Check className="size-3.5" />
                      <span>{tPost("following")}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="size-3.5" />
                      <span>{tPost("follow")}</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* 2. Horizontal Thumbnail Strip (Multi-Photo Selector) */}
          {photos.length > 1 && !isVideo && (
            <div className="border-border/60 bg-card/60 rounded-2xl border p-2.5 shadow-sm backdrop-blur-md">
              <div className="flex [scrollbar-width:none] items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
                {photos.map((photo, index) => {
                  const isActive = index === activePhotoIndex;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActivePhotoIndex(index)}
                      className={cn(
                        "relative aspect-[3/4] h-18 w-13.5 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-all sm:h-22 sm:w-16.5",
                        isActive
                          ? "border-primary ring-primary/40 scale-[1.03] opacity-100 shadow-md ring-2"
                          : "border-border/50 hover:border-primary/50 opacity-60 hover:opacity-100"
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo}
                        alt={`${post.title} thumb ${index + 1}`}
                        className="size-full object-cover"
                      />
                      <span className="py-0.2 absolute right-1 bottom-1 rounded-md bg-black/70 px-1 text-[9px] font-semibold text-white backdrop-blur-xs">
                        {index + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Main Artwork Stage (Single Active Photo, NO SCROLL VIEW) */}
          <div className="border-border/60 relative flex max-h-[82vh] min-h-[380px] w-full items-center justify-center overflow-hidden rounded-2xl border bg-zinc-950/90 shadow-2xl sm:rounded-3xl">
            {isVideo ? (
              <video
                src={
                  post.videoUrl || (post.media && post.media[0]?.mediaUrl) || ""
                }
                poster={post.coverImageUrl}
                controls
                autoPlay
                playsInline
                className="aspect-video max-h-[82vh] w-full object-contain"
              />
            ) : (
              <div
                onClick={() => setLightboxIndex(activePhotoIndex)}
                className="group relative flex size-full cursor-zoom-in items-center justify-center p-2 sm:p-4"
              >
                {/* Active Photo */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activePhotoUrl}
                  alt={`${post.title} - ${activePhotoIndex + 1}`}
                  className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain shadow-md transition-transform duration-300 select-none group-hover:scale-[1.008]"
                  loading="eager"
                />

                {/* Hover overlay hint */}
                <div className="pointer-events-none absolute right-4 bottom-4 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-xs font-semibold text-white opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
                  <Maximize2 className="size-3.5" />
                  <span>{tPost("fullscreen")}</span>
                </div>
              </div>
            )}
          </div>

          {/* 4. Photo Navigation Bar beneath Image (< > buttons & collection counter) */}
          {photos.length > 1 && !isVideo && (
            <div className="border-border/60 bg-card/70 flex items-center justify-between rounded-2xl border px-3 py-2 shadow-sm backdrop-blur-md sm:px-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handlePrevPhoto}
                className="hover:bg-muted/80 h-8 cursor-pointer gap-1 rounded-xl px-2.5 text-xs font-medium"
              >
                <ChevronLeft className="size-4" />
                <span className="hidden sm:inline">
                  {tPost("previousPhoto")}
                </span>
              </Button>

              <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
                <Folder className="text-primary size-3.5" />
                <span className="max-w-[200px] truncate sm:max-w-[320px]">
                  {post.characterName || post.fandomName || post.title}
                </span>
                <span>•</span>
                <span className="text-foreground font-bold">
                  {activePhotoIndex + 1} / {photos.length}
                </span>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleNextPhoto}
                className="hover:bg-muted/80 h-8 cursor-pointer gap-1 rounded-xl px-2.5 text-xs font-medium"
              >
                <span className="hidden sm:inline">{tPost("nextPhoto")}</span>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}

          {/* 5. Caption & Metadata Card */}
          <div className="border-border/60 bg-card/70 space-y-3.5 rounded-2xl border p-4 shadow-sm backdrop-blur-md sm:p-5">
            {/* Caption */}
            {post.caption && (
              <p className="text-foreground/90 text-xs leading-relaxed break-words whitespace-pre-wrap sm:text-sm">
                {post.caption}
              </p>
            )}

            {/* Tag Pills */}
            {post.tagNamesCache && post.tagNamesCache.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {post.tagNamesCache.map((tag, idx) => (
                  <TagHoverCard key={idx} slugOrName={tag}>
                    <Link
                      href={`/tags/${encodeURIComponent(tag)}`}
                      className="hover:border-primary/50 hover:bg-primary/10 hover:text-primary border-border/60 bg-muted/30 text-muted-foreground inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors select-none"
                    >
                      #{tag}
                    </Link>
                  </TagHoverCard>
                ))}
              </div>
            )}
          </div>

          {/* 6. Reactions & Engagement Toolbar */}
          <div className="border-border/60 bg-card/70 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3 shadow-sm backdrop-blur-md sm:p-4">
            {/* Counts metrics */}
            <div className="text-muted-foreground flex items-center gap-3.5 text-xs">
              <span className="flex items-center gap-1.5">
                <Eye className="text-muted-foreground/80 size-3.5" />
                <span>{post.viewsCount || 0}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Heart className="size-3.5 text-rose-500/80" />
                <span>{likesCount}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Bookmark className="size-3.5 text-amber-500/80" />
                <span>{savesCount}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <MessageCircle className="size-3.5 text-sky-500/80" />
                <span>{post.commentsCount || initialComments.length}</span>
              </span>
            </div>

            {/* Interaction Buttons */}
            <div className="flex items-center gap-2">
              {/* Like Button */}
              <Button
                type="button"
                size="sm"
                variant={isLiked ? "default" : "outline"}
                onClick={toggleLike}
                className={cn(
                  "h-8.5 cursor-pointer gap-1.5 rounded-xl px-3 text-xs font-semibold transition-all",
                  isLiked
                    ? "bg-rose-500 text-white hover:bg-rose-600"
                    : "hover:border-rose-500/40 hover:text-rose-500"
                )}
              >
                <Heart className={cn("size-3.5", isLiked && "fill-current")} />
                <span>{isLiked ? tPost("liked") : tPost("like")}</span>
              </Button>

              {/* Bookmark Button */}
              <Button
                type="button"
                size="sm"
                variant={isSaved ? "default" : "outline"}
                onClick={handleToggleSave}
                disabled={toggleSaveMutation.isPending}
                className={cn(
                  "h-8.5 cursor-pointer gap-1.5 rounded-xl px-3 text-xs font-semibold transition-all",
                  isSaved
                    ? "bg-amber-500 text-white hover:bg-amber-600"
                    : "hover:border-amber-500/40 hover:text-amber-500"
                )}
              >
                <Bookmark
                  className={cn("size-3.5", isSaved && "fill-current")}
                />
                <span>{isSaved ? tPost("saved") : tPost("save")}</span>
              </Button>

              {/* Share Button */}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleShare}
                className="h-8.5 cursor-pointer gap-1.5 rounded-xl px-3 text-xs font-semibold"
              >
                <Share2 className="size-3.5" />
                <span className="hidden sm:inline">{tPost("share")}</span>
              </Button>
            </div>
          </div>

          {/* 7. Comments Section (Auto Load More when Scroll) */}
          <PostCommentsThread
            postId={post.id}
            initialComments={initialComments}
            inlineStream={true}
          />
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: AUTHOR INFO & RECOMMENDATIONS SIDEBAR       */}
        {/* ========================================================= */}
        <aside className="space-y-6 xl:sticky xl:top-4 xl:self-start">
          {/* Box 1: Thông Tin Tác Giả */}
          <div className="border-border/60 bg-card/70 space-y-4 rounded-2xl border p-4 shadow-sm backdrop-blur-md sm:p-5">
            <h3 className="text-foreground text-muted-foreground text-xs font-bold tracking-wider uppercase">
              {tPost("authorInfo")}
            </h3>

            <div className="flex items-center gap-3.5">
              <Link
                href={`/cosplayer/${authorHandle}`}
                className="border-border/60 relative size-14 shrink-0 overflow-hidden rounded-full border"
              >
                {post.author?.avatarUrl ? (
                  <Image
                    src={post.author.avatarUrl}
                    alt={post.author.displayName}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <div className="bg-primary/20 text-primary flex size-full items-center justify-center text-lg font-bold">
                    {post.author?.displayName?.slice(0, 1) || "C"}
                  </div>
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/cosplayer/${authorHandle}`}
                    className="text-foreground hover:text-primary truncate text-sm font-bold hover:underline sm:text-base"
                  >
                    {post.author?.displayName}
                  </Link>
                  {post.author?.isVerified && (
                    <BadgeCheck className="size-3.5 shrink-0 fill-sky-400/20 text-sky-400" />
                  )}
                </div>
                <p className="text-muted-foreground truncate text-xs">
                  {post.author?.handle}
                </p>
              </div>
            </div>

            <div className="border-border/40 grid grid-cols-2 gap-2 border-y py-2.5 text-center">
              <div>
                <p className="text-foreground text-sm font-bold">
                  {authorPosts.length + 1}
                </p>
                <p className="text-muted-foreground text-[11px]">
                  {tPost("artworksCount")}
                </p>
              </div>
              <div>
                <p className="text-foreground text-sm font-bold">
                  {authorProfile?.followersCount ?? 0}
                </p>
                <p className="text-muted-foreground text-[11px]">
                  {tPost("followersCount")}
                </p>
              </div>
            </div>

            {!isOwnPost && (
              <Button
                onClick={handleToggleFollow}
                variant={isFollowing ? "outline" : "default"}
                size="sm"
                className="w-full gap-1.5 rounded-xl text-xs font-semibold"
              >
                {isFollowing ? (
                  <>
                    <Check className="size-3.5" />
                    <span>{tPost("following")}</span>
                  </>
                ) : (
                  <>
                    <Plus className="size-3.5" />
                    <span>{tPost("follow")}</span>
                  </>
                )}
              </Button>
            )}

            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground w-full rounded-xl text-xs"
            >
              <Link href={`/cosplayer/${authorHandle}`}>
                {tPost("viewProfile")}
              </Link>
            </Button>
          </div>

          {/* Box 2: Thêm nhiều tác phẩm cùng tác giả */}
          {authorPosts.length > 0 && (
            <div className="border-border/60 bg-card/70 space-y-3.5 rounded-2xl border p-4 shadow-sm backdrop-blur-md">
              <div className="flex items-center justify-between">
                <h3 className="text-foreground text-muted-foreground text-xs font-bold tracking-wider uppercase">
                  {tPost("moreFromAuthor")}
                </h3>
                <Link
                  href={`/cosplayer/${authorHandle}`}
                  className="text-primary text-xs font-medium hover:underline"
                >
                  {tPost("viewMore")}
                </Link>
              </div>

              <div className="space-y-2.5">
                {authorPosts.slice(0, 6).map((item) => {
                  const itemThumb =
                    item.coverImageUrl ||
                    (item.collagePreviewUrls && item.collagePreviewUrls[0]) ||
                    "/landing/hero-banner.png";

                  return (
                    <Link
                      key={item.id}
                      href={`/posts/${item.slug || item.id}`}
                      className="group/item hover:bg-muted/50 flex items-center justify-between gap-3 rounded-xl p-1.5 transition-colors"
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="text-foreground group-hover/item:text-primary line-clamp-2 text-xs font-semibold transition-colors">
                          {item.title}
                        </p>
                        <p className="text-muted-foreground text-[11px]">
                          {tPost("viewsCount", { count: item.viewsCount || 0 })}
                        </p>
                      </div>

                      <div className="border-border/50 relative size-14 shrink-0 overflow-hidden rounded-xl border">
                        {itemThumb ? (
                          <Image
                            src={itemThumb}
                            alt={item.title}
                            fill
                            sizes="56px"
                            className="object-cover transition-opacity duration-200 group-hover/item:opacity-95"
                          />
                        ) : (
                          <div className="bg-muted text-muted-foreground flex size-full items-center justify-center">
                            <Sparkles className="size-4 opacity-40" />
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Box 3: Người Dùng Đề Cử */}
          {suggestedCosplayers.length > 0 && (
            <div className="border-border/60 bg-card/70 space-y-3.5 rounded-2xl border p-4 shadow-sm backdrop-blur-md">
              <div className="flex items-center justify-between">
                <h3 className="text-foreground text-muted-foreground text-xs font-bold tracking-wider uppercase">
                  {tPost("suggestedCosplayers")}
                </h3>
                <Link
                  href="/explore"
                  className="text-primary text-xs font-medium hover:underline"
                >
                  {tPost("viewMore")}
                </Link>
              </div>

              <div className="space-y-3">
                {suggestedCosplayers.slice(0, 4).map((cos) => {
                  const cosHandle = cos.handle?.replace("@", "") || cos.id;

                  return (
                    <div
                      key={cos.id}
                      className="flex items-center justify-between gap-2.5"
                    >
                      <Link
                        href={`/cosplayer/${cosHandle}`}
                        className="flex min-w-0 items-center gap-2.5"
                      >
                        <div className="border-border/60 relative size-9 shrink-0 overflow-hidden rounded-full border">
                          {cos.avatarUrl ? (
                            <Image
                              src={cos.avatarUrl}
                              alt={cos.displayName}
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="bg-primary/20 text-primary flex size-full items-center justify-center text-xs font-bold">
                              {cos.displayName?.slice(0, 1) || "C"}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-foreground truncate text-xs font-bold hover:underline">
                            {cos.displayName}
                          </p>
                          <p className="text-muted-foreground truncate text-[11px]">
                            {tPost("cosplayerFollowers", {
                              count: cos.followersCount || 0,
                            })}
                          </p>
                        </div>
                      </Link>

                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="h-7 shrink-0 rounded-lg px-2.5 text-[11px] font-semibold"
                      >
                        <Link href={`/cosplayer/${cosHandle}`}>
                          {tPost("view")}
                        </Link>
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Lightbox for full screen photo zoom */}
      <PhotoLightbox
        images={photos}
        currentIndex={lightboxIndex ?? 0}
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        onChangeIndex={setLightboxIndex}
        author={{
          name: post.author.displayName,
          handle: post.author.handle,
          avatarUrl: post.author.avatarUrl,
        }}
        caption={post.caption || undefined}
      />

      {/* Edit Post Modal (if owner) */}
      {isOwnPost && (
        <EditPostModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          post={post}
        />
      )}

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tPost("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {tPost("deleteConfirmDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
