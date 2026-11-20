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
import { getAlbumSchema, type CreateAlbumFormValues } from "./schema";

export interface CreateAlbumFormProps {
  onSuccess?: (values: CreateAlbumFormValues) => void;
  onCancel?: () => void;
  className?: string;
  isMobile?: boolean;
  imagesPayload?: ImagePayload[];
  coverIndex?: number | null;
}

export function CreateAlbumForm({
  onSuccess,
  onCancel,
  className,
  isMobile = false,
  imagesPayload = [],
  coverIndex = 0,
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
        const res = await uploadMyMedia(item.file, "posts");
        uploadedMediaList.push({
          mediaUrl: res.url,
          sortOrder: item.order ?? i,
          isCover: coverIndex === i || (coverIndex === null && i === 0),
        });
      }

      if (uploadedMediaList.length === 0) {
        throw new Error(
          t("valImages") || "Vui lòng chọn ít nhất 1 ảnh cho album!"
        );
      }

      if (uploadedMediaList.length === 0) {
        throw new Error(
          t("valImages") || "Vui lòng chọn ít nhất 1 ảnh cho album!"
        );
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
    if (!imagesPayload || imagesPayload.length === 0) {
      toast.error(t("valImages") || "Vui lòng chọn ít nhất 1 ảnh cho album!");
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
          {/* Tên Album */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-foreground text-xs font-semibold sm:text-sm">
                  {t("titleLabel")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("titlePlaceholder")}
                    className="border-border/70 bg-background/50 focus-visible:ring-primary/40 focus-visible:border-primary/60 h-10 rounded-xl text-xs sm:text-sm"
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
                <FormLabel className="text-foreground text-xs font-semibold sm:text-sm">
                  {t("characterLabel")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("characterPlaceholder")}
                    className="border-border/70 bg-background/50 focus-visible:ring-primary/40 focus-visible:border-primary/60 h-10 rounded-xl text-xs sm:text-sm"
                    {...field}
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
                <FormLabel className="text-foreground text-xs font-semibold sm:text-sm">
                  {t("seriesLabel")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("seriesPlaceholder")}
                    className="border-border/70 bg-background/50 focus-visible:ring-primary/40 focus-visible:border-primary/60 h-10 rounded-xl text-xs sm:text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Tag Pills (Pixiv Style) */}
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-foreground text-xs font-semibold sm:text-sm">
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
                <FormLabel className="text-foreground text-xs font-semibold sm:text-sm">
                  {t("descLabel")}
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder={t("descPlaceholder")}
                    className="border-border/70 bg-background/50 focus-visible:ring-primary/40 focus-visible:border-primary/60 resize-none rounded-xl text-xs sm:text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Settings Switches */}
          <div className="border-border/50 bg-background/30 space-y-3 rounded-xl border p-3">
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-3 space-y-0">
                  <div className="space-y-0.5">
                    <FormLabel className="text-foreground cursor-pointer text-xs font-medium">
                      {t("visibility.public")}
                    </FormLabel>
                    <FormDescription className="text-muted-foreground text-[11px]">
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
                <FormItem className="border-border/40 flex items-center justify-between gap-3 space-y-0 border-t pt-2">
                  <div className="space-y-0.5">
                    <FormLabel className="text-foreground cursor-pointer text-xs font-medium">
                      {t("watermark")}
                    </FormLabel>
                    <FormDescription className="text-muted-foreground text-[11px]">
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
          className={`pt-2 ${isMobile ? "bg-background/95 sticky bottom-0 pb-2 backdrop-blur-sm" : ""}`}
        >
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/25 h-11 w-full cursor-pointer rounded-xl font-semibold shadow-lg transition-all hover:scale-[1.01]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {t("submitting")}
              </>
            ) : (
              <>
                <Upload className="mr-2 size-4" />
                {t("submitBtn")}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
