"use client";

import React, { useRef, useState, useEffect } from "react";
import { Upload, X, Image as ImageIcon, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

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
  const tFiles = useTranslations("FileUpload");
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
        <button
          type="button"
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
          className={cn(
            "border-border hover:border-primary/60 hover:bg-muted/50 focus-visible:ring-ring flex min-h-52 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-4 text-center transition-colors focus-visible:ring-2 sm:p-6",
            isDragging && "border-primary bg-primary/5"
          )}
        >
          <Film aria-hidden="true" className="text-muted-foreground size-6" />
          <span className="text-foreground text-sm font-medium">
            {t("videoDropzone")}
          </span>
          <span className="text-muted-foreground text-sm">
            {t("videoLimitHint")}
          </span>
          <span className="text-primary mt-1 inline-flex items-center gap-2 text-sm font-medium">
            <Upload aria-hidden="true" className="size-4" />
            {t("videoUploadLabel")}
          </span>
        </button>
      ) : (
        <div className="space-y-4">
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
          <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b pb-4">
            <div className="max-w-[70%] min-w-0">
              <p className="text-foreground truncate text-sm font-semibold">
                {videoFile.name}
              </p>
              <p className="text-muted-foreground text-xs">
                {formatFileSize(videoFile.size)} • {videoFile.type || "Video"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => videoInputRef.current?.click()}
                className="h-9"
              >
                {t("changeVideo")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  onVideoFileChange(null);
                  onCustomCoverFileChange(null);
                }}
                className="text-destructive hover:bg-destructive/10 size-9"
                aria-label={tFiles("removeFile")}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* Custom Cover Thumbnail Section */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-foreground text-sm font-semibold">
                  {t("customCoverLabel")}
                </p>
                <p className="text-muted-foreground text-xs">
                  {t("customCoverHint")}
                </p>
              </div>
              {!customCoverFile ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => coverInputRef.current?.click()}
                  className="h-9"
                >
                  <ImageIcon className="size-4" />
                  {t("uploadCustomCover")}
                </Button>
              ) : null}
            </div>

            {customCoverFile && coverPreviewUrl && (
              <div className="bg-muted/40 flex items-center gap-3 rounded-xl p-2">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-black">
                  <img
                    src={coverPreviewUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-xs font-medium">
                    {customCoverFile.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatFileSize(customCoverFile.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onCustomCoverFileChange(null)}
                  className="text-destructive hover:bg-destructive/10 size-9"
                  aria-label={t("removeCustomCover")}
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
