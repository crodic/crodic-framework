"use client";

import React, { useMemo, useState } from "react";
import { Briefcase, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobFilterId, JobItem } from "./jobs-types";
import { MOCK_JOBS } from "./jobs-data";
import { JobsFilterBar } from "./jobs-filter-bar";
import { JobCard } from "./job-card";
import { JobDetailDialog } from "./job-detail-dialog";
import { JobApplyDialog } from "./job-apply-dialog";
import { PostJobDialog } from "./post-job-dialog";

export function JobsView() {
  const [selectedTagId, setSelectedTagId] = useState<JobFilterId>("all");
  const [jobs, setJobs] = useState<JobItem[]>(MOCK_JOBS);
  const [detailJob, setDetailJob] = useState<JobItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [applyJob, setApplyJob] = useState<JobItem | null>(null);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);

  // Filter jobs based on active tag
  const filteredJobs = useMemo(() => {
    if (selectedTagId === "all") return jobs;
    return jobs.filter((j) => j.tags.includes(selectedTagId));
  }, [selectedTagId, jobs]);

  const handleViewDetails = (job: JobItem) => {
    setDetailJob(job);
    setIsDetailOpen(true);
  };

  const handleApply = (job: JobItem) => {
    setApplyJob(job);
    setIsApplyOpen(true);
  };

  const handleJobCreated = (newJob: JobItem) => {
    setJobs((prev) => [newJob, ...prev]);
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      {/* 1. Page Header with Title & Post Job CTA */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="text-foreground text-xl font-extrabold tracking-tight sm:text-2xl lg:text-3xl">
          Kết nối thương hiệu & nhận Job chuyên nghiệp
        </h1>

        <Button
          type="button"
          onClick={() => setIsPostJobOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 h-9 shrink-0 cursor-pointer self-start rounded-xl px-4 text-xs font-bold shadow-md transition-all hover:scale-[1.02] sm:h-10 sm:self-auto sm:px-5 sm:text-sm"
        >
          <Plus className="mr-1.5 size-4" />
          <span>Đăng tin tuyển dụng</span>
        </Button>
      </div>

      {/* 2. Filter Chips Bar */}
      <section aria-label="Bộ lọc tin tuyển dụng">
        <JobsFilterBar
          selectedTagId={selectedTagId}
          onSelectTag={setSelectedTagId}
        />
      </section>

      {/* 3. Job Cards Grid (2 columns on desktop, 1 column on mobile) */}
      <section aria-label="Danh sách tin tuyển dụng">
        {filteredJobs.length > 0 ? (
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
              Chưa có tin tuyển dụng phù hợp
            </h3>
            <p className="text-muted-foreground mt-1 max-w-sm text-xs">
              Không tìm thấy tin tuyển dụng nào theo bộ lọc đã chọn. Hãy thử
              chọn danh mục khác.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTagId("all")}
              className="mt-4 cursor-pointer rounded-xl"
            >
              Xem tất cả tin tuyển dụng
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
