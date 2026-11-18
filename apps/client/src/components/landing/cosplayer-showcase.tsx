"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getCosplayers } from "@/services/cosplayer";
import { CosplayerCard } from "./cosplayer-card";
import { Skeleton } from "@/components/ui/skeleton";

export function CosplayerShowcase() {
  const t = useTranslations("Landing.cosplayers");
  const { data: cosplayersResponse, isLoading } = useQuery({
    queryKey: ["landing-cosplayers"],
    queryFn: () => getCosplayers({ limit: 4 }),
  });

  const cosplayers = cosplayersResponse?.data || [];

  return (
    <section id="cosplayers" className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-6 flex items-center justify-between sm:mb-8">
          <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            {t("title")}
          </h2>
        </div>

        {/* Cosplayer Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : cosplayers.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {cosplayers.map((cosplayer) => (
              <CosplayerCard key={cosplayer.id} cosplayer={cosplayer} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
