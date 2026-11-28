"use client";

import React, { useMemo, useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, ArrowLeft, Film } from "lucide-react";
import { toast } from "sonner";
import {
  getPostBySlug,
  updatePost,
  type PostDetailResDto,
  type CreatePostMediaInput,
} from "@/services/posts";
import { uploadMyMedia } from "@/services/cosplayer";
import { useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, Link } from "@/i18n/navigation";
import { SortableImageUpload } from "@/components/form/sortable-image-upload";
import type { ExistingImage, ImagePayload } from "@/components/form/types";
import { getActivePayloads } from "@/components/form/types";
import { TagPicker } from "./tag-picker";
import { CharacterAutocomplete } from "./character-autocomplete";
import { SeriesAutocomplete } from "./series-autocomplete";
import { getEditPostSchema, type EditPostFormValues } from "./schema";

export interface StudioEditViewProps {
  postSlug: string;
}

export function StudioEditView({ postSlug }: StudioEditViewProps) {
  const t = useTranslations("Studio");
  const tFeed = useTranslations("Feed");
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data: post,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["post-detail", postSlug],
    queryFn: () => getPostBySlug(postSlug, false),
    enabled: Boolean(postSlug),
  });

  const editSchema = useMemo(() => getEditPostSchema(t as any), [t]);

  const form = useForm<EditPostFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: "",
      caption: "",
      characterName: "",
      fandomName: "",
      albumCategory: "series",
      tags: [],
      isPublic: true,
      enableWatermark: false,
    },
  });

  const [imagesPayload, setImagesPayload] = useState<ImagePayload[]>([]);
  const [coverIndex, setCoverIndex] = useState<number | null>(0);

  const existingImages = useMemo<ExistingImage[]>(() => {
    if (!post?.media) return [];
    return post.media
      .filter((m) => m.mediaType === "image")
      .map((m) => ({
        id: String(m.id),
        src: m.mediaUrl,
        alt: m.caption || post.title,
      }));
  }, [post]);

  useEffect(() => {
    if (post) {
      const validCategories = [
        "series",
        "general",
        "group",
        "premium",
      ] as const;
      const cat = validCategories.includes(post.albumCategory as any)
        ? (post.albumCategory as EditPostFormValues["albumCategory"])
        : "series";

      form.reset({
        title: post.title || "",
        caption: post.caption || "",
        characterName: post.characterName || "",
        fandomName: post.fandomName || "",
        albumCategory: cat,
        tags: post.tagNamesCache || [],
        isPublic: post.isPublic ?? true,
        enableWatermark: post.enableWatermark ?? false,
      });

      if (post.postType !== "video" && post.media) {
        const imageMedia = post.media.filter((m) => m.mediaType === "image");
        setImagesPayload(
          imageMedia.map((m, idx) => ({
            type: "existing",
            id: String(m.id),
            order: idx,
          }))
        );
        const foundCoverIdx = imageMedia.findIndex(
          (m) => m.isCover || m.mediaUrl === post.coverImageUrl
        );
        setCoverIndex(foundCoverIdx >= 0 ? foundCoverIdx : 0);
      }
    }
  }, [post, form]);

  const updateMutation = useMutation({
    mutationFn: async (values: EditPostFormValues) => {
      if (!post) throw new Error("Post not found");

      let updatedMediaList: CreatePostMediaInput[] | undefined;
      let nextCoverImageUrl = post.coverImageUrl;

      if (post.postType !== "video") {
        const activePayloads = getActivePayloads(imagesPayload);
        if (activePayloads.length === 0) {
          throw new Error(t("valImages"));
        }

        const existingMap = new Map(
          existingImages.map((img) => [img.id, img.src])
        );

        const resolvedMedia: CreatePostMediaInput[] = [];
        for (let i = 0; i < activePayloads.length; i++) {
          const item = activePayloads[i];
          if (!item) continue;
          const isCover = coverIndex === i || (coverIndex === null && i === 0);

          if (item.type === "existing") {
            const url = existingMap.get(item.id);
            if (url) {
              resolvedMedia.push({
                mediaUrl: url,
                mediaType: "image",
                sortOrder: i,
                isCover,
              });
            }
          } else if (item.type === "new" && item.file) {
            const res = await uploadMyMedia(
              item.file,
              "posts",
              values.enableWatermark
            );
            resolvedMedia.push({
              mediaUrl: res.url,
              mediaType: "image",
              sortOrder: i,
              isCover,
            });
          }
        }

        if (resolvedMedia.length === 0) {
          throw new Error(t("valImages"));
        }

        updatedMediaList = resolvedMedia;
        const coverMedia = resolvedMedia.find((m) => m.isCover);
        nextCoverImageUrl = coverMedia
          ? coverMedia.mediaUrl
          : resolvedMedia[0]?.mediaUrl || post.coverImageUrl;
      }

      return await updatePost(post.id, {
        title: values.title.trim(),
        caption: values.caption.trim() || undefined,
        characterName: values.characterName.trim() || undefined,
        fandomName: values.fandomName.trim() || undefined,
        albumCategory: values.albumCategory,
        tags: values.tags,
        isPublic: values.isPublic,
        enableWatermark: values.enableWatermark,
        coverImageUrl: nextCoverImageUrl,
        media: updatedMediaList,
      });
    },
    onSuccess: (updated: PostDetailResDto) => {
      queryClient.invalidateQueries({
        queryKey: ["post-detail", postSlug],
      });
      if (updated?.slug) {
        queryClient.invalidateQueries({
          queryKey: ["post-detail", updated.slug],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["following-feed-posts"] });
      queryClient.invalidateQueries({ queryKey: ["explore-posts"] });
      queryClient.invalidateQueries({ queryKey: ["my-cosplayer-profile"] });

      toast.success(tFeed("updatePostSuccess"));
      router.push(`/posts/${encodeURIComponent(updated.slug || postSlug)}`);
    },
    onError: (err: any) => {
      toast.error(err?.message || t("publishError"));
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <Loader2 className="text-primary size-8 animate-spin" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="bg-card flex flex-col items-center justify-center gap-4 rounded-xl border p-12 text-center">
        <p className="text-muted-foreground text-sm">
          Không tìm thấy bài viết hoặc bạn không có quyền chỉnh sửa.
        </p>
        <Button variant="outline" asChild>
          <Link href="/feed">
            <ArrowLeft className="mr-1.5 size-4" />
            Quay lại
          </Link>
        </Button>
      </div>
    );
  }

  const isVideo = post.postType === "video" || Boolean(post.videoUrl);
  const videoUrl =
    post.videoUrl || post.media?.find((m) => m.mediaType === "video")?.mediaUrl;

  return (
    <div className="flex flex-col gap-6">
      {/* Media Section */}
      <section className="bg-card space-y-4 rounded-xl border p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-foreground text-lg font-semibold">
              {isVideo ? t("videoPostType") : t("photosLabel")}
            </h2>
            {!isVideo && (
              <p className="text-muted-foreground text-sm">
                {t("uploadLimitHint")}
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/posts/${encodeURIComponent(post.slug || post.id)}`}>
              <ArrowLeft className="mr-1.5 size-4" />
              {t("cancel")}
            </Link>
          </Button>
        </div>

        {!isVideo ? (
          <SortableImageUpload
            variant="studio"
            showInlineAddSlot={true}
            existingImages={existingImages}
            value={imagesPayload}
            onChange={setImagesPayload}
            coverIndex={coverIndex}
            onCoverIndexChange={setCoverIndex}
            maxFiles={20}
            gridClassName="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
          />
        ) : (
          <div className="border-border bg-muted/30 flex flex-col items-center justify-center gap-3 rounded-xl border p-4">
            {videoUrl ? (
              <video
                src={videoUrl}
                controls
                poster={post.coverImageUrl}
                className="max-h-80 w-full max-w-md rounded-lg bg-black object-contain"
              />
            ) : (
              <div className="text-muted-foreground flex items-center gap-2 py-8 text-sm">
                <Film className="size-5" />
                <span>{t("videoPostType")}</span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Form Section */}
      <div className="bg-card rounded-xl border p-4 sm:p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              updateMutation.mutate(values)
            )}
            className="flex flex-col justify-between gap-5"
          >
            <div className="space-y-4">
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

                {/* Chuyên mục Album */}
                <FormField
                  control={form.control}
                  name="albumCategory"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-foreground text-sm font-medium">
                        {t("categoryLabel")}
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full data-[size=default]:h-10">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="series">
                            {t("categories.series")}
                          </SelectItem>
                          <SelectItem value="general">
                            {t("categories.general")}
                          </SelectItem>
                          <SelectItem value="group">
                            {t("categories.group")}
                          </SelectItem>
                          <SelectItem value="premium">
                            {t("categories.premium")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Nhân vật */}
                <FormField
                  control={form.control}
                  name="characterName"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-foreground text-sm font-medium">
                        {t("characterLabel")}
                      </FormLabel>
                      <FormControl>
                        <CharacterAutocomplete
                          value={field.value || ""}
                          onChange={field.onChange}
                          onSelectCharacter={({
                            characterName,
                            seriesName,
                          }) => {
                            field.onChange(characterName);
                            if (seriesName && !form.getValues("fandomName")) {
                              form.setValue("fandomName", seriesName, {
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
                  name="fandomName"
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

              {/* Tag Pills */}
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
                        characterHint={form.watch("characterName")}
                        fandomHint={form.watch("fandomName")}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Mô tả */}
              <FormField
                control={form.control}
                name="caption"
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

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  router.push(
                    `/posts/${encodeURIComponent(post.slug || post.id)}`
                  )
                }
                disabled={updateMutation.isPending}
                className="h-11 px-6"
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="h-11 px-8"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {t("submitting")}
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    {tFeed("editPost")}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
