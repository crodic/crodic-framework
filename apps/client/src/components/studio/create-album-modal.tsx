"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import SortableImageUpload from "@/components/form/sortable-image-upload";
import type { ImagePayload } from "@/components/form/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { X } from "lucide-react";
import { CreateAlbumForm } from "./create-album-form";
import { VideoUploadSection } from "./video-upload-section";
import { useAuthStore } from "@/store/use-auth-store";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PostTypeSwitch } from "./post-type-switch";

export interface CreateAlbumModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  initialPostType?: "photoset" | "video";
}

export function CreateAlbumModal({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
  initialPostType = "photoset",
}: CreateAlbumModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [postType, setPostType] = useState<"photoset" | "video">(
    initialPostType
  );
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [customCoverFile, setCustomCoverFile] = useState<File | null>(null);
  const [imagesPayload, setImagesPayload] = useState<ImagePayload[]>([]);
  const [coverIndex, setCoverIndex] = useState<number | null>(0);

  const isMobile = useIsMobile();
  const router = useRouter();
  const t = useTranslations("Studio");
  const tCommon = useTranslations("Common");
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isControlled = typeof controlledOpen === "boolean";
  const isOpen = isControlled ? controlledOpen : internalOpen;

  useEffect(() => {
    if (isOpen && initialPostType) {
      setPostType(initialPostType);
    }
  }, [isOpen, initialPostType]);

  const handleOpenChange = (val: boolean) => {
    if (val && !isAuthenticated) {
      toast.info(t("loginRequired"));
      router.push("/auth/login?from=/upload");
      return;
    }
    if (isControlled) {
      controlledOnOpenChange?.(val);
    } else {
      setInternalOpen(val);
    }
  };

  const setIsOpen = handleOpenChange;

  // Common content for image upload
  const sortableUploadSection = (
    <SortableImageUpload
      variant="studio"
      showInlineAddSlot={true}
      existingImages={[]}
      value={imagesPayload}
      onChange={setImagesPayload}
      coverIndex={coverIndex}
      onCoverIndexChange={setCoverIndex}
      maxFiles={20}
      gridClassName={
        isMobile
          ? "grid-cols-3 gap-2"
          : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
      }
      className="w-full max-w-none"
    />
  );

  const mediaSection = (
    <div className="space-y-4">
      <PostTypeSwitch value={postType} onChange={setPostType} />
      {postType === "photoset" ? (
        sortableUploadSection
      ) : (
        <VideoUploadSection
          videoFile={videoFile}
          onVideoFileChange={setVideoFile}
          customCoverFile={customCoverFile}
          onCustomCoverFileChange={setCustomCoverFile}
        />
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
        <DrawerContent className="bg-background border-border flex max-h-[92dvh] flex-col p-0">
          <DrawerHeader className="border-border flex flex-row items-start justify-between gap-3 border-b px-4 py-3">
            <div>
              <DrawerTitle className="text-foreground text-start text-lg font-semibold">
                {t("createAlbumTitle")}
              </DrawerTitle>
              <p className="text-muted-foreground text-start text-sm">
                {t("createAlbumDesc")}
              </p>
            </div>
            <DrawerClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-10"
                aria-label={tCommon("close")}
              >
                <X className="size-5" />
              </Button>
            </DrawerClose>
          </DrawerHeader>

          <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
            {/* Upload Area */}
            <div>{mediaSection}</div>

            {/* Form Fields */}
            <div className="border-border/60 border-t pt-4">
              <CreateAlbumForm
                isMobile={true}
                imagesPayload={imagesPayload}
                coverIndex={coverIndex}
                postType={postType}
                videoFile={videoFile}
                customCoverFile={customCoverFile}
                onSuccess={() => setIsOpen(false)}
                onCancel={() => setIsOpen(false)}
              />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        showCloseButton={false}
        className="bg-background flex max-h-[90dvh] max-w-4xl flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-4xl"
      >
        <DialogHeader className="border-border flex flex-row items-start justify-between gap-3 border-b px-6 py-4">
          <div>
            <DialogTitle className="text-foreground text-start text-lg font-semibold">
              {t("createAlbumTitle")}
            </DialogTitle>
            <p className="text-muted-foreground text-start text-sm">
              {t("createAlbumDesc")}
            </p>
          </div>
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-10"
              aria-label={tCommon("close")}
            >
              <X className="size-5" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {/* Top Section: Upload Media */}
          <div className="pb-2">{mediaSection}</div>

          {/* Bottom Section: Form Details */}
          <div className="border-border border-t pt-6">
            <CreateAlbumForm
              imagesPayload={imagesPayload}
              coverIndex={coverIndex}
              postType={postType}
              videoFile={videoFile}
              customCoverFile={customCoverFile}
              onSuccess={() => setIsOpen(false)}
              onCancel={() => setIsOpen(false)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default CreateAlbumModal;
