"use client";

import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  ShieldCheck,
  Award,
  Image as ImageIcon,
  BookOpen,
  Quote,
  Check,
  ArrowRight,
  Users,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "@/components/ui/motion-primitives";

export function FounderMission() {
  const t = useTranslations("Landing.founder") as any;

  const valueCommitments = [
    {
      icon: ImageIcon,
      highlight: t("commitments.c1.highlight"),
      title: t("commitments.c1.title"),
      desc: t("commitments.c1.desc"),
    },
    {
      icon: Users,
      highlight: t("commitments.c2.highlight"),
      title: t("commitments.c2.title"),
      desc: t("commitments.c2.desc"),
    },
    {
      icon: ShieldCheck,
      highlight: t("commitments.c3.highlight"),
      title: t("commitments.c3.title"),
      desc: t("commitments.c3.desc"),
    },
  ];

  const journeySteps = [
    {
      step: "01",
      title: t("journey.s1.title"),
      desc: t("journey.s1.desc"),
    },
    {
      step: "02",
      title: t("journey.s2.title"),
      desc: t("journey.s2.desc"),
    },
    {
      step: "03",
      title: t("journey.s3.title"),
      desc: t("journey.s3.desc"),
    },
    {
      step: "04",
      title: t("journey.s4.title"),
      desc: t("journey.s4.desc"),
    },
  ];

  const coreValues = [
    {
      icon: ShieldCheck,
      title: t("values.protection.title"),
      desc: t("values.protection.desc"),
    },
    {
      icon: ImageIcon,
      title: t("values.quality.title"),
      desc: t("values.quality.desc"),
    },
    {
      icon: BookOpen,
      title: t("values.encyclopedia.title"),
      desc: t("values.encyclopedia.desc"),
    },
  ];

  const checklistItems = [
    {
      lead: t("consolidate.item1Lead"),
      highlight: t("consolidate.item1Highlight"),
      trail: t("consolidate.item1Trail"),
    },
    {
      lead: t("consolidate.item2Lead"),
      highlight: t("consolidate.item2Highlight"),
      trail: t("consolidate.item2Trail"),
    },
    {
      lead: t("consolidate.item3Lead"),
      highlight: t("consolidate.item3Highlight"),
      trail: t("consolidate.item3Trail"),
    },
    {
      lead: t("consolidate.item4Lead"),
      highlight: t("consolidate.item4Highlight"),
      trail: t("consolidate.item4Trail"),
    },
    {
      lead: t("consolidate.item5Lead"),
      highlight: t("consolidate.item5Highlight"),
      trail: t("consolidate.item5Trail"),
    },
  ];

  return (
    <section
      id="about"
      className="border-border/60 relative overflow-hidden border-t py-16 sm:py-24"
    >
      {/* Subtle ambient background glow */}
      <div
        className="bg-primary/10 pointer-events-none absolute -top-24 left-1/2 -z-10 size-96 -translate-x-1/2 rounded-full blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl space-y-20 px-4 sm:space-y-28 sm:px-6 lg:px-8">
        {/* Part 1: Asymmetric Editorial Showcase — "More Than Just Likes" */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Left Visual Showcase Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative lg:col-span-6"
          >
            <div className="border-border/70 bg-card relative aspect-[4/3] overflow-hidden rounded-xl border shadow-xl">
              <Image
                src="/landing/cosplay-work-6.jpg"
                alt={t("consolidate.cardTitle")}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute inset-x-5 bottom-5 text-white">
                <span className="bg-primary text-primary-foreground mb-2 inline-block rounded-md px-2.5 py-0.5 text-xs font-semibold">
                  {t("consolidate.cardBadge")}
                </span>
                <h3 className="text-xl font-bold sm:text-2xl">
                  {t("consolidate.cardTitle")}
                </h3>
                <p className="mt-1 text-xs text-white/80 sm:text-sm">
                  {t("consolidate.cardDesc")}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Editorial Checklist */}
          <div className="space-y-6 lg:col-span-6">
            <div className="relative">
              <span
                className="text-foreground/[0.04] dark:text-foreground/[0.06] pointer-events-none absolute -top-6 left-0 text-6xl font-black tracking-widest uppercase select-none sm:text-7xl"
                aria-hidden="true"
              >
                CONSOLIDATE
              </span>

              <div className="relative z-10 space-y-2.5">
                <span className="border-primary/25 bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-xs font-semibold tracking-wider uppercase">
                  <Award className="size-3.5" aria-hidden="true" />
                  {t("badge")}
                </span>

                <h2 className="text-foreground text-3xl leading-tight font-extrabold tracking-tight uppercase sm:text-4xl">
                  {t("consolidate.headingLead")}{" "}
                  <span className="text-primary">
                    {t("consolidate.headingHighlight")}
                  </span>
                </h2>
                <span className="bg-primary block h-1 w-20 rounded-full" />
              </div>
            </div>

            <p className="text-muted-foreground text-base leading-relaxed">
              {t("consolidate.introLead")}{" "}
              <span className="text-foreground font-semibold">
                {t("consolidate.introHighlight")}
              </span>{" "}
              {t("consolidate.introTrail")}
            </p>

            <ul className="space-y-3.5 text-sm sm:text-base">
              {checklistItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="bg-primary/15 text-primary mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md">
                    <Check className="size-3.5" />
                  </span>
                  <span className="text-foreground/90">
                    {item.lead}
                    <span className="text-primary font-semibold">
                      {item.highlight}
                    </span>
                    {item.trail}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Part 2: Core Value Commitments */}
        <div className="space-y-10">
          <div className="relative text-center">
            <span
              className="text-foreground/[0.04] dark:text-foreground/[0.06] pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl font-black tracking-widest uppercase select-none sm:text-8xl"
              aria-hidden="true"
            >
              COMMITMENT
            </span>
            <div className="relative z-10 mx-auto max-w-2xl space-y-2">
              <h3 className="text-foreground text-2xl font-extrabold tracking-tight uppercase sm:text-3xl">
                {t("commitments.title")}
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                {t("commitments.subtitle")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {valueCommitments.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="border-border/70 bg-card hover:border-primary/40 flex flex-col justify-between rounded-xl border p-6 shadow-xs transition-colors sm:p-8"
                >
                  <div>
                    <div className="mb-4 flex items-center gap-3">
                      <div className="bg-primary/15 text-primary flex size-11 shrink-0 items-center justify-center rounded-md">
                        <Icon className="size-5" />
                      </div>
                      <span className="text-primary text-xl font-black tracking-tight uppercase sm:text-2xl">
                        {item.highlight}
                      </span>
                    </div>
                    <h4 className="text-foreground mb-2 text-lg font-bold tracking-tight">
                      {item.title}
                    </h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Part 3: 4-Step Creator Journey */}
        <div className="border-border/70 bg-muted/30 rounded-xl border p-6 sm:p-10">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-primary text-xs font-bold tracking-wider uppercase">
                {t("journey.badge")}
              </span>
              <h3 className="text-foreground mt-1 text-2xl font-extrabold tracking-tight uppercase sm:text-3xl">
                {t("journey.title")}
              </h3>
            </div>
            <Button asChild size="sm" className="w-fit gap-1.5 font-semibold">
              <Link href="/auth/sign-up">
                <span>{t("journey.cta")}</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {journeySteps.map((item) => (
              <div
                key={item.step}
                className="border-border/60 bg-card relative flex flex-col justify-between rounded-xl border p-5 shadow-2xs"
              >
                <div>
                  <div className="bg-primary text-primary-foreground mb-4 inline-flex size-10 items-center justify-center rounded-md text-sm font-black tabular-nums">
                    {item.step}
                  </div>
                  <h4 className="text-foreground mb-2 text-base font-bold">
                    {item.title}
                  </h4>
                  <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Part 4: Founder Letter & 3 Core Pillars */}
        <div>
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-2xl font-extrabold tracking-tight uppercase sm:text-3xl">
              {t("title")}
            </h3>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              {t("subtitle")}
            </p>
          </div>

          <div className="border-border/80 bg-card/60 relative mx-auto mt-8 max-w-4xl rounded-xl border p-6 shadow-md backdrop-blur-md sm:p-10">
            <Quote
              className="text-primary/10 absolute top-6 right-6 size-16"
              aria-hidden="true"
            />

            <div className="text-card-foreground/90 space-y-4 text-sm leading-relaxed sm:text-base">
              <p className="text-foreground font-semibold">
                {t("letterGreeting")}
              </p>
              <p>{t("letterParagraph1")}</p>
              <p>{t("letterParagraph2")}</p>
            </div>

            <div className="border-border/60 mt-8 flex flex-col items-start justify-between gap-4 border-t pt-6 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="bg-primary/15 text-primary ring-primary/30 flex size-11 items-center justify-center rounded-full font-bold ring-2">
                  CR
                </div>
                <div>
                  <div className="text-foreground flex items-center gap-1.5 font-bold">
                    <span>Crodic</span>
                    <span className="bg-primary/10 text-primary inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold">
                      Founder
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {t("authorRole")}
                  </p>
                </div>
              </div>

              <p className="text-muted-foreground text-xs italic sm:text-right">
                &ldquo;{t("motto")}&rdquo;
              </p>
            </div>
          </div>

          {/* 3 Core Pillars */}
          <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
            {coreValues.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div
                  key={idx}
                  className="border-border/60 bg-muted/30 hover:bg-muted/50 flex items-start gap-3.5 rounded-xl border p-4 transition-colors"
                >
                  <div className="bg-primary/15 text-primary mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md">
                    <Icon className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-foreground text-sm font-semibold">
                      {val.title}
                    </h4>
                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                      {val.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
