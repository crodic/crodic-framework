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
import { Loader2, Pencil } from "lucide-react";
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
      <DialogContent className="border-border/80 bg-card/95 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl p-5 shadow-2xl backdrop-blur-md sm:p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-xl">
              <Pencil className="size-4" />
            </div>
            <DialogTitle className="text-base font-bold sm:text-lg">
              {tFeed("editPost")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-xs">
            {tFeed("editPostDesc")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Tiêu đề */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("titleLabel")}</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("titlePlaceholder")}
              className="border-border/70 bg-background/50 h-9.5 rounded-xl text-xs sm:text-sm"
              required
            />
          </div>

          {/* Lời ngỏ / Caption */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("descLabel")}</Label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={t("descPlaceholder")}
              className="border-border/70 bg-background/50 min-h-[80px] rounded-xl text-xs sm:text-sm"
              rows={3}
            />
          </div>

          {/* Nhân vật & Series */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("characterLabel")}
              </Label>
              <Input
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder={t("characterPlaceholder")}
                className="border-border/70 bg-background/50 h-9.5 rounded-xl text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("seriesLabel")}
              </Label>
              <Input
                value={fandomName}
                onChange={(e) => setFandomName(e.target.value)}
                placeholder={t("seriesPlaceholder")}
                className="border-border/70 bg-background/50 h-9.5 rounded-xl text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Danh mục Album */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t("categoryLabel")}
            </Label>
            <Select value={albumCategory} onValueChange={setAlbumCategory}>
              <SelectTrigger className="border-border/70 bg-background/50 h-9.5 rounded-xl text-xs sm:text-sm">
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
            <Label className="text-xs font-semibold">{t("tagCharacter")}</Label>
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
                <Label className="text-xs font-semibold">
                  {t("publicAlbum")}
                </Label>
                <p className="text-muted-foreground text-[11px]">
                  {t("publicAlbumDesc")}
                </p>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>

            <div className="border-border/40 flex items-center justify-between border-t pt-2.5">
              <div>
                <Label className="text-xs font-semibold">
                  {t("watermark")}
                </Label>
                <p className="text-muted-foreground text-[11px]">
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
