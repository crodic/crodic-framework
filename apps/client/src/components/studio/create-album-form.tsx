"use client";

import React, { useState } from "react";
import { z } from "zod";
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
import { useTranslations } from "next-intl";

const createAlbumSchema = z.object({
  title: z.string().min(1, "Title is required"),
  character: z.string().min(1, "Character is required"),
  fandom: z.string().min(1, "Fandom is required"),
  tags: z.array(z.string()).min(1, "Add at least 1 tag"),
  description: z.string(),
  isPublic: z.boolean(),
  enableWatermark: z.boolean(),
});

export type CreateAlbumFormValues = z.infer<typeof createAlbumSchema>;

export interface CreateAlbumFormProps {
  onSuccess?: (values: CreateAlbumFormValues) => void;
  onCancel?: () => void;
  className?: string;
  isMobile?: boolean;
}

export function CreateAlbumForm({
  onSuccess,
  onCancel,
  className,
  isMobile = false,
}: CreateAlbumFormProps) {
  const t = useTranslations("Studio");
  const tCommon = useTranslations("Common");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);

  const form = useForm<CreateAlbumFormValues>({
    resolver: zodResolver(createAlbumSchema),
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

  const handleAddTag = () => {
    const trimmed = newTagInput.trim().replace(/^#/, "");
    if (!trimmed) {
      setIsAddingTag(false);
      return;
    }
    if (!tags.includes(trimmed)) {
      form.setValue("tags", [...tags, trimmed], { shouldValidate: true });
    }
    setNewTagInput("");
    setIsAddingTag(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    form.setValue(
      "tags",
      tags.filter((t) => t !== tagToRemove),
      { shouldValidate: true }
    );
  };

  const onSubmit = async (values: CreateAlbumFormValues) => {
    setIsSubmitting(true);
    try {
      await createPost({
        title: values.title,
        caption: values.description,
        postType: "photoset",
        tags: values.tags,
      });
      toast.success(t("publishSuccess"));
      onSuccess?.(values);
    } catch {
      toast.error(t("publishError"));
    } finally {
      setIsSubmitting(false);
    }
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

          {/* Tag Pills */}
          <FormField
            control={form.control}
            name="tags"
            render={() => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-foreground text-xs font-semibold sm:text-sm">
                  {t("tagCharacter")}
                </FormLabel>
                <div className="flex flex-wrap items-center gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-primary/15 text-primary border-primary/25 inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:bg-primary/20 hover:text-primary-foreground ml-0.5 cursor-pointer rounded-full p-0.5 transition-colors"
                        title={`Remove #${tag}`}
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}

                  {isAddingTag ? (
                    <div className="inline-flex items-center gap-1">
                      <Input
                        autoFocus
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag();
                          } else if (e.key === "Escape") {
                            setIsAddingTag(false);
                            setNewTagInput("");
                          }
                        }}
                        onBlur={handleAddTag}
                        placeholder={t("tagCharacter")}
                        className="h-7 w-28 rounded-md px-2 text-xs"
                      />
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingTag(true)}
                      className="border-border/60 hover:border-primary/60 hover:text-primary h-7 cursor-pointer rounded-lg px-2 text-xs font-medium"
                    >
                      <Plus className="mr-1 size-3" />
                      {t("tagCharacter")}
                    </Button>
                  )}
                </div>
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
                      Watermark
                    </FormLabel>
                    <FormDescription className="text-muted-foreground text-[11px]">
                      Kosume Watermark Protection
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
