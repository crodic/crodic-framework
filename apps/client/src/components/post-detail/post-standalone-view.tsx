"use client";

import React from "react";
import { useRouter } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostDetail } from "./post-types";
import { PostCarousel } from "./post-carousel";
import { PostInfo } from "./post-info";

interface PostStandaloneViewProps {
  post: PostDetail;
}

export function PostStandaloneView({ post }: PostStandaloneViewProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-4 p-3.5 sm:p-6 lg:p-8">
      {/* Back button: quay lại trang trước đó trong lịch sử */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={handleBack}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground cursor-pointer gap-1.5 rounded-xl font-medium"
        >
          <ArrowLeft className="size-4" />
          <span>Quay lại</span>
        </Button>
      </div>

      {/* Main Container Card */}
      <div className="border-border/70 bg-card/60 grid min-h-[550px] grid-cols-1 overflow-hidden rounded-2xl border shadow-xl sm:rounded-3xl md:h-[680px] md:grid-cols-12">
        {/* Left Column: Photo Carousel */}
        <div className="border-border/50 flex h-full flex-col justify-between border-b bg-black/40 p-3.5 sm:p-6 md:col-span-7 md:border-r md:border-b-0 lg:col-span-8">
          <PostCarousel photos={post.photos} title={post.title} />
        </div>

        {/* Right Column: Post Info & Comments */}
        <div className="bg-card/40 flex flex-col justify-between p-4 sm:p-6 md:col-span-5 lg:col-span-4">
          <PostInfo post={post} />
        </div>
      </div>
    </div>
  );
}
