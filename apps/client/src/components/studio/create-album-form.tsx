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

const createAlbumSchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tên Album"),
  character: z.string().min(1, "Vui lòng nhập tên nhân vật"),
  fandom: z.string().min(1, "Vui lòng nhập Fandom / Game"),
  tags: z.array(z.string()).min(1, "Vui lòng thêm ít nhất 1 thẻ"),
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
      toast.success(`Đã đăng album "${values.title}" thành công!`, {
        description: `Tác phẩm với nhân vật ${values.character} (${values.fandom}) đã xuất bản.`,
      });
      onSuccess?.(values);
    } catch {
      toast.error("Có lỗi xảy ra khi tạo album. Vui lòng thử lại!");
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
                  Tên Album
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nhập tên album cosplay..."
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
                  Nhân vật
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Acheron, Kafka, Raiden Shogun..."
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
                  Fandom / Game
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Honkai: Star Rail, Genshin Impact..."
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
                  Thẻ phân loại
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
                        title={`Xóa thẻ #${tag}`}
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
                        placeholder="Thẻ mới..."
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
                      Thêm thẻ
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
                  Mô tả
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Chia sẻ thêm thông tin về concept, địa điểm chụp, photo studio..."
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
                      Công tác gạt công tác (Công khai)
                    </FormLabel>
                    <FormDescription className="text-muted-foreground text-[11px]">
                      Hiển thị công khai trên bảng tin và trang cá nhân
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
                      Đóng nút nét trên nhiệt (Watermark)
                    </FormLabel>
                    <FormDescription className="text-muted-foreground text-[11px]">
                      Tự động chèn watermark bảo vệ bản quyền ảnh
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
                Đang đăng tải album...
              </>
            ) : (
              <>
                <Upload className="mr-2 size-4" />
                Đăng album
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
