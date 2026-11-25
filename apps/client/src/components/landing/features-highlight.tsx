"use client";

import React from "react";
import {
  FolderHeart,
  BookOpen,
  Calendar,
  Trophy,
  Users,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  HIGHLIGHT_FEATURES,
  type HighlightFeatureItem,
} from "@/config/landing";
import { ScrollReveal } from "./scroll-reveal";

export function FeaturesHighlight() {
  const t = useTranslations("Landing.features");

  const getFeatureIcon = (iconName: HighlightFeatureItem["iconName"]) => {
    switch (iconName) {
      case "folder":
        return <FolderHeart className="text-primary size-5" />;
      case "book":
        return <BookOpen className="text-primary size-5" />;
      case "calendar":
        return <Calendar className="text-primary size-5" />;
      case "trophy":
        return <Trophy className="text-primary size-5" />;
      case "users":
        return <Users className="text-primary size-5" />;
      case "shield":
        return <ShieldCheck className="text-primary size-5" />;
      default:
        return <FolderHeart className="text-primary size-5" />;
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
    <section id="features" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading with ScrollReveal */}
        <ScrollReveal className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
          <h2 className="text-foreground text-3xl font-black tracking-tight text-balance sm:text-4xl lg:text-5xl">
            {t("title")}
          </h2>

          <p className="text-muted-foreground mt-4 text-base leading-relaxed text-pretty sm:text-lg">
            {t("subtitle")}
          </p>
        </ScrollReveal>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {HIGHLIGHT_FEATURES.map((feature, idx) => {
            const keys = featureKeys[feature.id];
            return (
              <ScrollReveal
                key={feature.id}
                delay={idx * 0.07}
                className="h-full"
              >
                <Link
                  href={feature.href}
                  className="group border-border/70 bg-card/50 hover:border-border hover:bg-card/80 relative flex h-full flex-col justify-between rounded-2xl border p-6 transition-colors sm:p-7"
                >
                  <div className="relative">
                    {/* Top Row: Icon + Badge + Arrow */}
                    <div className="mb-5 flex items-center justify-between">
                      <div className="border-border/60 bg-muted/50 group-hover:bg-primary/10 group-hover:border-primary/30 inline-flex size-11 items-center justify-center rounded-xl border transition-colors">
                        {getFeatureIcon(feature.iconName)}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="border-border/60 bg-muted/60 text-muted-foreground rounded-full border px-2.5 py-0.5 text-xs font-medium">
                          {t(keys.badge)}
                        </span>
                        <div className="text-muted-foreground group-hover:text-foreground flex size-7 items-center justify-center rounded-full opacity-60 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100">
                          <ArrowUpRight className="size-4" />
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-foreground group-hover:text-primary text-xl font-bold tracking-tight transition-colors">
                      {t(keys.title)}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground mt-3 text-sm leading-relaxed text-pretty">
                      {t(keys.desc)}
                    </p>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
