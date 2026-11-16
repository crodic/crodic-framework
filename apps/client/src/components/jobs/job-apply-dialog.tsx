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
import { Loader2, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import type { JobSummaryResDto, JobDetailResDto } from "@/services/jobs";
import { useAuthStore } from "@/store/use-auth-store";
import { useRouter } from "@/i18n/navigation";
import { applyJob } from "@/services/jobs";

const applyJobSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ và tên"),
  stageName: z.string().min(1, "Vui lòng nhập nghệ danh cosplay (Stage name)"),
  contact: z
    .string()
    .min(8, "Vui lòng nhập số điện thoại hoặc Zalo / Telegram"),
  portfolioUrl: z.string().optional(),
  experience: z
    .string()
    .min(
      10,
      "Vui lòng giới thiệu kinh nghiệm / bộ ảnh tiêu biểu (tối thiểu 10 ký tự)"
    ),
  message: z.string().optional(),
});

type ApplyJobFormValues = z.infer<typeof applyJobSchema>;

export interface JobApplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobSummaryResDto | JobDetailResDto | null;
}

export function JobApplyDialog({
  open,
  onOpenChange,
  job,
}: JobApplyDialogProps) {
  const t = useTranslations("Jobs.applyDialog");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();

  const handleOpenChange = (val: boolean) => {
    if (val && !isAuthenticated) {
      toast.info(t("loginRequired"));
      router.push("/auth/login?from=/jobs");
      return;
    }
    onOpenChange(val);
  };

  const form = useForm<ApplyJobFormValues>({
    resolver: zodResolver(applyJobSchema),
    defaultValues: {
      fullName: "",
      stageName: "",
      contact: "",
      portfolioUrl: "",
      experience: "",
      message: "",
    },
  });

  const onSubmit = async (values: ApplyJobFormValues) => {
    if (!isAuthenticated) {
      toast.info(t("loginRequired"));
      router.push("/auth/login?from=/jobs");
      return;
    }
    if (!job) return;

    setIsSubmitting(true);
    try {
      await applyJob(job.id, {
        fullName: values.fullName,
        stageName: values.stageName,
        contactInfo: values.contact,
        portfolioUrl: values.portfolioUrl || undefined,
        experience: values.experience,
        message: values.message || undefined,
      });

      toast.success(t("successTitle"), {
        description: t("successDesc", { brandName: job.brandName }),
      });
      onOpenChange(false);
      form.reset();
    } catch {
      toast.error("Không thể gửi hồ sơ ứng tuyển. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card border-border/80 max-h-[90vh] max-w-[calc(100%-1.5rem)] overflow-y-auto rounded-2xl p-4 shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-6">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="text-foreground text-base font-bold sm:text-xl">
            {t("title", { jobTitle: job.title })}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs sm:text-sm">
            {t("desc", { brandName: job.brandName })}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3.5 pt-2"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      {t("fullName")} *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nguyễn Văn A"
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
                name="stageName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      {t("stageName")} *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Kiriko Cos"
                        className="h-9 rounded-xl text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      {t("contact")} *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0901234567"
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
                name="portfolioUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      {t("portfolioUrl")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://kosume.vn/cosplayer/..."
                        className="h-9 rounded-xl text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">
                    {t("experience")} *
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả kinh nghiệm chụp, kinh nghiệm đi show..."
                      rows={3}
                      className="resize-none rounded-xl text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">
                    {t("message")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Lời nhắn thêm..."
                      rows={2}
                      className="resize-none rounded-xl text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <div className="border-border/60 flex items-center justify-end gap-2 border-t pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-9 cursor-pointer rounded-xl text-xs"
              >
                Hủy
              </Button>

              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 cursor-pointer rounded-xl text-xs font-bold shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    <span>{t("submitting")}</span>
                  </>
                ) : (
                  <>
                    <Send className="mr-1.5 size-3.5" />
                    <span>{t("submit")}</span>
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
