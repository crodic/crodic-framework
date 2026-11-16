"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getJobs, type JobSummaryResDto } from "@/services/jobs";

export function RecruitmentWidget() {
  const t = useTranslations("Home.recruitmentWidget");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: jobsRes, isLoading } = useQuery({
    queryKey: ["public-recruitment-jobs"],
    queryFn: () => getJobs({ limit: 5, sort: "-createdAt" }),
    staleTime: 60 * 1000,
  });

  const allJobs = jobsRes?.data || [];
  const filteredJobs = allJobs.filter(
    (job: JobSummaryResDto) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.brandName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="border-border/70 bg-card/60 mt-5 gap-0 rounded-2xl p-4 shadow-xs backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-foreground flex items-center gap-1.5 text-sm font-bold">
          <span>{t("title")}</span>
          <span role="img" aria-label="Tuyển mẫu">
            🛠️
          </span>
        </h3>
      </div>

      {/* Internal Filter Search */}
      <div className="relative mt-2 mb-2.5">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
        <Input
          type="search"
          placeholder={t("searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-border/70 bg-background/50 focus-visible:ring-primary/40 h-8 rounded-lg pr-3 pl-8 text-[11px]"
        />
      </div>

      {/* Projects List */}
      <CardContent className="divide-border/30 divide-y p-0">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Sparkles className="text-muted-foreground size-4 animate-spin" />
          </div>
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job: JobSummaryResDto) => (
            <Link
              key={job.id}
              href="/jobs"
              className="group hover:bg-muted/40 flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-2.5 transition-colors first:pt-1 last:pb-1"
            >
              {/* Thumbnail */}
              <div className="border-border/80 bg-muted relative size-10 shrink-0 overflow-hidden rounded-lg border">
                <Image
                  src={job.thumbnailUrl || job.brandLogoUrl || "/logo.png"}
                  alt={job.title}
                  fill
                  sizes="40px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <h4 className="text-foreground group-hover:text-primary truncate text-xs font-bold transition-colors">
                  {job.title}
                </h4>
                <p className="text-muted-foreground mt-0.5 truncate text-[10px]">
                  {job.budgetLabel} • {job.locationLabel}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-muted-foreground py-6 text-center text-xs">
            {t("noJobs")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
