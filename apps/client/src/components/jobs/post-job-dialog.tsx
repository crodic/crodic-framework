"use client";

import React, { useState } from "react";
import { addDays, format } from "date-fns";
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
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Briefcase,
  CalendarIcon,
  Loader2,
  MapPin,
  PlusCircle,
} from "lucide-react";
import { JobFilterId } from "./jobs-types";
import { useAuthStore } from "@/store/use-auth-store";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { createJob, type JobDetailResDto } from "@/services/jobs";

const CLIENT_JOB_LOCATIONS = [
  { label: "TP.HCM", code: "hcm" },
  { label: "Hà Nội", code: "hn" },
  { label: "Đà Nẵng", code: "dn" },
  { label: "Toàn quốc", code: "all" },
  { label: "Online / Remote", code: "remote" },
] as const;

const CLIENT_JOB_BUDGET_UNITS = [
  { value: "/ ngày", label: "/ ngày" },
  { value: "/ buổi", label: "/ buổi" },
  { value: "/ sự kiện", label: "/ sự kiện" },
  { value: "/ bộ", label: "/ bộ" },
  { value: "negotiable", label: "Thỏa thuận" },
] as const;

function buildClientJobBudgetLabel(
  min?: number,
  max?: number,
  unit = "/ ngày"
): string {
  if (unit === "negotiable") return "Thỏa thuận";
  const fmt = (n: number) => `${new Intl.NumberFormat("vi-VN").format(n)}đ`;
  const hasMin = typeof min === "number" && min > 0;
  const hasMax = typeof max === "number" && max > 0;

  if (hasMin && hasMax && max > min) {
    return `${fmt(min)} - ${fmt(max)} ${unit}`;
  }
  if (hasMin) return `${fmt(min)} ${unit}`;
  if (hasMax) return `Đến ${fmt(max)} ${unit}`;
  return "Thỏa thuận";
}

const postJobSchema = z.object({
  brandName: z
    .string()
    .min(1, "Vui lòng nhập tên Thương hiệu / Studio / Nhà tổ chức"),
  title: z.string().min(5, "Tiêu đề tin tuyển dụng phải có ít nhất 5 ký tự"),
  category: z.string().min(1, "Vui lòng chọn hoặc nhập hạng mục"),
  budget: z.string().min(1, "Vui lòng nhập mức thù lao / ngân sách dự kiến"),
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
  location: z.string().min(1, "Vui lòng chọn địa điểm làm việc"),
  deadline: z.string().min(1, "Vui lòng chọn hạn nhận hồ sơ"),
  deadlineAt: z.string().optional(),
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
  const [deadlineDate, setDeadlineDate] = useState<Date>(() =>
    addDays(new Date(), 30)
  );
  const [deadlineOpen, setDeadlineOpen] = useState(false);
  const [budgetUnit, setBudgetUnit] = useState<string>("/ ngày");
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
      budgetMin: 5000000,
      budgetMax: 8000000,
      budget: buildClientJobBudgetLabel(5000000, 8000000, "/ ngày"),
      location: "TP.HCM",
      deadline: format(deadlineDate, "dd/MM/yyyy"),
      deadlineAt: deadlineDate.toISOString(),
      requirements: "",
      description: "",
      contactEmail: "",
    },
  });

  const syncBudget = (
    nextMin: number | undefined,
    nextMax: number | undefined,
    nextUnit: string
  ) => {
    form.setValue("budgetMin", nextUnit === "negotiable" ? undefined : nextMin);
    form.setValue("budgetMax", nextUnit === "negotiable" ? undefined : nextMax);
    form.setValue(
      "budget",
      buildClientJobBudgetLabel(nextMin, nextMax, nextUnit),
      { shouldValidate: true }
    );
  };

  const resetLocalForm = () => {
    const nextDeadline = addDays(new Date(), 30);
    setDeadlineDate(nextDeadline);
    setBudgetUnit("/ ngày");
    form.reset({
      brandName: "",
      title: "",
      category: "Mẫu ảnh / Lookbook",
      budgetMin: 5000000,
      budgetMax: 8000000,
      budget: buildClientJobBudgetLabel(5000000, 8000000, "/ ngày"),
      location: "TP.HCM",
      deadline: format(nextDeadline, "dd/MM/yyyy"),
      deadlineAt: nextDeadline.toISOString(),
      requirements: "",
      description: "",
      contactEmail: "",
    });
  };

  const onSubmit = async (values: PostJobFormValues) => {
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để đăng tin tuyển dụng!");
      router.push("/auth/login?from=/jobs");
      return;
    }
    setIsSubmitting(true);
    try {
      const categoryCode = CATEGORY_MAP[values.category] || "event";
      const matchedLoc = CLIENT_JOB_LOCATIONS.find(
        (loc) => loc.label === values.location
      );
      const locationFilterCode = matchedLoc?.code ?? "hcm";
      const tags: JobFilterId[] = ["all", categoryCode];
      if (locationFilterCode === "hcm") tags.push("hcm");
      else if (locationFilterCode === "hn") tags.push("hanoi");

      const created = await createJob({
        title: values.title,
        brandName: values.brandName,
        brandInitials: values.brandName.slice(0, 3).toUpperCase(),
        brandColor: "bg-primary",
        isVerified: true,
        categoryCode,
        categoryLabel: values.category,
        budgetLabel: values.budget,
        budgetMin: values.budgetMin,
        budgetMax: values.budgetMax,
        locationLabel: values.location,
        locationFilterCode,
        deadlineLabel: values.deadline,
        deadlineAt: values.deadlineAt,
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
      resetLocalForm();
    } catch {
      toast.error("Có lỗi xảy ra khi đăng tin. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

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
                name="budgetMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      Ngân sách từ (VNĐ)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={500000}
                        disabled={budgetUnit === "negotiable"}
                        value={field.value ?? 0}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value) || 0);
                          syncBudget(
                            val,
                            form.getValues("budgetMax"),
                            budgetUnit
                          );
                        }}
                        className="h-9 rounded-xl text-xs"
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budgetMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      Đến (VNĐ)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={500000}
                        disabled={budgetUnit === "negotiable"}
                        value={field.value ?? 0}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value) || 0);
                          syncBudget(
                            form.getValues("budgetMin"),
                            val,
                            budgetUnit
                          );
                        }}
                        className="h-9 rounded-xl text-xs"
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <div className="grid gap-2">
                <Label className="text-xs font-semibold">Đơn vị tính</Label>
                <Select
                  value={budgetUnit}
                  onValueChange={(val) => {
                    setBudgetUnit(val);
                    syncBudget(
                      form.getValues("budgetMin"),
                      form.getValues("budgetMax"),
                      val
                    );
                  }}
                >
                  <SelectTrigger className="h-9 w-full rounded-xl text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CLIENT_JOB_BUDGET_UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      {t("location")}
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-9 w-full rounded-xl text-xs">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="size-3.5 opacity-70" />
                            <SelectValue placeholder="Chọn địa điểm" />
                          </span>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CLIENT_JOB_LOCATIONS.map((loc) => (
                          <SelectItem key={loc.label} value={loc.label}>
                            {loc.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Popover
                      open={deadlineOpen}
                      onOpenChange={setDeadlineOpen}
                      modal
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "h-9 w-full justify-start rounded-xl text-left text-xs font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-1.5 size-3.5 opacity-70" />
                            {deadlineDate
                              ? format(deadlineDate, "dd/MM/yyyy")
                              : field.value || "Chọn hạn nộp"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          captionLayout="dropdown"
                          selected={deadlineDate}
                          onSelect={(date) => {
                            if (!date) return;
                            setDeadlineDate(date);
                            form.setValue(
                              "deadline",
                              format(date, "dd/MM/yyyy"),
                              { shouldValidate: true }
                            );
                            form.setValue("deadlineAt", date.toISOString());
                            setDeadlineOpen(false);
                          }}
                          disabled={(date) => date < startOfToday}
                        />
                      </PopoverContent>
                    </Popover>
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
