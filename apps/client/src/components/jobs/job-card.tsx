"use client";

import React from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import type { JobSummaryResDto } from "@/services/jobs";

export interface JobCardProps {
  job: JobSummaryResDto;
  onViewDetails: (job: JobSummaryResDto) => void;
  onApply: (job: JobSummaryResDto) => void;
}

export function JobCard({ job, onViewDetails, onApply }: JobCardProps) {
  const t = useTranslations("Jobs.card");

  return (
    <article className="group border-border/70 bg-card hover:border-primary/40 relative flex flex-col justify-between rounded-2xl border p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-2.5">
          <div
            className={`ring-border/80 relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 sm:size-8 ${
              job.brandColor || "bg-muted"
            }`}
          >
            {job.brandLogoUrl ? (
              <Image
                src={job.brandLogoUrl}
                alt={job.brandName}
                fill
                sizes="32px"
                className="object-cover"
              />
            ) : (
              <span className="text-[10px] font-black text-white">
                {job.brandInitials || job.brandName.slice(0, 2)}
              </span>
            )}
          </div>

          <div className="flex min-w-0 items-center gap-1.5">
            <span className="text-foreground truncate text-xs font-bold sm:text-sm">
              {job.brandName}
            </span>
            {job.isVerified && (
              <span
                className="inline-flex size-3.5 items-center justify-center rounded-full bg-blue-500 text-white shadow-2xs sm:size-4"
                title={t("verified")}
              >
                <Check className="size-2 stroke-[3] sm:size-2.5" />
              </span>
            )}
          </div>
        </div>

        {/* Job Title */}
        <h3
          onClick={() => onViewDetails(job)}
          className="text-foreground hover:text-primary mt-2.5 line-clamp-2 cursor-pointer text-sm leading-snug font-bold transition-colors sm:text-base"
          title={job.title}
        >
          {job.title}
        </h3>

        {/* Info Rows */}
        <div className="mt-3 space-y-1.5 text-xs">
          {/* Budget */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-muted-foreground font-medium">
              {t("budget")}
            </span>
            <span className="rounded-md border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 sm:text-xs">
              {job.budgetLabel}
            </span>
          </div>

          {/* Location & Deadline */}
          <div className="text-muted-foreground flex flex-wrap items-center gap-1 text-[11px] font-medium sm:text-xs">
            <span>{job.locationLabel}</span>
            <span>•</span>
            <span>
              {t("deadline")}:{" "}
              <strong className="text-foreground/90 font-semibold">
                {job.deadlineLabel}
              </strong>
            </span>
          </div>

          {/* Category */}
          <div className="text-muted-foreground line-clamp-1 text-[11px] sm:text-xs">
            <span className="text-foreground/80 font-medium">
              {job.categoryLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Action CTA Buttons */}
      <div className="border-border/40 mt-4 flex items-center justify-end gap-2 border-t pt-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(job)}
          className="h-8 cursor-pointer rounded-xl px-3 text-xs font-semibold"
        >
          {t("viewDetails")}
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={() => onApply(job)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 cursor-pointer rounded-xl px-3.5 text-xs font-bold transition-transform hover:scale-[1.02]"
        >
          {t("applyNow")}
        </Button>
      </div>
    </article>
  );
}
