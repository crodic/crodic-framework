"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import {
  getCosplayers,
  type CosplayerSummaryResDto,
} from "@/services/cosplayer";
import { CosplayerCard } from "./cosplayer-card";
import { Skeleton } from "@/components/ui/skeleton";

interface CosplayerShowcaseProps {
  initialCosplayers?: CosplayerSummaryResDto[];
}

export function CosplayerShowcase({
  initialCosplayers,
}: CosplayerShowcaseProps) {
  const t = useTranslations("Landing.cosplayers");
  const { data: cosplayersResponse, isLoading } = useQuery({
    queryKey: ["landing-cosplayers"],
    queryFn: () => getCosplayers({ limit: 4 }),
    initialData: initialCosplayers
      ? {
          data: initialCosplayers,
          meta: {
            itemsPerPage: 4,
            totalItems: initialCosplayers.length,
            currentPage: 1,
            totalPages: 1,
            sortBy: [],
          },
        }
      : undefined,
    staleTime: 5 * 60 * 1000,
  });

  const cosplayers = cosplayersResponse?.data || initialCosplayers || [];

  return (
    <section
      id="cosplayers"
      className="border-border scroll-mt-16 border-t py-12 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-6 flex flex-col justify-between gap-3 sm:mb-8 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-foreground text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              {t("title")}
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed text-pretty sm:text-base">
              {t("subtitle")}
            </p>
          </div>

          <Link
            href="/ranking"
            className="text-primary inline-flex min-h-11 w-fit items-center gap-2 rounded-md text-sm font-medium underline-offset-4 hover:underline sm:shrink-0"
          >
            <span>{t("viewAll")}</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Cosplayer Cards Grid */}
        {isLoading && cosplayers.length === 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : cosplayers.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {cosplayers.map((cosplayer) => (
              <CosplayerCard key={cosplayer.id} cosplayer={cosplayer} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
