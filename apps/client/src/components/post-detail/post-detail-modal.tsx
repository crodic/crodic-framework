"use client";

import React, { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { X } from "lucide-react";
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
        className="border-primary/30 bg-card/95 shadow-primary/10 flex max-h-[94vh] max-w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden rounded-2xl border p-0 shadow-2xl backdrop-blur-xl sm:max-w-3xl sm:rounded-3xl md:max-w-5xl lg:max-w-6xl"
      >
        <DialogTitle className="sr-only">{post.title}</DialogTitle>

        {/* Floating Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground border-border/70 absolute top-4 right-4 z-50 flex size-8 cursor-pointer items-center justify-center rounded-full border shadow-xs transition-all"
          aria-label="Đóng"
        >
          <X className="size-4" />
        </button>

        {/* Modal Body: 2 Columns on Desktop, Stacked on Mobile */}
        <div className="grid min-h-[500px] flex-1 grid-cols-1 overflow-y-auto md:h-[620px] md:grid-cols-12 md:overflow-hidden lg:h-[680px]">
          {/* Left Column: Photo Carousel */}
          <div className="border-border/40 flex h-full flex-col justify-between border-b bg-black/40 p-3.5 sm:p-5 md:col-span-7 md:border-r md:border-b-0 lg:col-span-8">
            <PostCarousel photos={photos} title={post.title} />
          </div>

          {/* Right Column: Author, Caption, Tags & Comments */}
          <div className="bg-card/40 flex min-h-[380px] flex-col justify-between p-4 sm:p-5 md:col-span-5 md:min-h-0 lg:col-span-4">
            <PostInfo post={post} comments={comments} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
