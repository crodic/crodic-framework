"use client";

import React, { useState } from "react";
import { SortableImageUpload } from "@/components/form/sortable-image-upload";
import { CreateAlbumForm } from "@/components/studio/create-album-form";
import { VideoUploadSection } from "@/components/studio/video-upload-section";
import type { ImagePayload } from "@/components/form/types";
import { useTranslations } from "next-intl";
import { Images, Film } from "lucide-react";
import { cn } from "@/lib/utils";

export function StudioUploadView() {
  const t = useTranslations("Studio");
  const [postType, setPostType] = useState<"photoset" | "video">("photoset");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [customCoverFile, setCustomCoverFile] = useState<File | null>(null);
  const [imagesPayload, setImagesPayload] = useState<ImagePayload[]>([]);
  const [coverIndex, setCoverIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. TOP SECTION: Media Upload Stage (Full Width) */}
      <div className="bg-card border-border/80 flex flex-col rounded-2xl border p-4 shadow-xl sm:p-6">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-foreground flex items-center gap-2 text-base font-bold sm:text-lg">
              <Images className="size-5 text-purple-400" />
              <span>{t("photosLabel")}</span>
            </h2>
            <p className="text-muted-foreground text-xs">
              {t("uploadLimitHint")}
            </p>
          </div>

          {/* Post Type Selector */}
          <div className="border-border/60 bg-muted/40 flex items-center gap-1.5 rounded-xl border p-1 sm:w-64">
            <button
              type="button"
              onClick={() => setPostType("photoset")}
              className={cn(
                "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all",
                postType === "photoset"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Images className="size-3.5 text-purple-400" />
              <span>{t("photoPostType")}</span>
            </button>
            <button
              type="button"
              onClick={() => setPostType("video")}
              className={cn(
                "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all",
                postType === "video"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Film className="size-3.5 text-pink-400" />
              <span>{t("videoPostType")}</span>
            </button>
          </div>
        </div>

        {postType === "photoset" ? (
          <SortableImageUpload
            variant="studio"
            showInlineAddSlot={true}
            existingImages={[]}
            value={imagesPayload}
            onChange={setImagesPayload}
            coverIndex={coverIndex}
            onCoverIndexChange={setCoverIndex}
            maxFiles={20}
            gridClassName="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
          />
        ) : (
          <VideoUploadSection
            videoFile={videoFile}
            onVideoFileChange={setVideoFile}
            customCoverFile={customCoverFile}
            onCustomCoverFileChange={setCustomCoverFile}
          />
        )}
      </div>

      {/* 2. BOTTOM SECTION: Studio Form Details (Full Width) */}
      <div className="bg-card border-border/80 rounded-2xl border p-4 shadow-xl sm:p-6">
        <div className="border-border/60 mb-5 border-b pb-3">
          <h2 className="text-foreground text-base font-bold sm:text-lg">
            {t("titleLabel")}
          </h2>
          <p className="text-muted-foreground text-xs">
            {t("descPlaceholder")}
          </p>
        </div>

        <CreateAlbumForm
          imagesPayload={imagesPayload}
          coverIndex={coverIndex}
          postType={postType}
          videoFile={videoFile}
          customCoverFile={customCoverFile}
        />
      </div>
    </div>
  );
}
