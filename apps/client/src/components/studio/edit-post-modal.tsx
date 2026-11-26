"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updatePost,
  type PostDetailResDto,
  type PostSummaryResDto,
  type UpdatePostPayload,
} from "@/services/posts";
import { TagPicker } from "./tag-picker";
import { CharacterAutocomplete } from "./character-autocomplete";
import { SeriesAutocomplete } from "./series-autocomplete";

export interface EditPostModalProps {
  post: PostDetailResDto | PostSummaryResDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (updated: PostDetailResDto) => void;
}

export function EditPostModal({
  post,
  open,
  onOpenChange,
  onSuccess,
}: EditPostModalProps) {
  const t = useTranslations("Studio");
  const tFeed = useTranslations("Feed");
  const queryClient = useQueryClient();

  const [title, setTitle] = useState(post.title || "");
  const [caption, setCaption] = useState(post.caption || "");
  const [characterName, setCharacterName] = useState(post.characterName || "");
  const [fandomName, setFandomName] = useState(post.fandomName || "");
  const [tags, setTags] = useState<string[]>(
    post.tagNamesCache || (post as any).tags || []
  );
  const [albumCategory, setAlbumCategory] = useState<string>(
    post.albumCategory || "series"
  );
  const [isPublic, setIsPublic] = useState(post.isPublic ?? true);
  const [enableWatermark, setEnableWatermark] = useState(
    (post as any).enableWatermark ?? false
  );

  useEffect(() => {
    if (open) {
      setTitle(post.title || "");
      setCaption(post.caption || "");
      setCharacterName(post.characterName || "");
      setFandomName(post.fandomName || "");
      setTags(post.tagNamesCache || (post as any).tags || []);
      setAlbumCategory(post.albumCategory || "series");
      setIsPublic(post.isPublic ?? true);
      setEnableWatermark((post as any).enableWatermark ?? false);
    }
  }, [open, post]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim()) {
        throw new Error(t("valTitle"));
      }

      const payload: UpdatePostPayload = {
        title: title.trim(),
        caption: caption.trim() || undefined,
        characterName: characterName.trim() || undefined,
        fandomName: fandomName.trim() || undefined,
        tags,
        albumCategory: albumCategory as any,
        isPublic,
        enableWatermark,
      };

      return await updatePost(post.id, payload);
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({
        queryKey: ["post-detail", post.slug || post.id],
      });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["following-feed-posts"] });
      queryClient.invalidateQueries({ queryKey: ["explore-posts"] });
      queryClient.invalidateQueries({ queryKey: ["my-cosplayer-profile"] });

      toast.success(tFeed("updatePostSuccess"));
      onSuccess?.(updated);
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Error updating post");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl p-4 sm:max-w-lg sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {tFeed("editPost")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {tFeed("editPostDesc")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Tiêu đề */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">{t("titleLabel")}</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("titlePlaceholder")}
              className="h-10"
              required
            />
          </div>

          {/* Lời ngỏ / Caption */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">{t("descLabel")}</Label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={t("descPlaceholder")}
              className="min-h-20"
              rows={3}
            />
          </div>

          {/* Nhân vật & Series */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                {t("characterLabel")}
              </Label>
              <CharacterAutocomplete
                value={characterName}
                onChange={setCharacterName}
                onSelectCharacter={({ characterName: cName, seriesName }) => {
                  setCharacterName(cName);
                  if (seriesName && !fandomName) {
                    setFandomName(seriesName);
                  }
                }}
                placeholder={t("characterPlaceholder")}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{t("seriesLabel")}</Label>
              <SeriesAutocomplete
                value={fandomName}
                onChange={setFandomName}
                placeholder={t("seriesPlaceholder")}
              />
            </div>
          </div>

          {/* Danh mục Album */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">{t("categoryLabel")}</Label>
            <Select value={albumCategory} onValueChange={setAlbumCategory}>
              <SelectTrigger className="w-full data-[size=default]:h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="series">{t("categories.series")}</SelectItem>
                <SelectItem value="general">Album General</SelectItem>
                <SelectItem value="group">Group & Doujin</SelectItem>
                <SelectItem value="premium">Premium Studio</SelectItem>
                <SelectItem value="event">{t("categories.event")}</SelectItem>
                <SelectItem value="original">
                  {t("categories.original")}
                </SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tag Picker */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">{t("tagCharacter")}</Label>
            <TagPicker
              value={tags}
              onChange={setTags}
              characterHint={characterName}
              fandomHint={fandomName}
            />
          </div>

          {/* Visibility and Watermark toggles */}
          <div className="border-border/60 space-y-3 rounded-xl border p-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">
                  {t("publicAlbum")}
                </Label>
                <p className="text-muted-foreground text-sm">
                  {t("publicAlbumDesc")}
                </p>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>

            <div className="border-border/40 flex items-center justify-between border-t pt-2.5">
              <div>
                <Label className="text-sm font-medium">{t("watermark")}</Label>
                <p className="text-muted-foreground text-sm">
                  {t("watermarkDesc")}
                </p>
              </div>
              <Switch
                checked={enableWatermark}
                onCheckedChange={setEnableWatermark}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
              className="rounded-xl text-xs"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-primary text-primary-foreground rounded-xl text-xs font-semibold"
            >
              {updateMutation.isPending && (
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              )}
              {t("submitBtn")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
