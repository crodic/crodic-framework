"use client";

import React, { useState } from "react";
import { SortableImageUpload } from "@/components/form/sortable-image-upload";
import { CreateAlbumForm } from "@/components/studio/create-album-form";
import type { ImagePayload } from "@/components/form/types";
import { useTranslations } from "next-intl";

export function StudioUploadView() {
  const t = useTranslations("Studio");
  const [imagesPayload, setImagesPayload] = useState<ImagePayload[]>([]);
  const [coverIndex, setCoverIndex] = useState<number | null>(0);

  return (
    <div className="bg-card border-border/80 flex flex-col overflow-hidden rounded-2xl border shadow-xl md:flex-row">
      {/* Left Column: Sortable Image Grid */}
      <div className="border-border/60 flex flex-1 flex-col border-r p-6 md:w-[58%]">
        <SortableImageUpload
          variant="studio"
          showInlineAddSlot={true}
          existingImages={[]}
          value={imagesPayload}
          onChange={setImagesPayload}
          coverIndex={coverIndex}
          onCoverIndexChange={setCoverIndex}
          maxFiles={20}
          gridClassName="grid-cols-2 sm:grid-cols-3 gap-3"
        />
      </div>

      {/* Right Column: Studio Form */}
      <div className="bg-card/60 p-6 md:w-[42%]">
        <div className="border-border/60 mb-5 border-b pb-3">
          <h2 className="text-foreground text-base font-bold">
            {t("titleLabel")}
          </h2>
          <p className="text-muted-foreground text-xs">
            {t("descPlaceholder")}
          </p>
        </div>

        <CreateAlbumForm
          imagesPayload={imagesPayload}
          coverIndex={coverIndex}
        />
      </div>
    </div>
  );
}
