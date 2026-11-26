"use client";

import React, { useState } from "react";
import { SortableImageUpload } from "@/components/form/sortable-image-upload";
import { CreateAlbumForm } from "@/components/studio/create-album-form";
import { VideoUploadSection } from "@/components/studio/video-upload-section";
import type { ImagePayload } from "@/components/form/types";
import { useTranslations } from "next-intl";
import { PostTypeSwitch } from "./post-type-switch";

export function StudioUploadView() {
  const t = useTranslations("Studio");
  const [postType, setPostType] = useState<"photoset" | "video">("photoset");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [customCoverFile, setCustomCoverFile] = useState<File | null>(null);
  const [imagesPayload, setImagesPayload] = useState<ImagePayload[]>([]);
  const [coverIndex, setCoverIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-6">
      <section className="bg-card space-y-4 rounded-xl border p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-foreground text-lg font-semibold">
              {postType === "photoset" ? t("photosLabel") : t("videoPostType")}
            </h2>
            {postType === "photoset" && (
              <p className="text-muted-foreground text-sm">
                {t("uploadLimitHint")}
              </p>
            )}
          </div>
          <PostTypeSwitch value={postType} onChange={setPostType} />
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
      </section>

      <div className="bg-card rounded-xl border p-4 sm:p-6">
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
