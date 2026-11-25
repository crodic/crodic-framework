"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ImageIcon, Tag, Video, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreateAlbumModal } from "@/components/studio/create-album-modal";
import { useAuthStore } from "@/store/use-auth-store";
import { useProfile } from "@/hooks/use-profile";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function CreatePostCard() {
  const t = useTranslations("Feed");
  const [modalOpen, setModalOpen] = useState(false);
  const [postType, setPostType] = useState<"photoset" | "video">("photoset");
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: profile } = useProfile();

  const displayName = profile?.fullName || profile?.firstName || "Creator";
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleAction = (type: "photoset" | "video" = "photoset") => {
    if (!isAuthenticated) {
      toast.info(t("createPlaceholder"));
      router.push("/auth/login?from=/feed");
      return;
    }
    setPostType(type);
    setModalOpen(true);
  };

  return (
    <div className="border-border/70 bg-card/70 hover:border-border rounded-2xl border p-4 shadow-xs backdrop-blur-xs transition-colors">
      <div className="flex items-center gap-3">
        {/* User Avatar */}
        <Avatar className="border-primary/30 size-10 shrink-0 border">
          <AvatarImage src={profile?.avatar || ""} alt={displayName} />
          <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Fake input trigger */}
        <button
          type="button"
          onClick={() => handleAction("photoset")}
          className="text-muted-foreground bg-muted/40 hover:bg-muted/70 hover:text-foreground flex h-10 flex-1 cursor-pointer items-center rounded-xl px-4 text-left text-xs transition-colors sm:text-sm"
        >
          <span>
            {isAuthenticated
              ? t("createPlaceholderAuth", { name: displayName })
              : t("createPlaceholder")}
          </span>
        </button>
      </div>

      {/* Action buttons row */}
      <div className="border-border/50 mt-3 flex items-center justify-between border-t pt-2.5">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => handleAction("photoset")}
            className="text-muted-foreground hover:text-primary hover:bg-primary/10 flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors"
          >
            <ImageIcon className="text-primary size-4 shrink-0" />
            <span className="hidden sm:inline">{t("photoAlbum")}</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction("video")}
            className="text-muted-foreground hover:text-primary hover:bg-primary/10 flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors"
          >
            <Video className="size-4 shrink-0 text-rose-500" />
            <span className="hidden sm:inline">{t("videoReel")}</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction("photoset")}
            className="text-muted-foreground hover:text-primary hover:bg-primary/10 flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors"
          >
            <Tag className="size-4 shrink-0 text-amber-500" />
            <span className="hidden sm:inline">{t("tagCosplayer")}</span>
          </button>
        </div>

        {/* Post Button */}
        <Button
          size="sm"
          onClick={() => handleAction("photoset")}
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-8.5 cursor-pointer rounded-xl px-5 text-xs font-semibold shadow-xs transition-colors"
        >
          <Send className="mr-1 size-3.5" />
          {t("postBtn")}
        </Button>
      </div>

      {/* Create Album Modal dialog/drawer */}
      <CreateAlbumModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialPostType={postType}
      />
    </div>
  );
}
