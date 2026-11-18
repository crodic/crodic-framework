"use client";

import React, { useState } from "react";
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
import { useAuthStore } from "@/store/use-auth-store";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export interface CreateAlbumModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function CreateAlbumModal({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
}: CreateAlbumModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isMobile = useIsMobile();
  const router = useRouter();
  const t = useTranslations("Studio");
  const tCommon = useTranslations("Common");
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isControlled = typeof controlledOpen === "boolean";
  const isOpen = isControlled ? controlledOpen : internalOpen;

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

  const [imagesPayload, setImagesPayload] = useState<ImagePayload[]>([]);
  const [coverIndex, setCoverIndex] = useState<number | null>(0);

  // Common content for both dialog and drawer
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
        isMobile ? "grid-cols-4 gap-2" : "grid-cols-3 gap-2.5 sm:gap-3"
      }
      className="max-none w-full"
    />
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
        <DrawerContent className="bg-background border-border flex max-h-[92vh] flex-col p-0">
          <DrawerHeader className="border-border/60 flex flex-row items-center justify-between border-b px-4 py-3">
            <div>
              <DrawerTitle className="text-foreground text-left text-base font-bold">
                {t("createAlbumTitle")}
              </DrawerTitle>
              <p className="text-muted-foreground text-left text-xs">
                {t("createAlbumDesc")}
              </p>
            </div>
            <DrawerClose asChild>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground cursor-pointer rounded-full p-1"
                aria-label={tCommon("close")}
              >
                <X className="size-5" />
              </button>
            </DrawerClose>
          </DrawerHeader>

          <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
            {/* Upload Area */}
            <div>{sortableUploadSection}</div>

            {/* Form Fields */}
            <div className="border-border/60 border-t pt-4">
              <CreateAlbumForm
                isMobile={true}
                imagesPayload={imagesPayload}
                coverIndex={coverIndex}
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
        className="bg-card border-border/80 w-[94vw] max-w-4xl gap-0 overflow-hidden rounded-2xl p-0 shadow-2xl sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{t("createAlbumTitle")}</DialogTitle>
        </DialogHeader>

        <div className="flex max-h-[88vh] flex-col overflow-hidden md:flex-row">
          {/* Left Column: Image grid (58%) */}
          <div className="border-border/60 flex flex-1 flex-col overflow-y-auto border-r p-6 md:w-[58%]">
            {sortableUploadSection}
          </div>

          {/* Right Column: Studio Upload Form (42%) */}
          <div className="bg-card/60 flex flex-col justify-between overflow-y-auto p-6 md:w-[42%]">
            <div>
              <div className="border-border/60 mb-5 flex items-center justify-between border-b pb-3.5">
                <div>
                  <h2 className="text-foreground text-base font-bold sm:text-lg">
                    {t("createAlbumTitle")}
                  </h2>
                  <p className="text-muted-foreground text-xs">
                    {t("createAlbumDesc")}
                  </p>
                </div>
                <DialogClose asChild>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground cursor-pointer rounded-full p-1 transition-colors"
                    aria-label={tCommon("close")}
                  >
                    <X className="size-5" />
                  </button>
                </DialogClose>
              </div>

              <CreateAlbumForm
                imagesPayload={imagesPayload}
                coverIndex={coverIndex}
                onSuccess={() => setIsOpen(false)}
                onCancel={() => setIsOpen(false)}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default CreateAlbumModal;
