"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  Bookmark,
  Check,
  Flag,
  Heart,
  Images,
  MessageCircle,
  MoreHorizontal,
  SendHorizontal,
  Share2,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { ReportDialog } from "@/components/common/report-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "@/components/ui/motion-primitives";
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
import { EditPostModal } from "@/components/studio/edit-post-modal";
import {
  addPostComment,
  deletePost,
  type PostSummaryResDto,
} from "@/services/posts";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PhotoLightbox } from "./photo-lightbox";
import { useProfile } from "@/hooks/use-profile";
import { useAuthStore } from "@/store/use-auth-store";
import { usePostLike } from "@/hooks/use-post-like";
import {
  getMyCollections,
  createCollection,
  addCollectionItem,
} from "@/services/collections";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFeedCommentSchema, type FeedCommentFormValues } from "./schema";

export interface FeedPostCardProps {
  post: PostSummaryResDto;
}

interface LocalComment {
  id: string;
  authorName: string;
  authorAvatarUrl: string;
  content: string;
  createdAt: string;
}

export function FeedPostCard({ post }: FeedPostCardProps) {
  const t = useTranslations("Feed");
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: profile } = useProfile();
  const currentAuthorName = profile?.fullName || profile?.firstName || t("you");
  const currentAuthorAvatar = profile?.avatar || "/logo.png";

  const {
    isLiked,
    likesCount,
    toggleLike: handleToggleLike,
  } = usePostLike({
    postId: post.id,
    initialLiked: post.isLikedByCurrentUser,
    initialLikesCount: post.likesCount,
    postSlugOrId: post.slug || post.id,
  });

  const [isBookmarked, setIsBookmarked] = useState(
    post.isSavedByCurrentUser ?? false
  );
  const [comments, setComments] = useState<LocalComment[]>([]);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);

  // Fullscreen Photo Lightbox State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const isOwnPost = Boolean(profile?.id && profile.id === post.author.id);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const handleDeletePost = async () => {
    try {
      setIsDeleting(true);
      await deletePost(post.id);
      toast.success(t("deletePostSuccess"));
      queryClient.invalidateQueries({ queryKey: ["following-feed-posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["explore-posts"] });
      queryClient.invalidateQueries({ queryKey: ["my-cosplayer-profile"] });
      setIsDeleteDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const images =
    post.collagePreviewUrls && post.collagePreviewUrls.length > 0
      ? post.collagePreviewUrls
      : post.coverImageUrl
        ? [post.coverImageUrl]
        : [];

  const postSlugOrId = encodeURIComponent(String(post.slug || post.id).trim());
  const postDateString = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString()
    : "";

  const commentSchema = React.useMemo(
    () => createFeedCommentSchema(t("inputCommentError")),
    [t]
  );

  const form = useForm<FeedCommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      comment: "",
    },
  });

  const bookmarkMutation = useMutation({
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
      setIsBookmarked(!isBookmarked);
      toast.error(t("saveError"));
    },
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => addPostComment(post.id, content),
    onSuccess: (created) => {
      const newComment: LocalComment = {
        id: created.id || `comment-${Date.now()}`,
        authorName: created.author?.displayName || currentAuthorName,
        authorAvatarUrl: created.author?.avatarUrl || currentAuthorAvatar,
        content: created.content,
        createdAt: t("justNow"),
      };
      setComments((prev) => [newComment, ...prev]);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["post-comments", post.id] });
      toast.success(t("commentSuccess"));
    },
    onError: () => {
      toast.error(t("commentError"));
    },
  });

  const handleToggleBookmark = () => {
    if (!isAuthenticated) {
      toast.info(t("loginToComment"));
      return;
    }
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    bookmarkMutation.mutate(nextState);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(
        window.location.origin + `/posts/${postSlugOrId}`
      );
      toast.success(t("copiedShareLink"));
    }
  };

  const onSubmitComment = (values: FeedCommentFormValues) => {
    if (!isAuthenticated) {
      toast.info(t("loginToComment"));
      return;
    }
    commentMutation.mutate(values.comment.trim());
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const captionText = post.caption || post.title;
  const isLongCaption = captionText.length > 130 || captionText.includes("\n");
  const displayCaption =
    !isLongCaption || isCaptionExpanded
      ? captionText
      : captionText.slice(0, 130).trim() + "...";

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="border-border/70 bg-card/70 hover:border-border rounded-3xl border p-4 shadow-xs backdrop-blur-md transition-colors sm:p-5"
      >
        {/* 1. Post Header: Author info & options */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/cosplayer/${post.author.handle.replace("@", "") || post.author.id}`}
              className="group ring-primary/20 hover:ring-primary/60 relative size-10 shrink-0 overflow-hidden rounded-full ring-2 transition-all sm:size-11"
            >
              {post.author.avatarUrl ? (
                <Image
                  src={post.author.avatarUrl}
                  alt={post.author.displayName}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              ) : (
                <div className="bg-primary/10 text-primary flex size-full items-center justify-center font-bold">
                  {post.author.displayName.slice(0, 1)}
                </div>
              )}
            </Link>

            <div>
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/cosplayer/${post.author.handle.replace("@", "") || post.author.id}`}
                  className="text-foreground hover:text-primary text-sm font-bold transition-colors"
                >
                  {post.author.displayName}
                </Link>
                {post.author.isVerified && (
                  <span className="bg-primary/20 text-primary flex size-4 items-center justify-center rounded-full">
                    <Check className="size-2.5 stroke-[3]" />
                  </span>
                )}
              </div>

              <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <span>{post.author.handle}</span>
                {postDateString && (
                  <>
                    <span>•</span>
                    <span>{postDateString}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Options Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground hover:bg-muted/60 hover:text-foreground cursor-pointer rounded-lg p-1.5 transition-colors"
                aria-label={t("optionsAria")}
              >
                <MoreHorizontal className="size-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5">
              <DropdownMenuItem
                onClick={handleShare}
                className="cursor-pointer text-xs"
              >
                <Share2 className="mr-2 size-4" />
                <span>{t("copyLink")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleToggleBookmark}
                className="cursor-pointer text-xs"
              >
                <Bookmark className="mr-2 size-4" />
                <span>{isBookmarked ? t("unsavePost") : t("savePost")}</span>
              </DropdownMenuItem>
              {isOwnPost ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setIsEditModalOpen(true)}
                    className="cursor-pointer text-xs"
                  >
                    <Pencil className="mr-2 size-4" />
                    <span>{t("editPost")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-destructive focus:text-destructive cursor-pointer text-xs"
                  >
                    <Trash2 className="mr-2 size-4" />
                    <span>{t("deletePost")}</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setIsReportDialogOpen(true)}
                    className="text-destructive focus:text-destructive cursor-pointer text-xs"
                  >
                    <Flag className="mr-2 size-4" />
                    <span>{t("reportPost")}</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 2. Caption Text with Xem thêm / Thu gọn */}
        <div className="mt-3">
          <p className="text-foreground/95 text-xs leading-relaxed whitespace-pre-line sm:text-sm">
            {displayCaption}
            {isLongCaption && (
              <button
                type="button"
                onClick={() => setIsCaptionExpanded(!isCaptionExpanded)}
                className="text-primary ml-1 cursor-pointer font-semibold transition-colors hover:underline"
              >
                {isCaptionExpanded ? t("showLess") : t("showMore")}
              </button>
            )}
          </p>
        </div>

        {/* 3. Media Grid / Image / Video Preview */}
        {post.postType === "video" || Boolean(post.videoUrl) ? (
          <div className="border-border/60 relative mt-3 aspect-video w-full overflow-hidden rounded-2xl border bg-black shadow-xs">
            <video
              src={post.videoUrl || images[0] || ""}
              poster={post.coverImageUrl}
              controls
              playsInline
              preload="metadata"
              className="size-full object-contain"
            />
          </div>
        ) : images.length > 0 ? (
          <div className="mt-3 overflow-hidden rounded-2xl">
            {images.length === 1 ? (
              <div
                onClick={() => openLightbox(0)}
                className="group border-border/60 hover:border-primary/50 bg-muted/30 relative aspect-[16/10] w-full cursor-pointer overflow-hidden rounded-2xl border shadow-xs transition-colors duration-300"
              >
                <Image
                  src={images[0] ?? ""}
                  alt="Cosplay artwork"
                  fill
                  sizes="(max-width: 768px) 100vw, 700px"
                  className="object-cover transition-opacity duration-300 group-hover:opacity-95"
                />
              </div>
            ) : images.length === 2 ? (
              <div className="grid grid-cols-2 gap-2">
                {images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => openLightbox(i)}
                    className="group border-border/60 hover:border-primary/50 bg-muted/30 relative aspect-square cursor-pointer overflow-hidden rounded-2xl border shadow-xs transition-colors duration-300"
                  >
                    <Image
                      src={img}
                      alt={`Artwork ${i + 1}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 350px"
                      className="object-cover transition-opacity duration-300 group-hover:opacity-95"
                    />
                  </div>
                ))}
              </div>
            ) : (
              /* 3 or more photos: Hero on left (2 cols) + 2 stacked on right (1 col) */
              <div className="grid grid-cols-3 gap-2">
                {/* Hero left */}
                <div
                  onClick={() => openLightbox(0)}
                  className="group border-border/60 hover:border-primary/50 bg-muted/30 relative col-span-2 aspect-[4/3] cursor-pointer overflow-hidden rounded-2xl border shadow-xs transition-colors duration-300"
                >
                  <Image
                    src={images[0] ?? ""}
                    alt="Main artwork"
                    fill
                    sizes="(max-width: 768px) 70vw, 450px"
                    className="object-cover transition-opacity duration-300 group-hover:opacity-95"
                  />
                </div>

                {/* Stacked right (Top & Bottom) */}
                <div className="flex flex-col gap-2">
                  {/* Top right */}
                  <div
                    onClick={() => openLightbox(1)}
                    className="group border-border/60 hover:border-primary/50 bg-muted/30 relative flex-1 cursor-pointer overflow-hidden rounded-2xl border shadow-xs transition-colors duration-300"
                  >
                    <Image
                      src={images[1] ?? images[0] ?? ""}
                      alt="Artwork 2"
                      fill
                      sizes="(max-width: 768px) 30vw, 220px"
                      className="object-cover transition-opacity duration-300 group-hover:opacity-95"
                    />
                  </div>

                  {/* Bottom right */}
                  {images.length > 3 ? (
                    <Link
                      href={`/posts/${postSlugOrId}`}
                      scroll={false}
                      className="group border-border/60 hover:border-primary/50 bg-muted/30 relative flex-1 cursor-pointer overflow-hidden rounded-2xl border shadow-xs transition-colors duration-300"
                    >
                      <Image
                        src={images[2] ?? images[0] ?? ""}
                        alt="Artwork 3"
                        fill
                        sizes="(max-width: 768px) 30vw, 220px"
                        className="object-cover transition-opacity duration-300 group-hover:opacity-95"
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/65 font-medium text-white backdrop-blur-xs transition-colors hover:bg-black/55">
                        <Images className="size-5" />
                        <span className="text-xs font-bold">
                          +{images.length - 3}
                        </span>
                      </div>
                    </Link>
                  ) : (
                    <div
                      onClick={() => openLightbox(2)}
                      className="group border-border/60 hover:border-primary/50 bg-muted/30 relative flex-1 cursor-pointer overflow-hidden rounded-2xl border shadow-xs transition-colors duration-300"
                    >
                      <Image
                        src={images[2] ?? images[0] ?? ""}
                        alt="Artwork 3"
                        fill
                        sizes="(max-width: 768px) 30vw, 220px"
                        className="object-cover transition-opacity duration-300 group-hover:opacity-95"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* 4. Hashtags */}
        {post.tagNamesCache && post.tagNamesCache.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tagNamesCache.map((tag) => (
              <span
                key={tag}
                className="text-primary hover:text-primary/80 cursor-pointer text-xs font-semibold hover:underline"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 5. Interaction Bar */}
        <div className="text-muted-foreground border-border/40 mt-3 flex items-center justify-between border-t pt-3 text-xs">
          <div className="flex items-center gap-1 sm:gap-4">
            {/* Like button */}
            <motion.button
              type="button"
              onClick={handleToggleLike}
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.08 }}
              className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-1.5 transition-colors ${
                isLiked
                  ? "font-semibold text-rose-500"
                  : "hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              <Heart
                className={`size-4 transition-colors ${isLiked ? "fill-rose-500 text-rose-500" : ""}`}
              />
              <span>{likesCount}</span>
            </motion.button>

            {/* Comment button */}
            <Link
              href={`/posts/${postSlugOrId}`}
              scroll={false}
              className="hover:bg-muted/60 hover:text-foreground flex cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-1.5 transition-colors"
            >
              <MessageCircle className="size-4" />
              <span>{post.commentsCount + comments.length}</span>
            </Link>

            {/* Share button */}
            <motion.button
              type="button"
              onClick={handleShare}
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.08 }}
              className="hover:bg-muted/60 hover:text-foreground flex cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-1.5 transition-colors"
            >
              <Share2 className="size-4" />
              <span>{t("share")}</span>
            </motion.button>
          </div>

          {/* Bookmark / Save button */}
          <motion.button
            type="button"
            onClick={handleToggleBookmark}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.08 }}
            className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-1.5 transition-colors ${
              isBookmarked
                ? "text-primary font-semibold"
                : "hover:bg-muted/60 hover:text-foreground"
            }`}
            title={isBookmarked ? t("unsavePost") : t("savePost")}
          >
            <Bookmark
              className={`size-4 transition-colors ${isBookmarked ? "fill-primary text-primary" : ""}`}
            />
            <span className="hidden sm:inline">{t("saved")}</span>
          </motion.button>
        </div>

        {/* 6. Inline Quick Comment Form & Snippets */}
        <div className="border-border/40 mt-3 space-y-3 border-t pt-3">
          {/* Quick Comment input form */}
          <div className="flex items-center gap-2.5">
            <div className="border-primary/20 relative size-8 shrink-0 overflow-hidden rounded-full border">
              <Image
                src={currentAuthorAvatar}
                alt={currentAuthorName}
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmitComment)}
                className="flex flex-1 items-center gap-2"
              >
                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-0">
                      <FormControl>
                        <Input
                          placeholder={t("writeCommentPlaceholder")}
                          className="border-border/60 bg-muted/30 focus-visible:border-primary/60 focus-visible:ring-primary/40 h-8.5 rounded-xl text-xs"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={commentMutation.isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-8.5 cursor-pointer rounded-xl px-3 shadow-xs"
                >
                  {commentMutation.isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <SendHorizontal className="size-3.5" />
                  )}
                </Button>
              </form>
            </Form>
          </div>

          {/* Recent comments snippet */}
          {comments.length > 0 && (
            <div className="space-y-2 pt-1">
              {comments.map((cmt) => (
                <div key={cmt.id} className="flex items-start gap-2.5 text-xs">
                  <div className="border-border/60 relative size-7 shrink-0 overflow-hidden rounded-full border">
                    <Image
                      src={cmt.authorAvatarUrl}
                      alt={cmt.authorName}
                      fill
                      sizes="28px"
                      className="object-cover"
                    />
                  </div>
                  <div className="border-border/50 bg-muted/40 flex-1 rounded-2xl border p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-foreground font-bold">
                        {cmt.authorName}
                      </span>
                      <span className="text-muted-foreground text-[10px]">
                        {cmt.createdAt}
                      </span>
                    </div>
                    <p className="text-foreground/90 mt-0.5 leading-normal">
                      {cmt.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.article>

      {/* Fullscreen Photo Lightbox */}
      <PhotoLightbox
        images={images}
        currentIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onChangeIndex={setLightboxIndex}
        author={{
          name: post.author.displayName,
          handle: post.author.handle,
          avatarUrl: post.author.avatarUrl,
        }}
        caption={captionText}
      />

      {/* Author Actions: Edit Post Modal & Delete Confirm Dialog */}
      {isOwnPost && (
        <>
          <EditPostModal
            post={post}
            open={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
          />

          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-base font-bold">
                  {t("deletePostConfirmTitle")}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs">
                  {t("deletePostConfirmDesc")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  disabled={isDeleting}
                  className="rounded-xl text-xs"
                >
                  {t("close")}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeletePost();
                  }}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl text-xs font-semibold"
                >
                  {isDeleting && (
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  )}
                  {t("deletePost")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}

      {/* Report Post Dialog */}
      <ReportDialog
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        targetType="post"
        targetId={post.id}
        targetTitle={post.title}
      />
    </>
  );
}
