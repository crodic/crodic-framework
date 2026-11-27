"use client";

import React from "react";
import Image from "next/image";
import {
  FolderHeart,
  BookOpen,
  Calendar,
  Trophy,
  Users,
  ShieldCheck,
  ArrowUpRight,
  Layers,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  HIGHLIGHT_FEATURES,
  type HighlightFeatureItem,
} from "@/config/landing";
import { motion } from "@/components/ui/motion-primitives";
import { cn } from "@/lib/utils";

export function FeaturesHighlight() {
  const t = useTranslations("Landing.features");

  const getFeatureIcon = (iconName: HighlightFeatureItem["iconName"]) => {
    switch (iconName) {
      case "folder":
        return <FolderHeart className="size-4" aria-hidden="true" />;
      case "book":
        return <BookOpen className="size-4" aria-hidden="true" />;
      case "calendar":
        return <Calendar className="size-4" aria-hidden="true" />;
      case "trophy":
        return <Trophy className="size-4" aria-hidden="true" />;
      case "users":
        return <Users className="size-4" aria-hidden="true" />;
      case "shield":
        return <ShieldCheck className="size-4" aria-hidden="true" />;
      default:
        return <FolderHeart className="size-4" aria-hidden="true" />;
    }
  };

  const featureKeys: Record<
    HighlightFeatureItem["id"],
    {
      badge:
        | "items.portfolio.badge"
        | "items.encyclopedia.badge"
        | "items.events.badge"
        | "items.ranking.badge"
        | "items.community.badge"
        | "items.protection.badge";
      title:
        | "items.portfolio.title"
        | "items.encyclopedia.title"
        | "items.events.title"
        | "items.ranking.title"
        | "items.community.title"
        | "items.protection.title";
      desc:
        | "items.portfolio.description"
        | "items.encyclopedia.description"
        | "items.events.description"
        | "items.ranking.description"
        | "items.community.description"
        | "items.protection.description";
    }
  > = {
    portfolio: {
      badge: "items.portfolio.badge",
      title: "items.portfolio.title",
      desc: "items.portfolio.description",
    },
    encyclopedia: {
      badge: "items.encyclopedia.badge",
      title: "items.encyclopedia.title",
      desc: "items.encyclopedia.description",
    },
    events: {
      badge: "items.events.badge",
      title: "items.events.title",
      desc: "items.events.description",
    },
    ranking: {
      badge: "items.ranking.badge",
      title: "items.ranking.title",
      desc: "items.ranking.description",
    },
    community: {
      badge: "items.community.badge",
      title: "items.community.title",
      desc: "items.community.description",
    },
    protection: {
      badge: "items.protection.badge",
      title: "items.protection.title",
      desc: "items.protection.description",
    },
  };

  return (
    <section
      id="features"
      className="bg-muted/20 relative scroll-mt-16 overflow-hidden py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Watermarked Editorial Header (Inspired by Coser.ID) */}
        <div className="relative mb-12 text-center sm:mb-16">
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
            aria-hidden="true"
          >
            <span className="text-foreground/[0.04] dark:text-foreground/[0.06] text-6xl font-black tracking-widest whitespace-nowrap uppercase sm:text-8xl lg:text-9xl">
              FEATURES
            </span>
          </div>

          <div className="relative z-10 mx-auto max-w-3xl space-y-3">
            <span className="border-primary/25 bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-xs font-semibold tracking-wider uppercase">
              <Layers className="size-3.5" aria-hidden="true" />
              {t("badge")}
            </span>

            <div>
              <h2 className="text-foreground relative inline-block text-3xl font-extrabold tracking-tight uppercase sm:text-4xl lg:text-5xl">
                {t("title")}
                <span className="bg-primary absolute -bottom-2 left-1/3 h-1 w-1/3 rounded-full" />
              </h2>
            </div>

            <p className="text-muted-foreground mx-auto max-w-2xl pt-2 text-base leading-relaxed text-pretty sm:text-lg">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* Staggered Visual Showcase Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {HIGHLIGHT_FEATURES.map((feature, index) => {
            const keys = featureKeys[feature.id];
            const isMiddleColumn = index % 3 === 1;

            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className={cn(isMiddleColumn && "lg:mt-8")}
              >
                <Link
                  href={feature.href}
                  className="group border-border/70 bg-card hover:border-primary/50 relative flex flex-col overflow-hidden rounded-xl border shadow-xs transition-all duration-300 hover:shadow-lg"
                >
                  {/* Visual Image Header */}
                  <div className="bg-muted relative aspect-[16/10] w-full overflow-hidden">
                    <Image
                      src={feature.image}
                      alt={t(keys.title)}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-top"
                    />
                    <div
                      className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent"
                      aria-hidden="true"
                    />

                    {/* Top Floating Pill Badge */}
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-md border border-white/15 bg-black/65 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                      <span className="text-primary">
                        {getFeatureIcon(feature.iconName)}
                      </span>
                      <span>{t(keys.badge)}</span>
                    </div>

                    {/* Action Arrow Corner */}
                    <div className="group-hover:bg-primary group-hover:text-primary-foreground absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-md border border-white/15 bg-black/50 text-white backdrop-blur-md transition-colors">
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </div>

                    {/* Title over bottom of visual */}
                    <div className="absolute inset-x-4 bottom-3 z-10">
                      <h3 className="text-lg font-bold tracking-tight text-white drop-shadow-xs">
                        {t(keys.title)}
                      </h3>
                    </div>
                  </div>

                  {/* Description Body */}
                  <div className="p-4 sm:p-5">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {t(keys.desc)}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
