"use client";

import React from "react";
import Image from "next/image";
import {
  Calendar,
  Check,
  Clock,
  DollarSign,
  Gift,
  Mail,
  MapPin,
  Send,
  Share2,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { JobItem } from "./jobs-types";

export interface JobDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobItem | null;
  onApply: (job: JobItem) => void;
}

export function JobDetailDialog({
  open,
  onOpenChange,
  job,
  onApply,
}: JobDetailDialogProps) {
  if (!job) return null;

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      toast.success("Đã sao chép liên kết tin tuyển dụng!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/80 max-h-[90vh] max-w-[calc(100%-1.5rem)] overflow-y-auto rounded-2xl p-4 shadow-2xl sm:max-w-xl sm:rounded-3xl sm:p-6">
        <DialogHeader className="space-y-2 text-left">
          {/* Brand Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`ring-border relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ${
                  job.brandColor || "bg-muted"
                }`}
              >
                {job.brandLogo ? (
                  <Image
                    src={job.brandLogo}
                    alt={job.brandName}
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                ) : (
                  <span className="text-xs font-black text-white">
                    {job.brandInitials || job.brandName.slice(0, 2)}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-foreground text-sm font-bold">
                    {job.brandName}
                  </span>
                  {job.isVerified && (
                    <span className="inline-flex size-3.5 items-center justify-center rounded-full bg-blue-500 text-white">
                      <Check className="size-2 stroke-[3]" />
                    </span>
                  )}
                </div>
                <span className="text-muted-foreground text-[11px] font-medium">
                  {job.category}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleShare}
              className="hover:bg-muted size-8 cursor-pointer rounded-full"
              title="Chia sẻ tin tuyển dụng"
            >
              <Share2 className="size-3.5" />
            </Button>
          </div>

          <DialogTitle className="text-foreground pt-1 text-base leading-snug font-bold sm:text-xl">
            {job.title}
          </DialogTitle>
        </DialogHeader>

        {/* Highlights Bar */}
        <div className="grid grid-cols-1 gap-2 py-2 sm:grid-cols-3">
          <div className="border-border/60 bg-muted/30 rounded-xl border p-2.5">
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
              <DollarSign className="size-3.5 text-emerald-400" />
              <span>Ngân sách</span>
            </div>
            <p className="mt-1 text-xs font-bold text-emerald-400 sm:text-sm">
              {job.budget}
            </p>
          </div>

          <div className="border-border/60 bg-muted/30 rounded-xl border p-2.5">
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
              <MapPin className="text-primary size-3.5" />
              <span>Địa điểm</span>
            </div>
            <p className="text-foreground mt-1 text-xs font-bold sm:text-sm">
              {job.location}
            </p>
          </div>

          <div className="border-border/60 bg-muted/30 rounded-xl border p-2.5">
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
              <Clock className="size-3.5 text-amber-400" />
              <span>Hạn nộp hồ sơ</span>
            </div>
            <p className="text-foreground mt-1 text-xs font-bold sm:text-sm">
              {job.deadline}
            </p>
          </div>
        </div>

        {/* Job Description */}
        <div className="space-y-3 pt-2">
          <div>
            <h4 className="text-foreground text-xs font-bold tracking-wider uppercase">
              Mô tả công việc
            </h4>
            <p className="text-foreground/80 mt-1.5 text-xs leading-relaxed sm:text-sm">
              {job.description || job.requirements}
            </p>
          </div>

          {/* Requirements */}
          <div>
            <h4 className="text-foreground text-xs font-bold tracking-wider uppercase">
              Yêu cầu ứng viên
            </h4>
            <p className="text-foreground/80 mt-1.5 text-xs sm:text-sm">
              {job.requirements}
            </p>
          </div>

          {/* Perks */}
          {job.perks && job.perks.length > 0 && (
            <div>
              <h4 className="text-foreground flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                <Gift className="text-primary size-3.5" />
                Quyền lợi & Đãi ngộ
              </h4>
              <ul className="text-foreground/85 mt-2 space-y-1.5 text-xs sm:text-sm">
                {job.perks.map((perk, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <Check className="size-2.5 stroke-[3]" />
                    </span>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-border/60 mt-4 flex items-center justify-end gap-2 border-t pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-9 cursor-pointer rounded-xl text-xs"
          >
            Đóng
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => {
              onOpenChange(false);
              onApply(job);
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 cursor-pointer rounded-xl text-xs font-bold shadow-sm"
          >
            <Send className="mr-1.5 size-3.5" />
            Ứng tuyển ngay
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
