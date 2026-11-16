"use client";

import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Briefcase, Loader2, PlusCircle } from "lucide-react";
import { JobFilterId } from "./jobs-types";
import { useAuthStore } from "@/store/use-auth-store";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { createJob, type JobDetailResDto } from "@/services/jobs";

const postJobSchema = z.object({
  brandName: z
    .string()
    .min(1, "Vui lòng nhập tên Thương hiệu / Studio / Nhà tổ chức"),
  title: z.string().min(5, "Tiêu đề tin tuyển dụng phải có ít nhất 5 ký tự"),
  category: z.string().min(1, "Vui lòng chọn hoặc nhập hạng mục"),
  budget: z.string().min(1, "Vui lòng nhập mức thù lao / ngân sách dự kiến"),
  location: z.string().min(1, "Vui lòng nhập địa điểm làm việc"),
  deadline: z.string().min(1, "Vui lòng nhập hạn nhận hồ sơ"),
  requirements: z.string().min(5, "Vui lòng nhập yêu cầu đối với cosplayer"),
  description: z.string().min(10, "Vui lòng mô tả chi tiết công việc"),
  contactEmail: z.string().email("Vui lòng nhập email hợp lệ"),
});

type PostJobFormValues = z.infer<typeof postJobSchema>;

export interface PostJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobCreated?: (job: JobDetailResDto) => void;
}

const CATEGORY_OPTIONS = [
  "Mẫu ảnh / Lookbook",
  "Guest Sự kiện",
  "Làm trang phục / Crafting",
  "Quảng cáo Game",
];

const CATEGORY_MAP: Record<
  string,
  "lookbook" | "event" | "crafting" | "game_ads"
> = {
  "Mẫu ảnh / Lookbook": "lookbook",
  "Guest Sự kiện": "event",
  "Làm trang phục / Crafting": "crafting",
  "Quảng cáo Game": "game_ads",
};

export function PostJobDialog({
  open,
  onOpenChange,
  onJobCreated,
}: PostJobDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();
  const t = useTranslations("Jobs.postDialog");

  const handleOpenChange = (val: boolean) => {
    if (val && !isAuthenticated) {
      toast.info("Vui lòng đăng nhập để đăng tin tuyển dụng!");
      router.push("/auth/login?from=/jobs");
      return;
    }
    onOpenChange(val);
  };

  const form = useForm<PostJobFormValues>({
    resolver: zodResolver(postJobSchema),
    defaultValues: {
      brandName: "",
      title: "",
      category: "Mẫu ảnh / Lookbook",
      budget: "",
      location: "",
      deadline: "",
      requirements: "",
      description: "",
      contactEmail: "",
    },
  });

  const onSubmit = async (values: PostJobFormValues) => {
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để đăng tin tuyển dụng!");
      router.push("/auth/login?from=/jobs");
      return;
    }
    setIsSubmitting(true);
    try {
      const categoryCode = CATEGORY_MAP[values.category] || "event";
      const tags: JobFilterId[] = [
        "all",
        categoryCode,
        values.location.toLowerCase().includes("hcm") ? "hcm" : "hanoi",
      ];

      const created = await createJob({
        title: values.title,
        brandName: values.brandName,
        brandInitials: values.brandName.slice(0, 3).toUpperCase(),
        brandColor: "bg-primary",
        isVerified: true,
        categoryCode,
        categoryLabel: values.category,
        budgetLabel: values.budget,
        locationLabel: values.location,
        deadlineLabel: values.deadline,
        requirements: values.requirements,
        description: values.description,
        contactEmail: values.contactEmail,
        filterTags: tags,
      });

      onJobCreated?.(created);
      toast.success(t("successTitle"), {
        description: t("successDesc"),
      });
      onOpenChange(false);
      form.reset();
    } catch {
      toast.error("Có lỗi xảy ra khi đăng tin. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card border-border/80 max-h-[92vh] max-w-[calc(100%-1.5rem)] overflow-y-auto rounded-2xl p-4 shadow-2xl sm:max-w-xl sm:rounded-3xl sm:p-6">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="text-primary flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
            <Briefcase className="size-4" />
            <span>{t("title")}</span>
          </div>
          <DialogTitle className="text-foreground text-lg font-bold sm:text-xl">
            {t("title")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            {t("desc")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3.5 pt-2"
          >
            {/* Tên thương hiệu & Email */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="brandName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      {t("brandName")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: Studio A / Production"
                        className="h-9 rounded-xl text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      {t("contactEmail")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="talent@company.com"
                        className="h-9 rounded-xl text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
            </div>

            {/* Tiêu đề tin tuyển dụng */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">
                    {t("jobTitle")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: Tuyển Cosplayer biểu diễn sự kiện..."
                      className="h-9 rounded-xl text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Hạng mục */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">
                    {t("category")}
                  </FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORY_OPTIONS.map((cat) => {
                        const isSelected = field.value === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => field.onChange(cat)}
                            className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                              isSelected
                                ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                                : "border-border/60 bg-muted/40 hover:bg-muted text-muted-foreground"
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Ngân sách, Địa điểm, Deadline */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      {t("budget")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: 5.000.000đ"
                        className="h-9 rounded-xl text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      {t("location")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="TP.HCM / Hà Nội..."
                        className="h-9 rounded-xl text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      {t("deadline")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="DD/MM/YYYY"
                        className="h-9 rounded-xl text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
            </div>

            {/* Yêu cầu */}
            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">
                    {t("requirements")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: Ngoại hình phù hợp, có trang phục..."
                      className="h-9 rounded-xl text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Mô tả chi tiết */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">
                    {t("description")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Mô tả cụ thể thời gian, kịch bản, phúc lợi..."
                      className="resize-none rounded-xl text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-9 cursor-pointer rounded-xl text-xs"
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 cursor-pointer rounded-xl text-xs font-bold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    {t("submitting")}
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-1.5 size-3.5" />
                    {t("submit")}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
