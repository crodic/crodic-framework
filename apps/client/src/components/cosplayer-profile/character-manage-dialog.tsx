"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Upload, ImageIcon, Loader2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  addMyCharacter,
  updateMyCharacter,
  uploadMyMedia,
  type CosplayerCharacterResDto,
} from "@/services/cosplayer";
import { CharacterAutocomplete } from "@/components/studio/character-autocomplete";
import { SeriesAutocomplete } from "@/components/studio/series-autocomplete";

interface CharacterManageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character?: CosplayerCharacterResDto | null;
  onSuccess: () => void;
}

export function CharacterManageDialog({
  open,
  onOpenChange,
  character,
  onSuccess,
}: CharacterManageDialogProps) {
  const t = useTranslations("Profile");
  const isEdit = Boolean(character);

  const [characterName, setCharacterName] = useState("");
  const [seriesName, setSeriesName] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (character) {
      setCharacterName(character.characterName || "");
      setSeriesName(character.seriesName || "");
      setCoverImageUrl(character.coverImageUrl || "");
    } else {
      setCharacterName("");
      setSeriesName("");
      setCoverImageUrl("");
    }
  }, [character, open]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await uploadMyMedia(file, "covers");
      setCoverImageUrl(res.url);
      toast.success(t("characterCoverUploaded") || "Cover image uploaded");
    } catch {
      toast.error(t("coverUploadError") || "Failed to upload cover image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedChar = characterName.trim();
    const trimmedSeries = seriesName.trim();

    if (!trimmedChar) {
      toast.error(t("characterNameRequired") || "Character name is required");
      return;
    }

    if (!trimmedSeries) {
      toast.error(t("seriesNameRequired") || "Series name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEdit && character) {
        await updateMyCharacter(character.id, {
          characterName: trimmedChar,
          seriesName: trimmedSeries,
          coverImageUrl: coverImageUrl || undefined,
        });
        toast.success(
          t("characterUpdated") || "Character updated successfully"
        );
      } else {
        await addMyCharacter({
          characterName: trimmedChar,
          seriesName: trimmedSeries,
          coverImageUrl: coverImageUrl || undefined,
        });
        toast.success(t("characterCreated") || "Character added successfully");
      }
      onSuccess();
      onOpenChange(false);
    } catch {
      toast.error(
        isEdit
          ? t("characterUpdateError") || "Failed to update character"
          : t("characterCreateError") || "Failed to add character"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Sparkles className="text-primary size-4.5" />
            {isEdit
              ? t("editCharacter") || "Chỉnh sửa nhân vật"
              : t("addCharacter") || "Thêm nhân vật mới"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {t("characterModalDesc") ||
              "Quản lý thông tin và chọn ảnh bìa đại diện đẹp nhất cho nhân vật trong hồ sơ của bạn."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Character Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold sm:text-sm">
              {t("characterName") || "Tên nhân vật"}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <CharacterAutocomplete
              value={characterName}
              onChange={setCharacterName}
              onSelectCharacter={(item) => {
                setCharacterName(item.characterName);
                if (item.seriesName && !seriesName) {
                  setSeriesName(item.seriesName);
                }
              }}
              placeholder="VD: Kafka, Acheron, Raiden Shogun..."
            />
          </div>

          {/* Series / Franchise */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold sm:text-sm">
              {t("seriesName") || "Series / Franchise"}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <SeriesAutocomplete
              value={seriesName}
              onChange={setSeriesName}
              placeholder="VD: Honkai: Star Rail, Genshin Impact..."
            />
          </div>

          {/* Cover Photo */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold sm:text-sm">
              {t("characterCover") || "Ảnh bìa nhân vật"}
            </Label>

            <div className="flex items-start gap-4 pt-1">
              {/* Image Preview */}
              <div className="border-border/60 bg-muted/40 relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-xl border">
                {coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverImageUrl}
                    alt={characterName || "Cover"}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="text-muted-foreground flex size-full flex-col items-center justify-center gap-1 p-2 text-center">
                    <ImageIcon className="size-6 opacity-50" />
                    <span className="text-[10px] leading-tight">
                      Chưa có ảnh
                    </span>
                  </div>
                )}

                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs">
                    <Loader2 className="text-primary size-5 animate-spin" />
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full gap-2 text-xs"
                >
                  <Upload className="size-3.5" />
                  {coverImageUrl
                    ? t("changeCover") || "Đổi ảnh bìa khác"
                    : t("uploadCover") || "Tải ảnh từ thiết bị"}
                </Button>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  {t("characterCoverHint") ||
                    "Khuyên dùng ảnh tỷ lệ dọc (3:4) để hiển thị đẹp nhất trên hồ sơ của bạn."}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("cancel") || "Hủy"}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || isUploading}
              className="gap-2"
            >
              {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
              {isEdit
                ? t("save") || "Lưu thay đổi"
                : t("create") || "Thêm nhân vật"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
