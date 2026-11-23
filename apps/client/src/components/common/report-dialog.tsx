"use client";

import React, { useState } from "react";
import { Flag, Loader2, ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/store/use-auth-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { submitContentReport, type ReportTargetType } from "@/services/reports";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: "post" | "user";
  targetId: string;
  targetTitle?: string;
}

const POST_REASONS = [
  "spam",
  "inappropriate",
  "harassment",
  "copyright",
  "misinformation",
  "other",
] as const;

const USER_REASONS = [
  "impersonation",
  "spam",
  "inappropriate",
  "harassment",
  "other",
] as const;

type ReportReasonKey =
  (typeof POST_REASONS)[number] | (typeof USER_REASONS)[number];

export function ReportDialog({
  open,
  onOpenChange,
  targetType,
  targetId,
  targetTitle,
}: ReportDialogProps) {
  const t = useTranslations("Report");
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [selectedReason, setSelectedReason] = useState<ReportReasonKey | "">(
    ""
  );
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasons = targetType === "post" ? POST_REASONS : USER_REASONS;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSelectedReason("");
      setDescription("");
      setIsSubmitting(false);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.info(t("loginRequired"));
      const currentPath =
        typeof window !== "undefined" ? window.location.pathname : "/";
      router.push(`/auth/login?from=${encodeURIComponent(currentPath)}`);
      handleOpenChange(false);
      return;
    }

    if (!selectedReason) {
      toast.error(t("selectReason"));
      return;
    }

    const reasonLabel = t(`reasons.${selectedReason}`);

    try {
      setIsSubmitting(true);
      await submitContentReport({
        targetType,
        targetId,
        reason: reasonLabel,
        description: description.trim() || undefined,
      });

      toast.success(t("successMessage"));
      handleOpenChange(false);
    } catch (err: any) {
      const status = err?.response?.status || err?.status;
      if (status === 409) {
        toast.info(t("alreadyReported"));
        handleOpenChange(false);
      } else {
        toast.error(t("errorMessage"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const title =
    targetType === "post" ? t("reportPostTitle") : t("reportUserTitle");
  const desc =
    targetType === "post" ? t("reportPostDesc") : t("reportUserDesc");

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md gap-5 rounded-2xl p-6 sm:max-w-lg">
        <DialogHeader className="gap-1.5 text-left">
          <div className="flex items-center gap-2">
            <div className="bg-destructive/10 text-destructive flex size-9 shrink-0 items-center justify-center rounded-xl">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold sm:text-lg">
                {title}
              </DialogTitle>
              {targetTitle && (
                <p className="text-muted-foreground line-clamp-1 text-xs">
                  {targetTitle}
                </p>
              )}
            </div>
          </div>
          <DialogDescription className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
            {desc}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2.5">
            <Label className="text-foreground text-xs font-semibold sm:text-sm">
              {t("selectReason")} <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={selectedReason}
              onValueChange={(val) => setSelectedReason(val as ReportReasonKey)}
              className="gap-2"
            >
              {reasons.map((reasonKey) => {
                const itemId = `report-reason-${reasonKey}`;
                return (
                  <label
                    key={reasonKey}
                    htmlFor={itemId}
                    className={`border-border/60 hover:bg-accent/50 flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-colors ${
                      selectedReason === reasonKey
                        ? "border-primary/60 bg-primary/5"
                        : ""
                    }`}
                  >
                    <span className="text-foreground/90 text-xs font-medium sm:text-sm">
                      {t(`reasons.${reasonKey}`)}
                    </span>
                    <RadioGroupItem value={reasonKey} id={itemId} />
                  </label>
                );
              })}
            </RadioGroup>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="report-description"
              className="text-foreground/90 text-xs font-medium sm:text-sm"
            >
              {t("descriptionLabel")}
            </Label>
            <Textarea
              id="report-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descriptionPlaceholder")}
              maxLength={1000}
              rows={3}
              className="resize-none rounded-xl text-xs sm:text-sm"
            />
          </div>

          <DialogFooter className="mt-2 flex-row justify-end gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleOpenChange(false)}
              className="h-9 rounded-xl text-xs sm:text-sm"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={!selectedReason || isSubmitting}
              className="h-9 gap-1.5 rounded-xl text-xs font-semibold sm:text-sm"
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Flag className="size-3.5" />
              )}
              <span>{isSubmitting ? t("submitting") : t("submit")}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
