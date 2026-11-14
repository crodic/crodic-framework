"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ImageIcon, Tag, Video, Send } from "lucide-react";
import { CURRENT_USER } from "./feed-data";
import { CreateAlbumModal } from "@/components/studio/create-album-modal";
import { useAuthStore } from "@/store/use-auth-store";
import { useProfile } from "@/hooks/use-profile";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";

export function CreatePostCard() {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: profile } = useProfile();

  const displayName =
    profile?.fullName || profile?.firstName || CURRENT_USER.name;
  const avatarUrl = profile?.avatar || CURRENT_USER.avatarUrl;

  const handleAction = () => {
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để tạo bài viết hoặc đăng tải tác phẩm!");
      router.push("/auth/login?from=/feed");
      return;
    }
    setModalOpen(true);
  };

  return (
    <div className="border-border/70 bg-card/70 hover:border-border rounded-2xl border p-4 shadow-xs backdrop-blur-xs transition-colors">
      <div className="flex items-center gap-3">
        {/* User Avatar */}
        <div className="border-primary/30 relative size-10 shrink-0 overflow-hidden rounded-full border">
          <Image
            src={avatarUrl}
            alt={displayName}
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>

        {/* Fake input trigger */}
        <button
          type="button"
          onClick={handleAction}
          className="text-muted-foreground bg-muted/40 hover:bg-muted/70 hover:text-foreground flex h-10 flex-1 cursor-pointer items-center rounded-xl px-4 text-left text-xs transition-colors sm:text-sm"
        >
          <span>
            {isAuthenticated
              ? `${displayName} ơi, hôm nay bạn có ảnh cosplay mới gì không?`
              : "Bạn có tác phẩm cosplay mới? Đăng nhập ngay để chia sẻ cùng cộng đồng..."}
          </span>
        </button>
      </div>

      {/* Action buttons row */}
      <div className="border-border/50 mt-3 flex items-center justify-between border-t pt-2.5">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={handleAction}
            className="text-muted-foreground hover:text-primary hover:bg-primary/10 flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors"
          >
            <ImageIcon className="size-4 shrink-0 text-purple-400" />
            <span className="hidden sm:inline">Ảnh / Album</span>
          </button>

          <button
            type="button"
            onClick={handleAction}
            className="text-muted-foreground hover:text-primary hover:bg-primary/10 flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors"
          >
            <Video className="size-4 shrink-0 text-pink-400" />
            <span className="hidden sm:inline">Video / Reel</span>
          </button>

          <button
            type="button"
            onClick={handleAction}
            className="text-muted-foreground hover:text-primary hover:bg-primary/10 flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors"
          >
            <Tag className="size-4 shrink-0 text-indigo-400" />
            <span className="hidden sm:inline">Gắn thẻ</span>
          </button>
        </div>

        {/* Post Button */}
        <Button
          size="sm"
          onClick={handleAction}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 h-8.5 cursor-pointer rounded-xl px-5 text-xs font-semibold shadow-xs transition-all hover:scale-[1.02]"
        >
          <Send className="mr-1 size-3.5" />
          Đăng
        </Button>
      </div>

      {/* Create Album Modal dialog/drawer */}
      <CreateAlbumModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
