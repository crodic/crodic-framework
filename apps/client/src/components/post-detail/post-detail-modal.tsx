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
        className="border-primary/25 bg-card/95 shadow-primary/10 flex max-h-[94vh] max-w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden rounded-2xl border p-0 shadow-2xl backdrop-blur-xl sm:max-w-4xl sm:rounded-3xl md:max-w-6xl xl:max-w-7xl"
      >
        <DialogTitle className="sr-only">{post.title}</DialogTitle>

        {/* Modal Body: Edge-to-Edge 2 Columns on Desktop, Stacked on Mobile */}
        <div className="grid min-h-[500px] flex-1 grid-cols-1 overflow-y-auto md:h-[680px] md:grid-cols-12 md:overflow-hidden lg:h-[760px]">
          {/* Left Column: Edge-to-Edge Theater Photo Carousel */}
          <div className="border-border/40 relative h-[380px] overflow-hidden border-b bg-zinc-950 p-0 sm:h-[480px] md:col-span-7 md:h-full md:border-r md:border-b-0 lg:col-span-8">
            <PostCarousel photos={photos} title={post.title} />
          </div>

          {/* Right Column: Author, Info, Tags, Comments & Sticky Actions */}
          <div className="bg-card/50 flex min-h-[380px] flex-col overflow-hidden p-0 md:col-span-5 md:h-full md:min-h-0 lg:col-span-4">
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
