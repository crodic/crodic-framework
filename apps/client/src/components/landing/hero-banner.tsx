"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { HERO_STATS } from "@/config/landing";
import { ScrollReveal } from "./scroll-reveal";

export function HeroBanner() {
  const t = useTranslations("Landing.hero");

  const statLabels: Record<
    string,
    "stats.cosplayers" | "stats.artworks" | "stats.engagements"
  > = {
    cosplayers: "stats.cosplayers",
    artworks: "stats.artworks",
    engagements: "stats.engagements",
  };

  return (
    <section className="bg-background relative overflow-hidden pt-8 pb-14 sm:pt-12 sm:pb-20">
      {/* Hero Background Image */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-0 w-full overflow-hidden select-none lg:w-[68%]"
        aria-hidden="true"
      >
        <Image
          src="/landing/hero-banner.png"
          alt="Kosume Cosplay Champions"
          fill
          priority
          sizes="(min-width: 1024px) 70vw, 100vw"
          className="object-cover object-[75%_center] lg:object-right"
        />

        {/* Seamless edge blend into the dark background */}
        <div className="from-background via-background/85 absolute inset-y-0 left-0 w-full bg-gradient-to-r to-transparent sm:w-2/3 lg:w-1/2" />
        <div className="from-background via-background/90 absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Hero Content Area */}
        <div className="flex min-h-[420px] flex-col justify-center sm:min-h-[460px] lg:min-h-[500px]">
          <ScrollReveal className="max-w-xl py-6 text-left sm:py-10 lg:max-w-2xl">
            <h1 className="text-foreground text-4xl leading-[1.14] font-black tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {t("titleLead")} <br />
              <span className="text-primary">Cosplay</span> {t("titleTrail")}
            </h1>

            <p className="text-muted-foreground mt-5 max-w-lg text-sm leading-relaxed sm:mt-6 sm:text-base lg:text-lg">
              {t("subtitle")}
            </p>

            {/* Action Buttons */}
            <div className="mt-7 flex flex-wrap items-center gap-3.5 sm:mt-8 sm:gap-4">
              <Button
                asChild
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 cursor-pointer rounded-lg px-6 text-sm font-semibold shadow-xs transition-colors sm:h-12 sm:px-7 sm:text-base"
              >
                <a href="#albums">{t("exploreNow")}</a>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-border bg-card/60 hover:bg-muted text-foreground h-11 cursor-pointer rounded-lg px-6 text-sm font-medium backdrop-blur-sm transition-colors sm:h-12 sm:px-7 sm:text-base"
              >
                <Link href="/auth/sign-up">{t("signUp")}</Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-muted-foreground hover:text-primary hover:bg-primary/10 h-11 cursor-pointer rounded-lg px-4 text-sm font-medium transition-colors sm:h-12"
              >
                <Link href="/tags">{t("viewTags")}</Link>
              </Button>
            </div>
          </ScrollReveal>
        </div>

        {/* Stats Row */}
        <ScrollReveal
          delay={0.2}
          className="border-border/20 mt-8 border-t pt-6 sm:mt-12 sm:pt-8"
        >
          <div className="mx-auto grid max-w-2xl grid-cols-3 gap-4 text-center sm:max-w-3xl sm:gap-8">
            {HERO_STATS.map((stat) => (
              <div key={stat.key} className="flex flex-col items-center">
                <span className="text-foreground text-2xl font-black tracking-tight tabular-nums sm:text-3xl lg:text-4xl">
                  {stat.value}
                </span>
                <span className="text-muted-foreground mt-1 text-xs font-medium sm:text-sm">
                  {t(statLabels[stat.key] || "stats.cosplayers")}
                </span>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
