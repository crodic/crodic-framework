"use client";

import React, { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { PostDetailResDto, PostCommentResDto } from "@/services/posts";
import { PostCarousel } from "./post-carousel";
import { PostInfo } from "./post-info";

interface PostDetailModalProps {
  post: PostDetailResDto;
  comments?: PostCommentResDto[];
}

export function PostDetailModal({ post, comments = [] }: PostDetailModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    router.back();
  };

  const photos =
    post.media && post.media.length > 0
      ? post.media.map((m) => m.mediaUrl)
      : post.coverImageUrl
        ? [post.coverImageUrl]
        : [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="border-border/60 bg-card/95 shadow-primary/10 flex h-[100dvh] max-h-[100dvh] w-full max-w-full flex-col gap-0 overflow-hidden rounded-none border p-0 shadow-2xl backdrop-blur-xl sm:h-auto sm:max-h-[92vh] sm:max-w-4xl sm:rounded-3xl md:max-w-6xl xl:max-w-7xl"
      >
        <DialogTitle className="sr-only">{post.title}</DialogTitle>

        {/* Modal Body: Theater Photo Stage on Left, Author & Threaded Comments on Right */}
        <div className="flex flex-1 flex-col overflow-hidden md:grid md:h-[680px] md:grid-cols-12 md:overflow-hidden lg:h-[760px] xl:h-[800px]">
          {/* Photo Carousel Stage: 40-45vh on mobile, full height on desktop */}
          <div className="border-border/40 relative h-[42vh] shrink-0 overflow-hidden border-b bg-zinc-950 sm:h-[460px] md:col-span-7 md:h-full md:border-r md:border-b-0 lg:col-span-8">
            <PostCarousel photos={photos} title={post.title} />
          </div>

          {/* Right Column: Author, Metadata, Post Actions & Threaded Comments */}
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
  );
}
