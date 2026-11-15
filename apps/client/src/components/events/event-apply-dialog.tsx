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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Ticket, Calendar, Check, Loader2 } from "lucide-react";
import { EventItem } from "./events-types";
import { useAuthStore } from "@/store/use-auth-store";
import { useRouter } from "@/i18n/navigation";

const applyEventSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ và tên"),
  stageName: z.string().min(1, "Vui lòng nhập tên cosplay (Stage name)"),
  category: z.string().min(1, "Vui lòng chọn hạng mục"),
  phone: z.string().min(8, "Vui lòng nhập số điện thoại liên hệ"),
  characterPlanned: z
    .string()
    .min(1, "Vui lòng nhập nhân vật dự kiến hóa thân"),
  portfolioUrl: z.string().optional(),
  notes: z.string().optional(),
});

type ApplyEventFormValues = z.infer<typeof applyEventSchema>;

export interface EventApplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: EventItem | null;
}

export function EventApplyDialog({
  open,
  onOpenChange,
  event,
}: EventApplyDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();

  const handleOpenChange = (val: boolean) => {
    if (val && !isAuthenticated) {
      toast.info("Vui lòng đăng nhập để ứng tuyển tham gia sự kiện!");
      router.push("/auth/login?from=/events");
      return;
    }
    onOpenChange(val);
  };

  const form = useForm<ApplyEventFormValues>({
    resolver: zodResolver(applyEventSchema),
    defaultValues: {
      fullName: "Hải Anh",
      stageName: "Hải Anh",
      category: "Guest Cosplayer / Khách mời",
      phone: "0987654321",
      characterPlanned: "Acheron (Honkai: Star Rail)",
      portfolioUrl: "https://kosume.com/cosplayer/haianh",
      notes: "Đã có sẵn trang phục và vũ khí đạo cụ hoàn thiện.",
    },
  });

  const onSubmit = (values: ApplyEventFormValues) => {
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để ứng tuyển tham gia sự kiện!");
      router.push("/auth/login?from=/events");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(
        `Đã gửi đơn ứng tuyển tham gia "${event?.title}" thành công!`,
        {
          description: `Ban tổ chức sự kiện sẽ liên hệ qua số điện thoại ${values.phone} trong 24-48h.`,
        }
      );
      form.reset();
      onOpenChange(false);
    }, 800);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card border-border/80 max-h-[92vh] max-w-[calc(100%-1rem)] overflow-y-auto rounded-2xl p-4 shadow-2xl sm:max-w-xl sm:rounded-3xl sm:p-6">
        <DialogHeader className="border-border/60 border-b pb-2">
          <div className="text-primary flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
            <Ticket className="size-3.5" />
            <span>Ứng tuyển tham gia sự kiện</span>
          </div>
          <DialogTitle className="text-foreground text-lg font-bold sm:text-xl">
            {event?.title || "Sự kiện Cosplay"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            {event?.location} • Ngày tổ chức: {event?.dateString} •{" "}
            {event?.venue}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-2"
          >
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {/* Họ tên */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-muted-foreground text-xs font-semibold">
                      Họ và tên
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nguyễn Văn A"
                        className="h-10 rounded-xl text-xs sm:text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Tên cosplay (Stage name) */}
              <FormField
                control={form.control}
                name="stageName"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-muted-foreground text-xs font-semibold">
                      Tên Cosplay (Stage name)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ví dụ: Kiriko, Hải Anh"
                        className="h-10 rounded-xl text-xs sm:text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {/* Hạng mục ứng tuyển */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-muted-foreground text-xs font-semibold">
                      Hạng mục ứng tuyển
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-border/70 bg-background/50 focus:border-primary focus:ring-primary/40 h-10 w-full rounded-xl text-xs sm:text-sm">
                          <SelectValue placeholder="Chọn hạng mục ứng tuyển" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="border-border/80 bg-card/95 rounded-xl backdrop-blur-xl">
                        <SelectItem value="Guest Cosplayer / Khách mời">
                          Guest Cosplayer / Khách mời
                        </SelectItem>
                        <SelectItem value="Biểu diễn sân khấu / Catwalk">
                          Biểu diễn sân khấu / Catwalk
                        </SelectItem>
                        <SelectItem value="Gian hàng Artist / Handmade">
                          Gian hàng Artist / Handmade
                        </SelectItem>
                        <SelectItem value="Cộng tác viên hỗ trợ sự kiện">
                          Cộng tác viên hỗ trợ sự kiện
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Số điện thoại */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-muted-foreground text-xs font-semibold">
                      Số điện thoại / Zalo
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0912 345 678"
                        className="h-10 rounded-xl text-xs sm:text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {/* Nhân vật dự kiến hóa thân */}
            <FormField
              control={form.control}
              name="characterPlanned"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-muted-foreground text-xs font-semibold">
                    Nhân vật & Series dự kiến hóa thân
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ví dụ: Acheron (Honkai: Star Rail), Raiden Shogun (Genshin)"
                      className="h-10 rounded-xl text-xs sm:text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Link Portfolio */}
            <FormField
              control={form.control}
              name="portfolioUrl"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-muted-foreground text-xs font-semibold">
                    Link Portfolio / Trang cá nhân Kosume
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://kosume.com/cosplayer/..."
                      className="h-10 rounded-xl text-xs sm:text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground text-[11px]">
                    Giúp BTC duyệt hồ sơ nhanh hơn dựa trên các bộ ảnh đã đăng
                    tải
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Ghi chú */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-muted-foreground text-xs font-semibold">
                    Ghi chú / Yêu cầu đạo cụ sân khấu
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="Kích thước đạo cụ, yêu cầu ánh sáng, âm thanh biểu diễn..."
                      className="resize-none rounded-xl text-xs sm:text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Action buttons */}
            <div className="border-border/60 flex items-center justify-end gap-2.5 border-t pt-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="h-10 cursor-pointer rounded-xl px-4 text-xs font-medium"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/25 h-10 cursor-pointer rounded-xl px-6 text-xs font-semibold shadow-md transition-all hover:scale-[1.02]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    Đang gửi đơn...
                  </>
                ) : (
                  <>
                    <Check className="mr-1.5 size-3.5" />
                    Gửi đơn ứng tuyển
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
