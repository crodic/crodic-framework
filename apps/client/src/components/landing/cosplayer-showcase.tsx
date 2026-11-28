"use client";

import React from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight, CheckCircle2, Users } from "lucide-react";
import {
  getCosplayers,
  type CosplayerSummaryResDto,
} from "@/services/cosplayer";
import { CosplayerCard } from "./cosplayer-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

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
      className="border-border/60 relative scroll-mt-16 overflow-hidden border-t py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Sticky Split-Screen Layout (Inspired by Coser.ID Featured Spotlight) */}
        <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:gap-14">
          {/* Left Sticky Editorial Column */}
          <div className="w-full space-y-6 lg:sticky lg:top-24 lg:w-5/12 xl:w-1/3">
            <div className="relative">
              <span
                className="text-foreground/[0.04] dark:text-foreground/[0.06] pointer-events-none absolute -top-6 left-0 text-6xl font-black tracking-widest uppercase select-none sm:text-7xl"
                aria-hidden="true"
              >
                CREATORS
              </span>

              <div className="relative z-10 space-y-3">
                <span className="border-primary/25 bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-xs font-semibold tracking-wider uppercase">
                  <Users className="size-3.5" aria-hidden="true" />
                  {t("badge")}
                </span>

                <h2 className="text-foreground relative block text-3xl leading-tight font-extrabold tracking-tight text-balance uppercase sm:text-4xl">
                  {t("title")}
                  <span className="bg-primary mt-2 block h-1 w-20 rounded-full" />
                </h2>
              </div>
            </div>

            <p className="text-muted-foreground text-base leading-relaxed text-pretty">
              {t("subtitle")}
            </p>

            {/* Quick Value Checkmarks */}
            <ul className="text-foreground/90 space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="text-primary size-4 shrink-0" />
                <span>{t("point1")}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="text-primary size-4 shrink-0" />
                <span>{t("point2")}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="text-primary size-4 shrink-0" />
                <span>{t("point3")}</span>
              </li>
            </ul>

            <div className="pt-2">
              <Button asChild variant="outline" className="gap-2 font-semibold">
                <Link href="/ranking">
                  <span>{t("viewAll")}</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Grid Column (2x2 Portrait/Profile Cards) */}
          <div className="w-full lg:w-7/12 xl:w-2/3">
            {isLoading && cosplayers.length === 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-xl" />
                ))}
              </div>
            ) : cosplayers.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {cosplayers.map((cosplayer) => (
                  <CosplayerCard key={cosplayer.id} cosplayer={cosplayer} />
                ))}
              </div>
            ) : (
              /* Fallback Visual Showcase Cards when DB has no cosplayers */
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {[
                  {
                    name: "Acheron Studio",
                    role: "Pro Cosplayer",
                    img: "/landing/art-acheron.jpg",
                  },
                  {
                    name: "Kafka Noir",
                    role: "Character Artist",
                    img: "/landing/art-kafka.jpg",
                  },
                ].map((demo) => (
                  <div
                    key={demo.name}
                    className="border-border/70 bg-card relative aspect-[4/5] overflow-hidden rounded-xl border shadow-sm"
                  >
                    <Image
                      src={demo.img}
                      alt={demo.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />
                    <div className="absolute inset-x-4 bottom-4 text-white">
                      <p className="text-primary text-xs font-semibold uppercase">
                        {demo.role}
                      </p>
                      <h3 className="text-lg font-bold">{demo.name}</h3>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
