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
import { Calendar, Check, Loader2, Send, User } from "lucide-react";
import { useAuthStore } from "@/store/use-auth-store";
import { useRouter } from "@/i18n/navigation";

const bookingSchema = z.object({
  bookingType: z.string().min(1, "Vui lòng chọn loại hình booking"),
  fullName: z.string().min(1, "Vui lòng nhập họ và tên liên hệ"),
  contact: z
    .string()
    .min(8, "Vui lòng nhập số điện thoại hoặc Telegram / Zalo"),
  targetDate: z.string().min(1, "Vui lòng nhập ngày dự kiến"),
  budget: z.string().min(1, "Vui lòng nhập mức ngân sách dự kiến"),
  details: z
    .string()
    .min(10, "Vui lòng mô tả chi tiết yêu cầu dự án (tối thiểu 10 ký tự)"),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export interface RankingBookingTarget {
  name: string;
  handle: string;
  avatarUrl: string;
}

export interface RankingBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: RankingBookingTarget | null;
}

const BOOKING_TYPES = [
  "Chụp ảnh Photoset / Model thương mại",
  "Khách mời sự kiện / Guest Cosplayer",
  "Quảng bá sản phẩm / Review Games",
  "Chế tác đạo cụ & phục trang Crafting",
];

export function RankingBookingDialog({
  open,
  onOpenChange,
  target,
}: RankingBookingDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();

  const handleOpenChange = (val: boolean) => {
    if (val && !isAuthenticated) {
      toast.info("Vui lòng đăng nhập để gửi yêu cầu Booking!");
      router.push("/auth/login?from=/ranking");
      return;
    }
    onOpenChange(val);
  };

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      bookingType: "Chụp ảnh Photoset / Model thương mại",
      fullName: "Hải Anh",
      contact: "0901234567",
      targetDate: "20/12/2026",
      budget: "5.000.000 VNĐ - 10.000.000 VNĐ",
      details:
        "Cần mời cosplayer tham gia buổi chụp concept Honkai Star Rail tại studio TP.HCM.",
    },
  });

  const onSubmit = async (values: BookingFormValues) => {
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để gửi yêu cầu Booking!");
      router.push("/auth/login?from=/ranking");
      return;
    }
    setIsSubmitting(true);
    try {
      // Simulate API dispatch
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success(
        `Yêu cầu Booking gửi tới ${target?.name || "Cosplayer"} thành công!`,
        {
          description:
            "Quản lý hoặc cosplayer sẽ phản hồi bạn qua số điện thoại/liên hệ sớm nhất.",
        }
      );
      onOpenChange(false);
      form.reset();
    } catch {
      toast.error("Có lỗi xảy ra khi gửi yêu cầu booking. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!target) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card border-border/80 max-h-[92vh] max-w-[calc(100%-1.5rem)] overflow-y-auto rounded-2xl p-4 shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-6">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="bg-muted/50 border-border/60 flex items-center gap-3 rounded-2xl border p-3">
            <div className="ring-primary/40 relative size-12 shrink-0 overflow-hidden rounded-full ring-2">
              <Image
                src={target.avatarUrl}
                alt={target.name}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-foreground truncate text-sm font-bold">
                  {target.name}
                </span>
                <span className="inline-flex size-3.5 items-center justify-center rounded-full bg-blue-500 text-white">
                  <Check className="size-2 stroke-[3]" />
                </span>
              </div>
              <p className="text-muted-foreground text-xs">{target.handle}</p>
            </div>
            <div className="bg-primary/10 text-primary rounded-full px-2.5 py-1 text-[11px] font-bold">
              Booking Trực Tiếp
            </div>
          </div>

          <DialogTitle className="text-foreground pt-2 text-lg font-bold sm:text-xl">
            Gửi yêu cầu hợp tác & Booking
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            Điền thông tin dự án để Kosume kết nối bạn với {target.name} một
            cách bảo mật và nhanh chóng.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-2"
          >
            {/* Loại hình booking */}
            <FormField
              control={form.control}
              name="bookingType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">
                    Loại hình hợp tác
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {BOOKING_TYPES.map((type) => {
                        const isSelected = field.value === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => field.onChange(type)}
                            className={`cursor-pointer rounded-xl border p-2.5 text-left text-xs font-medium transition-all ${
                              isSelected
                                ? "border-primary bg-primary/10 text-primary font-semibold"
                                : "border-border/70 bg-card hover:bg-muted text-muted-foreground"
                            }`}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Họ tên & Liên hệ */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      Họ tên của bạn / Tổ chức
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
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      Số ĐT / Telegram / Zalo
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
            </div>

            {/* Ngày dự kiến & Ngân sách */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="targetDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      Thời gian dự kiến
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="DD/MM/YYYY hoặc Tháng..."
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
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      Ngân sách dự kiến
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: 5.000.000 VNĐ"
                        className="h-9 rounded-xl text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
            </div>

            {/* Chi tiết yêu cầu */}
            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">
                    Mô tả dự án & Yêu cầu cụ thể
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Mô tả ý tưởng nhân vật, địa điểm quay chụp hoặc timeline sự kiện..."
                      className="resize-none rounded-xl text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Buttons */}
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
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="mr-1.5 size-3.5" />
                    Gửi yêu cầu Booking
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
