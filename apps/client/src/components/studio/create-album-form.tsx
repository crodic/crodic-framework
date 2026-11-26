"use client";

import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, X, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createPost } from "@/services/posts";
import { uploadMyMedia } from "@/services/cosplayer";
import { useLocale, useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/i18n/navigation";
import type { ImagePayload } from "@/components/form/types";
import { TagPicker } from "./tag-picker";
import { CharacterAutocomplete } from "./character-autocomplete";
import { SeriesAutocomplete } from "./series-autocomplete";
import { getAlbumSchema, type CreateAlbumFormValues } from "./schema";

export function captureVideoPoster(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.playsInline = true;
    video.currentTime = 0.2;
    video.onloadeddata = () => {
      video.currentTime = 0.2;
    };
    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 720;
      canvas.height = video.videoHeight || 1280;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(video.src);
          if (blob) resolve(blob);
          else reject(new Error("Failed to capture video poster"));
        },
        "image/jpeg",
        0.85
      );
    };
    video.onerror = (e) => {
      URL.revokeObjectURL(video.src);
      reject(e);
    };
  });
}

export interface CreateAlbumFormProps {
  onSuccess?: (values: CreateAlbumFormValues) => void;
  onCancel?: () => void;
  className?: string;
  isMobile?: boolean;
  imagesPayload?: ImagePayload[];
  coverIndex?: number | null;
  postType?: "photoset" | "video";
  videoFile?: File | null;
  customCoverFile?: File | null;
}

export function CreateAlbumForm({
  onSuccess,
  onCancel,
  className,
  isMobile = false,
  imagesPayload = [],
  coverIndex = 0,
  postType = "photoset",
  videoFile = null,
  customCoverFile = null,
}: CreateAlbumFormProps) {
  const t = useTranslations("Studio");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const router = useRouter();

  const albumSchema = useMemo(() => getAlbumSchema(t as any), [t]);

  const form = useForm<CreateAlbumFormValues>({
    resolver: zodResolver(albumSchema),
    defaultValues: {
      title: "",
      character: "",
      fandom: "",
      tags: [],
      description: "",
      isPublic: true,
      enableWatermark: false,
    },
  });

  const tags = form.watch("tags") || [];

  const createPostMutation = useMutation({
    mutationFn: async (values: CreateAlbumFormValues) => {
      if (postType === "video") {
        if (!videoFile) {
          throw new Error(t("requireVideoFile"));
        }

        let coverBlob: Blob;
        if (customCoverFile) {
          coverBlob = customCoverFile;
        } else {
          try {
            coverBlob = await captureVideoPoster(videoFile);
          } catch {
            throw new Error(t("cannotExtractCover"));
          }
        }

        const coverFileToUpload =
          coverBlob instanceof File
            ? coverBlob
            : new File([coverBlob], "cover.jpg", { type: "image/jpeg" });

        const [videoRes, coverRes] = await Promise.all([
          uploadMyMedia(videoFile, "videos"),
          uploadMyMedia(coverFileToUpload, "covers", values.enableWatermark),
        ]);

        const created = await createPost({
          title: values.title,
          caption: values.description,
          postType: "video",
          albumCategory: "series",
          characterName: values.character || undefined,
          fandomName: values.fandom || undefined,
          isPublic: values.isPublic,
          enableWatermark: values.enableWatermark,
          tags: values.tags,
          coverImageUrl: coverRes.url,
          media: [
            {
              mediaUrl: videoRes.url,
              mediaType: "video",
              sortOrder: 0,
              isCover: true,
            },
          ],
        });

        return { created, values };
      }

      const newPayloads = (imagesPayload || []).filter(
        (p): p is ImagePayload & { type: "new" } => p.type === "new"
      );

      const uploadedMediaList: {
        mediaUrl: string;
        sortOrder: number;
        isCover: boolean;
      }[] = [];

      for (let i = 0; i < newPayloads.length; i++) {
        const item = newPayloads[i];
        if (!item?.file) continue;
        const res = await uploadMyMedia(
          item.file,
          "posts",
          values.enableWatermark
        );
        uploadedMediaList.push({
          mediaUrl: res.url,
          sortOrder: item.order ?? i,
          isCover: coverIndex === i || (coverIndex === null && i === 0),
        });
      }

      if (uploadedMediaList.length === 0) {
        throw new Error(t("valImages"));
      }

      const coverMedia = uploadedMediaList.find((m) => m.isCover);
      const coverImageUrl = coverMedia
        ? coverMedia.mediaUrl
        : uploadedMediaList[0]?.mediaUrl;

      const created = await createPost({
        title: values.title,
        caption: values.description,
        postType: "photoset",
        albumCategory: "series",
        characterName: values.character || undefined,
        fandomName: values.fandom || undefined,
        isPublic: values.isPublic,
        enableWatermark: values.enableWatermark,
        tags: values.tags,
        coverImageUrl,
        media: uploadedMediaList,
      });

      return { created, values };
    },
    onSuccess: ({ created, values }) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({
        queryKey: ["my-cosplayer-profile"],
      });

      toast.success(t("publishSuccess"));
      onSuccess?.(values);
      if (created?.slug) {
        router.push(`/posts/${created.slug}`);
      } else {
        router.push("/profile");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || t("publishError"));
    },
  });

  const isSubmitting = createPostMutation.isPending;

  const onSubmit = (values: CreateAlbumFormValues) => {
    if (postType === "video") {
      if (!videoFile) {
        toast.error(t("selectVideoToPublish"));
        return;
      }
    } else if (!imagesPayload || imagesPayload.length === 0) {
      toast.error(t("valImages"));
      return;
    }
    createPostMutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`flex flex-col justify-between gap-5 ${className || ""}`}
      >
        <div className="space-y-4">
          {/* Metadata Row: Title, Character, Series (1 input per row) */}
          <div className="grid grid-cols-1 gap-4">
            {/* Tên Album */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-foreground text-sm font-medium">
                    {t("titleLabel")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("titlePlaceholder")}
                      className="h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Nhân vật */}
            <FormField
              control={form.control}
              name="character"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-foreground text-sm font-medium">
                    {t("characterLabel")}
                  </FormLabel>
                  <FormControl>
                    <CharacterAutocomplete
                      value={field.value || ""}
                      onChange={field.onChange}
                      onSelectCharacter={({ characterName, seriesName }) => {
                        field.onChange(characterName);
                        if (seriesName && !form.getValues("fandom")) {
                          form.setValue("fandom", seriesName, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }
                      }}
                      placeholder={t("characterPlaceholder")}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Fandom / Game */}
            <FormField
              control={form.control}
              name="fandom"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-foreground text-sm font-medium">
                    {t("seriesLabel")}
                  </FormLabel>
                  <FormControl>
                    <SeriesAutocomplete
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder={t("seriesPlaceholder")}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          {/* Tag Pills (Pixiv Style) */}
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-foreground text-sm font-medium">
                  {t("tagCharacter")}
                </FormLabel>
                <FormControl>
                  <TagPicker
                    value={field.value || []}
                    onChange={field.onChange}
                    characterHint={form.watch("character")}
                    fandomHint={form.watch("fandom")}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Mô tả */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-foreground text-sm font-medium">
                  {t("descLabel")}
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder={t("descPlaceholder")}
                    className="resize-y"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Settings Switches */}
          <div className="border-border grid gap-4 border-t pt-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-3 space-y-0">
                  <div className="space-y-0.5">
                    <FormLabel className="text-foreground cursor-pointer text-sm font-medium">
                      {t("visibility.public")}
                    </FormLabel>
                    <FormDescription className="text-muted-foreground text-xs">
                      {t("visibilityLabel")}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enableWatermark"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-3 space-y-0">
                  <div className="space-y-0.5">
                    <FormLabel className="text-foreground cursor-pointer text-sm font-medium">
                      {t("watermark")}
                    </FormLabel>
                    <FormDescription className="text-muted-foreground text-xs">
                      {t("watermarkDesc")}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Submit button */}
        <div
          className={`pt-2 ${isMobile ? "bg-background sticky bottom-0 pb-2" : ""}`}
        >
          <Button type="submit" disabled={isSubmitting} className="h-11 w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t("submitting")}
              </>
            ) : (
              <>
                <Upload className="size-4" />
                {t("submitBtn")}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
