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
          <div className="border-primary/30 bg-primary/10 text-primary mb-3.5 inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold tracking-wide uppercase">
            <span className="bg-primary size-1.5 rounded-full" />
            {t("badge")}
          </div>

          <h2 className="text-foreground text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            {t("title")}
          </h2>

          <p className="text-muted-foreground mt-4 text-base leading-relaxed sm:text-lg">
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
                  className="group border-primary/20 bg-card/40 hover:border-primary/60 hover:bg-card/75 hover:shadow-primary/10 relative flex h-full flex-col justify-between rounded-2xl border p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-7"
                >
                  {/* Subtle top glow highlight */}
                  <div
                    className="from-primary/15 via-primary/5 pointer-events-none absolute inset-x-0 top-0 h-28 rounded-t-2xl bg-gradient-to-b to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    aria-hidden="true"
                  />

                  <div className="relative">
                    {/* Top Row: Icon + Badge + Arrow */}
                    <div className="mb-5 flex items-center justify-between">
                      <div className="border-primary/25 bg-primary/10 group-hover:bg-primary/20 inline-flex size-11 items-center justify-center rounded-xl border shadow-xs transition-colors">
                        {getFeatureIcon(feature.iconName)}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="border-border/60 bg-muted/60 text-muted-foreground group-hover:border-primary/30 group-hover:text-primary rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors">
                          {t(keys.badge)}
                        </span>
                        <div className="text-muted-foreground group-hover:text-primary flex size-7 items-center justify-center rounded-full opacity-60 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100">
                          <ArrowUpRight className="size-4" />
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-foreground group-hover:text-primary text-xl font-bold tracking-tight transition-colors">
                      {t(keys.title)}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                      {t(keys.desc)}
                    </p>
                  </div>

                  {/* Bottom animated accent bar */}
                  <div
                    className="bg-primary/30 group-hover:bg-primary mt-6 h-0.5 w-10 rounded-full transition-all duration-300 group-hover:w-20"
                    aria-hidden="true"
                  />
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
