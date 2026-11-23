"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Flame } from "lucide-react";
import {
  getCosplayers,
  type CosplayerSummaryResDto,
} from "@/services/cosplayer";
import { CosplayerCard } from "./cosplayer-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal } from "./scroll-reveal";

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
    <section id="cosplayers" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <ScrollReveal className="mb-10 flex flex-col justify-between gap-4 sm:mb-12 sm:flex-row sm:items-end">
          <div>
            <div className="border-primary/30 bg-primary/10 text-primary mb-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase">
              <Flame className="size-3.5" />
              <span>{t("badge")}</span>
            </div>
            <h2 className="text-foreground text-3xl font-black tracking-tight sm:text-4xl">
              {t("title")}
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm sm:text-base">
              {t("subtitle")}
            </p>
          </div>

          <Link
            href="/ranking"
            className="group text-primary hover:text-primary/80 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors sm:shrink-0"
          >
            <span>{t("viewAll")}</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </ScrollReveal>

        {/* Cosplayer Cards Grid */}
        {isLoading && cosplayers.length === 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : cosplayers.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {cosplayers.map((cosplayer, idx) => (
              <ScrollReveal key={cosplayer.id} delay={idx * 0.08}>
                <CosplayerCard cosplayer={cosplayer} />
              </ScrollReveal>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
