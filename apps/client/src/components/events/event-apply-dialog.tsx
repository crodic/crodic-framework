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
import { Ticket, Loader2 } from "lucide-react";
import type { EventSummaryResDto, EventDetailResDto } from "@/services/events";
import { useAuthStore } from "@/store/use-auth-store";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { applyEvent } from "@/services/events";

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
  event: EventSummaryResDto | EventDetailResDto | null;
}

export function EventApplyDialog({
  open,
  onOpenChange,
  event,
}: EventApplyDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const router = useRouter();
  const t = useTranslations("Events");
  const tApply = useTranslations("Events.applyDialog");

  const handleOpenChange = (val: boolean) => {
    if (val) {
      if (isHydrating) return;
      if (!isAuthenticated) {
        toast.info(t("loginRequired"));
        router.push("/auth/login?from=/events");
        return;
      }
    }
    onOpenChange(val);
  };

  const form = useForm<ApplyEventFormValues>({
    resolver: zodResolver(applyEventSchema),
    defaultValues: {
      fullName: "",
      stageName: "",
      category: "Guest Cosplayer / Khách mời",
      phone: "",
      characterPlanned: "",
      portfolioUrl: "",
      notes: "",
    },
  });

  const onSubmit = async (values: ApplyEventFormValues) => {
    if (isHydrating) return;
    if (!isAuthenticated) {
      toast.info(t("loginRequired"));
      router.push("/auth/login?from=/events");
      return;
    }
    setIsSubmitting(true);
    try {
      if (event?.id) {
        await applyEvent(event.id, {
          roleType: values.category,
          stageName: values.stageName,
          contactInfo: values.phone,
          portfolioUrl: values.portfolioUrl,
          experience: values.characterPlanned,
          message: values.notes,
        });
      }
      toast.success(tApply("successTitle"), {
        description: tApply("successDesc"),
      });
      form.reset();
      onOpenChange(false);
    } catch {
      toast.error("Có lỗi xảy ra khi gửi đơn ứng tuyển. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card border-border/80 max-h-[92vh] max-w-[calc(100%-1rem)] overflow-y-auto rounded-2xl p-4 shadow-2xl sm:max-w-xl sm:rounded-3xl sm:p-6">
        <DialogHeader className="border-border/60 border-b pb-2">
          <div className="text-primary flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
            <Ticket className="size-3.5" />
            <span>{tApply("badge")}</span>
          </div>
          <DialogTitle className="text-foreground text-lg font-bold sm:text-xl">
            {event?.title
              ? `${tApply("title")} - ${event.title}`
              : tApply("title")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            {tApply("desc")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-3"
          >
            {/* Họ tên & Stage name */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      {tApply("fullName")}
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
                      {tApply("stageName")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Kiriko / Sora..."
                        className="h-9 rounded-xl text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
            </div>

            {/* Hạng mục ứng tuyển & Số điện thoại */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      {tApply("category")}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9 rounded-xl text-xs">
                          <SelectValue placeholder="Chọn hạng mục ứng tuyển" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Guest Cosplayer / Khách mời">
                          {tApply("categoryGuest")}
                        </SelectItem>
                        <SelectItem value="Thí sinh Cosplay Contest">
                          {tApply("categoryContest")}
                        </SelectItem>
                        <SelectItem value="Artist / Gian hàng ấn phẩm">
                          {tApply("categoryArtist")}
                        </SelectItem>
                        <SelectItem value="Diễn giả / Hướng dẫn Workshop">
                          {tApply("categoryWorkshop")}
                        </SelectItem>
                        <SelectItem value="Staff hỗ trợ kỹ thuật">
                          {tApply("categoryStaff")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      {tApply("phone")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0912 345 678"
                        className="h-9 rounded-xl text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
            </div>

            {/* Nhân vật dự kiến hóa thân */}
            <FormField
              control={form.control}
              name="characterPlanned"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">
                    {tApply("character")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: Furina (Genshin Impact) / Acheron (Honkai)"
                      className="h-9 rounded-xl text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Link Portfolio */}
            <FormField
              control={form.control}
              name="portfolioUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">
                    {tApply("portfolio")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://facebook.com/... hoặc link Kosume profile"
                      className="h-9 rounded-xl text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-[10px]">
                    Giúp BTC duyệt hồ sơ nhanh hơn
                  </FormDescription>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Ghi chú thêm */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">
                    {tApply("notes")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="Thông tin thêm về đạo cụ cồng kềnh, người hỗ trợ (handler)..."
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
                className="h-9 cursor-pointer rounded-xl text-xs font-medium"
                disabled={isSubmitting}
              >
                {tApply("cancel")}
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 cursor-pointer rounded-xl px-5 text-xs font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    {tApply("submitting")}
                  </>
                ) : (
                  tApply("submit")
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
