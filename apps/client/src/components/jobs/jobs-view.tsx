"use client";

import React, { useMemo, useState } from "react";
import { Briefcase, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { JobFilterId } from "./jobs-types";
import { JobsFilterBar } from "./jobs-filter-bar";
import { JobCard } from "./job-card";
import { JobDetailDialog } from "./job-detail-dialog";
import { JobApplyDialog } from "./job-apply-dialog";
import { PostJobDialog } from "./post-job-dialog";
import {
  getJobs,
  type JobSummaryResDto,
  type JobDetailResDto,
} from "@/services/jobs";

export function JobsView() {
  const t = useTranslations("Jobs");
  const [selectedTagId, setSelectedTagId] = useState<JobFilterId>("all");
  const [detailJob, setDetailJob] = useState<
    JobSummaryResDto | JobDetailResDto | null
  >(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [applyJob, setApplyJob] = useState<
    JobSummaryResDto | JobDetailResDto | null
  >(null);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);

  const {
    data: jobsResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["public-jobs"],
    queryFn: () => getJobs({ limit: 50 }),
  });

  const jobsList = useMemo(() => {
    return jobsResponse?.data || [];
  }, [jobsResponse]);

  // Filter jobs based on active tag
  const filteredJobs = useMemo(() => {
    if (selectedTagId === "all") return jobsList;
    const lower = selectedTagId.toLowerCase();
    return jobsList.filter(
      (j) =>
        j.categoryCode === selectedTagId ||
        j.locationFilterCode === selectedTagId ||
        j.filterTags?.some((t) => t.toLowerCase().includes(lower)) ||
        j.categoryLabel.toLowerCase().includes(lower) ||
        j.locationLabel.toLowerCase().includes(lower)
    );
  }, [selectedTagId, jobsList]);

  const handleViewDetails = (job: JobSummaryResDto) => {
    setDetailJob(job);
    setIsDetailOpen(true);
  };

  const handleApply = (job: JobSummaryResDto | JobDetailResDto) => {
    setApplyJob(job);
    setIsApplyOpen(true);
  };

  const handleJobCreated = () => {
    refetch();
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      {/* 1. Page Header with Title & Post Job CTA */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="text-foreground text-xl font-extrabold tracking-tight sm:text-2xl lg:text-3xl">
          {t("title")}
        </h1>

        <Button
          type="button"
          onClick={() => setIsPostJobOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 h-9 shrink-0 cursor-pointer self-start rounded-xl px-4 text-xs font-bold shadow-md transition-all hover:scale-[1.02] sm:h-10 sm:self-auto sm:px-5 sm:text-sm"
        >
          <Plus className="mr-1.5 size-4" />
          <span>{t("postJobBtn")}</span>
        </Button>
      </div>

      {/* 2. Filter Chips Bar */}
      <section aria-label={t("filterTitle")}>
        <JobsFilterBar
          selectedTagId={selectedTagId}
          onSelectTag={setSelectedTagId}
        />
      </section>

      {/* 3. Job Cards Grid (2 columns on desktop, 1 column on mobile) */}
      <section aria-label={t("listTitle")}>
        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Loader2 className="text-primary size-8 animate-spin" />
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 gap-3.5 sm:gap-4 lg:grid-cols-2">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onViewDetails={handleViewDetails}
                onApply={handleApply}
              />
            ))}
          </div>
        ) : (
          <div className="border-border/80 bg-card/50 flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
            <div className="bg-muted/80 text-muted-foreground flex size-14 items-center justify-center rounded-2xl">
              <Briefcase className="size-7" />
            </div>
            <h3 className="text-foreground mt-4 text-base font-bold">
              {t("emptyTitle")}
            </h3>
            <p className="text-muted-foreground mt-1 max-w-sm text-xs">
              {t("emptyDesc")}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTagId("all")}
              className="mt-4 cursor-pointer rounded-xl"
            >
              {t("viewAllBtn")}
            </Button>
          </div>
        )}
      </section>

      {/* 4. Detail Dialog */}
      <JobDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        job={detailJob}
        onApply={(j) => {
          setIsDetailOpen(false);
          handleApply(j);
        }}
      />

      {/* 5. Apply Dialog (shadcn Form + zod) */}
      <JobApplyDialog
        open={isApplyOpen}
        onOpenChange={setIsApplyOpen}
        job={applyJob}
      />

      {/* 6. Post Job Dialog (shadcn Form + zod) */}
      <PostJobDialog
        open={isPostJobOpen}
        onOpenChange={setIsPostJobOpen}
        onJobCreated={handleJobCreated}
      />
    </div>
  );
}
