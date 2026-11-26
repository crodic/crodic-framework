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

export function FeaturesHighlight() {
  const t = useTranslations("Landing.features");

  const getFeatureIcon = (iconName: HighlightFeatureItem["iconName"]) => {
    switch (iconName) {
      case "folder":
        return (
          <FolderHeart className="text-primary size-5" aria-hidden="true" />
        );
      case "book":
        return <BookOpen className="text-primary size-5" aria-hidden="true" />;
      case "calendar":
        return <Calendar className="text-primary size-5" aria-hidden="true" />;
      case "trophy":
        return <Trophy className="text-primary size-5" aria-hidden="true" />;
      case "users":
        return <Users className="text-primary size-5" aria-hidden="true" />;
      case "shield":
        return (
          <ShieldCheck className="text-primary size-5" aria-hidden="true" />
        );
      default:
        return (
          <FolderHeart className="text-primary size-5" aria-hidden="true" />
        );
    }
  };

  const featureKeys: Record<
    HighlightFeatureItem["id"],
    {
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
      title: "items.portfolio.title",
      desc: "items.portfolio.description",
    },
    encyclopedia: {
      title: "items.encyclopedia.title",
      desc: "items.encyclopedia.description",
    },
    events: {
      title: "items.events.title",
      desc: "items.events.description",
    },
    ranking: {
      title: "items.ranking.title",
      desc: "items.ranking.description",
    },
    community: {
      title: "items.community.title",
      desc: "items.community.description",
    },
    protection: {
      title: "items.protection.title",
      desc: "items.protection.description",
    },
  };

  return (
    <section
      id="features"
      className="border-border scroll-mt-16 border-t py-12 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 space-y-2 sm:mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {t("title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed text-pretty sm:text-base">
            {t("subtitle")}
          </p>
        </div>

        <ul className="grid gap-x-12 sm:grid-cols-2">
          {HIGHLIGHT_FEATURES.map((feature) => {
            const keys = featureKeys[feature.id];
            return (
              <li key={feature.id} className="border-border border-t">
                <Link
                  href={feature.href}
                  className="group hover:bg-muted/40 flex items-start gap-3 rounded-md py-4 transition-colors sm:gap-4 sm:py-5"
                >
                  <span className="mt-0.5 shrink-0">
                    {getFeatureIcon(feature.iconName)}
                  </span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <h3 className="group-hover:text-primary text-base font-semibold">
                      {t(keys.title)}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
                      {t(keys.desc)}
                    </p>
                  </div>
                  <ArrowUpRight
                    className="text-muted-foreground group-hover:text-primary mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
