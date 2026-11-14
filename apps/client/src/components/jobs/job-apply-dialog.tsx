"use client";

import React, { useState } from "react";
import Image from "next/image";
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
import { Check, Loader2, Send } from "lucide-react";
import { JobItem } from "./jobs-types";

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
  job: JobItem | null;
}

export function JobApplyDialog({
  open,
  onOpenChange,
  job,
}: JobApplyDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ApplyJobFormValues>({
    resolver: zodResolver(applyJobSchema),
    defaultValues: {
      fullName: "Hải Anh",
      stageName: "Hải Anh",
      contact: "0901234567",
      portfolioUrl: "https://cosspace.vn/cosplayer/haianh",
      experience:
        "Hơn 3 năm kinh nghiệm cosplay các nhân vật Honkai & Genshin, từng làm model sự kiện và chụp lookbook.",
      message:
        "Rất mong có cơ hội được hợp tác cùng thương hiệu trong dự án lần này!",
    },
  });

  const onSubmit = async (values: ApplyJobFormValues) => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success("Nộp hồ sơ ứng tuyển thành công!", {
        description: `Hồ sơ của bạn đã được chuyển tới bộ phận tuyển dụng của ${job?.brandName}. Họ sẽ liên hệ qua ${values.contact} sớm nhất!`,
      });
      onOpenChange(false);
      form.reset();
    } catch {
      toast.error("Gửi hồ sơ thất bại. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/80 max-h-[92vh] max-w-[calc(100%-1.5rem)] overflow-y-auto rounded-2xl p-4 shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-6">
        <DialogHeader className="space-y-1.5 text-left">
          {/* Target Job Info Card */}
          <div className="border-border/60 bg-muted/40 flex items-start gap-3 rounded-2xl border p-3">
            <div
              className={`ring-border relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ${
                job.brandColor || "bg-muted"
              }`}
            >
              {job.brandLogo ? (
                <Image
                  src={job.brandLogo}
                  alt={job.brandName}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              ) : (
                <span className="text-xs font-black text-white">
                  {job.brandInitials || job.brandName.slice(0, 2)}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-foreground text-xs font-bold">
                  {job.brandName}
                </span>
                {job.isVerified && (
                  <span className="inline-flex size-3.5 items-center justify-center rounded-full bg-blue-500 text-white">
                    <Check className="size-2 stroke-[3]" />
                  </span>
                )}
              </div>
              <h4 className="text-foreground mt-0.5 line-clamp-1 text-xs font-bold">
                {job.title}
              </h4>
              <p className="mt-0.5 text-[11px] font-semibold text-emerald-400">
                {job.budget} • {job.location}
              </p>
            </div>
          </div>

          <DialogTitle className="text-foreground pt-2 text-lg font-bold">
            Ứng tuyển vị trí Cosplayer
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            Thông tin hồ sơ của bạn sẽ được gửi trực tiếp tới đại diện thương
            hiệu {job.brandName}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3.5 pt-2"
          >
            {/* Họ tên & Stage Name */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      Họ và tên thật
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
                      Nghệ danh cosplay
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: Hải Anh / Kiriko"
                        className="h-9 rounded-xl text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
            </div>

            {/* Liên hệ & Link Portfolio */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      SĐT / Zalo / Telegram
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="09xx... hoặc @telegram"
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
                      Link Profile / Portfolio
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://cosspace.vn/..."
                        className="h-9 rounded-xl text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
            </div>

            {/* Kinh nghiệm */}
            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">
                    Kinh nghiệm & Dự án tiêu biểu
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Các nhân vật đã từng hóa thân, phong cách biểu diễn hoặc giải thưởng đã đạt được..."
                      className="resize-none rounded-xl text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Lời nhắn gửi */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">
                    Lời nhắn thêm (tùy chọn)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ghi chú thêm về chiều cao, lịch rảnh hoặc yêu cầu đặc biệt..."
                      className="h-9 rounded-xl text-xs"
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
                Hủy bỏ
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
                    Đang nộp hồ sơ...
                  </>
                ) : (
                  <>
                    <Send className="mr-1.5 size-3.5" />
                    Gửi hồ sơ ứng tuyển
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
