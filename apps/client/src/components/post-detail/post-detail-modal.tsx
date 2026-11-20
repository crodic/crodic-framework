"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  ArrowLeft,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { PostDetailResDto, PostCommentResDto } from "@/services/posts";
import { deletePost } from "@/services/posts";
import { useProfile } from "@/hooks/use-profile";
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
import { EditPostModal } from "@/components/studio/edit-post-modal";
import { PostCarousel } from "./post-carousel";
import { PostInfo } from "./post-info";

interface PostDetailModalProps {
  post: PostDetailResDto;
  comments?: PostCommentResDto[];
}

export function PostDetailModal({ post, comments = [] }: PostDetailModalProps) {
  const router = useRouter();
  const t = useTranslations("Feed");
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const [isOpen, setIsOpen] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwnPost = Boolean(profile?.id && profile.id === post.author.id);

  const handleClose = () => {
    setIsOpen(false);
    router.back();
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t("copiedShareLink"));
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deletePost(post.id);
      toast.success(t("deletePostSuccess"));
      queryClient.invalidateQueries({ queryKey: ["following-feed-posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["explore-posts"] });
      queryClient.invalidateQueries({ queryKey: ["my-cosplayer-profile"] });
      handleClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const photos =
    post.media && post.media.length > 0
      ? post.media.map((m) => m.mediaUrl)
      : post.coverImageUrl
        ? [post.coverImageUrl]
        : [];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent
          showCloseButton={false}
          className="border-border/60 bg-card/95 shadow-primary/10 flex h-[100dvh] max-h-[100dvh] w-full max-w-full flex-col gap-0 overflow-hidden rounded-none border p-0 shadow-2xl backdrop-blur-xl sm:h-auto sm:max-h-[92vh] sm:max-w-4xl sm:rounded-3xl md:max-w-6xl xl:max-w-7xl"
        >
          <DialogTitle className="sr-only">{post.title}</DialogTitle>

          {/* ======================================================== */}
          {/* MOBILE EXPERIENCE (< md): Native Full-Screen Fluid Flow  */}
          {/* ======================================================== */}
          <div className="flex size-full flex-col overflow-hidden md:hidden">
            {/* Sticky Mobile Top App Bar */}
            <header className="border-border/60 bg-background/95 sticky top-0 z-30 flex h-13 shrink-0 items-center justify-between border-b px-3 backdrop-blur-md">
              <div className="flex min-w-0 items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-foreground hover:bg-muted/60 -ml-1 flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors active:scale-95"
                  aria-label="Back"
                >
                  <ArrowLeft className="size-5" />
                </button>

                <Link
                  href={`/cosplayer/${post.author.handle.replace("@", "") || post.author.id}`}
                  className="flex min-w-0 items-center gap-2"
                >
                  <div className="border-border/70 relative size-8 shrink-0 overflow-hidden rounded-full border">
                    {post.author.avatarUrl ? (
                      <Image
                        src={post.author.avatarUrl}
                        alt={post.author.displayName}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="bg-primary/20 text-primary flex size-full items-center justify-center text-xs font-bold">
                        {post.author.displayName.slice(0, 1)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-foreground truncate text-xs leading-tight font-bold">
                      {post.author.displayName}
                    </p>
                    <p className="text-muted-foreground truncate text-[10px]">
                      {post.author.handle}
                    </p>
                  </div>
                </Link>
              </div>

              {/* Mobile Header Right: More menu + Close */}
              <div className="flex items-center gap-0.5">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground hover:bg-muted/60 flex size-8 cursor-pointer items-center justify-center rounded-full"
                      aria-label="Options"
                    >
                      <MoreHorizontal className="size-4.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 rounded-xl p-1.5"
                  >
                    <DropdownMenuItem
                      onClick={handleShare}
                      className="cursor-pointer text-xs"
                    >
                      <Share2 className="mr-2 size-4" />
                      <span>{t("share")}</span>
                    </DropdownMenuItem>
                    {isOwnPost && (
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
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <button
                  type="button"
                  onClick={handleClose}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted/60 flex size-8 cursor-pointer items-center justify-center rounded-full"
                  aria-label={t("close")}
                >
                  <X className="size-4.5" />
                </button>
              </div>
            </header>

            {/* Mobile Scrollable Body: Single Continuous Scroll */}
            <div className="flex-1 overflow-y-auto">
              {/* Photo Showcase Stage */}
              <div className="w-full bg-zinc-950">
                <PostCarousel photos={photos} title={post.title} />
              </div>

              {/* Post Details & Threaded Comments */}
              <div className="bg-card/40">
                <PostInfo
                  post={post}
                  comments={comments}
                  onClose={handleClose}
                  isModal
                  isMobileView
                />
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* DESKTOP EXPERIENCE (>= md): High-End Theater 2-Column    */}
          {/* ======================================================== */}
          <div className="hidden flex-1 overflow-hidden md:grid md:h-[680px] md:grid-cols-12 md:overflow-hidden lg:h-[760px] xl:h-[800px]">
            {/* Photo Carousel Stage */}
            <div className="border-border/40 relative h-full shrink-0 overflow-hidden border-r bg-zinc-950 md:col-span-7 lg:col-span-8">
              <PostCarousel photos={photos} title={post.title} />
            </div>

            {/* Right Column: Author, Metadata & Threaded Comments */}
            <div className="bg-card/50 flex min-h-0 flex-1 flex-col overflow-hidden p-0 md:col-span-5 md:h-full lg:col-span-4">
              <PostInfo
                post={post}
                comments={comments}
                onClose={handleClose}
                isModal
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Post Modal & Delete Confirmation for author */}
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
                    handleDelete();
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
    </>
  );
}
