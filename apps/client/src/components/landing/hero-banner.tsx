"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { ArrowRight, Compass, Layers } from "lucide-react";
import { motion } from "@/components/ui/motion-primitives";

const HERO_SPEC_KEYS = ["hd", "capacity", "copyright"] as const;

export function HeroBanner() {
  const t = useTranslations("Landing.hero");

  return (
    <section className="bg-background border-border/60 relative overflow-hidden border-b">
      {/* Ambient Background Light Orbs */}
      <div
        className="bg-primary/15 pointer-events-none absolute -top-32 -left-32 z-0 size-96 rounded-full blur-3xl"
        aria-hidden="true"
      />
      <div
        className="bg-primary/10 pointer-events-none absolute right-1/4 bottom-0 z-0 size-80 rounded-full blur-3xl"
        aria-hidden="true"
      />

      {/* Panoramic Hero Visual */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-72 overflow-hidden select-none sm:inset-y-0 sm:h-auto lg:left-auto lg:w-[64%]"
        aria-hidden="true"
      >
        <Image
          src="/landing/hero-banner.webp"
          alt=""
          fill
          priority
          unoptimized
          className="object-cover object-[65%_38%] sm:object-[75%_center] lg:object-right"
        />

        <div className="from-background via-background/90 absolute inset-y-0 left-0 hidden w-4/5 bg-linear-to-r to-transparent sm:block lg:w-3/4" />
        <div className="from-background via-background/70 absolute inset-x-0 bottom-0 h-28 bg-linear-to-t to-transparent sm:h-36" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-center pt-64 pb-12 sm:min-h-[540px] sm:py-20 lg:min-h-[620px]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl lg:max-w-2xl"
          >
            {/* Editorial Pill Badge */}
            <div className="border-primary/25 bg-primary/10 text-primary mb-5 inline-flex items-center gap-2 rounded-md border px-3 py-1 text-xs font-semibold tracking-wider uppercase">
              <Layers className="size-3.5" aria-hidden="true" />
              <span>{t("badge")}</span>
            </div>

            <h1 className="text-foreground text-4xl leading-[1.1] font-extrabold tracking-tight text-balance uppercase sm:text-5xl lg:text-6xl">
              {t("titleLead")}{" "}
              <span className="text-primary relative inline-block">
                Cosplay
                <span className="bg-primary absolute -bottom-1 left-0 h-1 w-1/2 rounded-full" />
              </span>{" "}
              {t("titleTrail")}
            </h1>

            <p className="text-muted-foreground mt-5 max-w-xl text-base leading-relaxed text-pretty sm:text-lg">
              {t("subtitle")}
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="mt-7 flex flex-wrap items-center gap-3 sm:mt-8">
              <Button
                asChild
                size="lg"
                className="h-11 gap-2 px-6 font-semibold"
              >
                <a href="#albums">
                  <span>{t("exploreNow")}</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-background/80 h-11 px-6 font-semibold backdrop-blur-xs"
              >
                <Link href="/auth/sign-up">{t("signUp")}</Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-foreground hover:text-primary h-11 gap-1.5 px-4 font-medium"
              >
                <Link href="/tags">
                  <Compass className="size-4" aria-hidden="true" />
                  <span>{t("viewTags")}</span>
                </Link>
              </Button>
            </div>

            {/* Platform Real Technical Specifications & Value Commitments */}
            <div className="border-border/70 mt-10 grid max-w-xl grid-cols-1 gap-4 border-t pt-6 sm:grid-cols-3 sm:gap-6">
              {HERO_SPEC_KEYS.map((key) => (
                <div key={key} className="space-y-0.5">
                  <p className="text-foreground text-lg font-extrabold tracking-tight sm:text-xl">
                    {t(`specs.${key}.value`)}
                  </p>
                  <p className="text-muted-foreground text-xs font-medium">
                    {t(`specs.${key}.label`)}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
