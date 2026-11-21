"use client";

import React, { useRef, useState, useEffect } from "react";
import { Video, Upload, X, Image as ImageIcon, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export interface VideoUploadSectionProps {
  videoFile: File | null;
  onVideoFileChange: (file: File | null) => void;
  customCoverFile: File | null;
  onCustomCoverFileChange: (file: File | null) => void;
}

const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024; // 100MB
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export function VideoUploadSection({
  videoFile,
  onVideoFileChange,
  customCoverFile,
  onCustomCoverFileChange,
}: VideoUploadSectionProps) {
  const t = useTranslations("Studio");
  const videoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setVideoPreviewUrl(null);
    }
  }, [videoFile]);

  useEffect(() => {
    if (customCoverFile) {
      const url = URL.createObjectURL(customCoverFile);
      setCoverPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setCoverPreviewUrl(null);
    }
  }, [customCoverFile]);

  const handleVideoSelect = (file: File) => {
    if (
      !ALLOWED_VIDEO_TYPES.includes(file.type) &&
      !file.name.match(/\.(mp4|webm|mov)$/i)
    ) {
      toast.error(t("videoLimitHint"));
      return;
    }
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      toast.error(t("videoMaxSizeBytes"));
      return;
    }
    onVideoFileChange(file);
  };

  const handleCoverSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(t("invalidCoverFile"));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("coverMaxSizeBytes"));
      return;
    }
    onCustomCoverFileChange(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleVideoSelect(file);
          e.target.value = "";
        }}
      />
      <input
        ref={coverInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleCoverSelect(file);
          e.target.value = "";
        }}
      />

      {!videoFile ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleVideoSelect(file);
          }}
          onClick={() => videoInputRef.current?.click()}
          className={`border-border/70 hover:border-primary/60 bg-muted/20 hover:bg-muted/30 flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
            isDragging ? "border-primary bg-primary/5" : ""
          }`}
        >
          <div className="bg-primary/10 text-primary mb-3 flex size-14 items-center justify-center rounded-full shadow-inner">
            <Film className="size-7" />
          </div>
          <h3 className="text-foreground text-sm font-bold sm:text-base">
            {t("videoDropzone")}
          </h3>
          <p className="text-muted-foreground mt-1 text-xs">
            {t("videoLimitHint")}
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mt-4 rounded-xl text-xs font-semibold"
          >
            <Upload className="mr-1.5 size-3.5" />
            {t("videoUploadLabel")}
          </Button>
        </div>
      ) : (
        <div className="border-border/60 bg-card/60 space-y-4 rounded-2xl border p-4 shadow-sm">
          {/* Video Preview */}
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
            {videoPreviewUrl && (
              <video
                src={videoPreviewUrl}
                controls
                playsInline
                preload="metadata"
                className="size-full object-contain"
              />
            )}
          </div>

          {/* Video Metadata & Actions */}
          <div className="border-border/50 flex flex-wrap items-center justify-between gap-2 border-b pb-3">
            <div className="max-w-[70%] min-w-0">
              <p className="text-foreground truncate text-xs font-bold sm:text-sm">
                {videoFile.name}
              </p>
              <p className="text-muted-foreground text-[11px]">
                {formatFileSize(videoFile.size)} • {videoFile.type || "Video"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => videoInputRef.current?.click()}
                className="h-8 rounded-lg text-xs"
              >
                {t("changeVideo")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  onVideoFileChange(null);
                  onCustomCoverFileChange(null);
                }}
                className="text-destructive hover:bg-destructive/10 h-8 rounded-lg px-2 text-xs"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* Custom Cover Thumbnail Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground text-xs font-semibold">
                  {t("customCoverLabel")}
                </p>
                <p className="text-muted-foreground text-[11px]">
                  {t("customCoverHint")}
                </p>
              </div>
              {!customCoverFile ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => coverInputRef.current?.click()}
                  className="h-7 rounded-lg text-[11px]"
                >
                  <ImageIcon className="mr-1 size-3" />
                  {t("uploadCustomCover")}
                </Button>
              ) : null}
            </div>

            {customCoverFile && coverPreviewUrl && (
              <div className="border-border/60 bg-muted/30 flex items-center gap-3 rounded-xl border p-2">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-black">
                  <img
                    src={coverPreviewUrl}
                    alt="Custom cover preview"
                    className="size-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-xs font-medium">
                    {customCoverFile.name}
                  </p>
                  <p className="text-muted-foreground text-[11px]">
                    {formatFileSize(customCoverFile.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onCustomCoverFileChange(null)}
                  className="text-destructive hover:bg-destructive/10 h-7 px-2 text-xs"
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
