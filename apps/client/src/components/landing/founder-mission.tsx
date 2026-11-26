"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  ShieldCheck,
  Sparkles,
  Image as ImageIcon,
  BookOpen,
  Quote,
} from "lucide-react";

export function FounderMission() {
  const t = useTranslations("Landing.founder") as any;

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

  return (
    <section id="about" className="relative overflow-hidden py-16 sm:py-24">
      {/* Subtle background glow */}
      <div
        className="bg-primary/10 pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="size-3.5" />
            {t("badge")}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="text-muted-foreground mt-3 text-base sm:text-lg">
            {t("subtitle")}
          </p>
        </div>

        {/* Founder Letter Card */}
        <div className="border-border/80 bg-card/60 relative mx-auto mt-12 max-w-4xl rounded-2xl border p-6 shadow-xl backdrop-blur-md sm:p-10">
          <Quote
            className="text-primary/10 absolute top-6 right-6 size-16"
            aria-hidden="true"
          />

          <div className="text-card-foreground/90 space-y-4 text-base leading-relaxed sm:text-lg">
            <p className="text-foreground font-medium">{t("letterGreeting")}</p>
            <p>{t("letterParagraph1")}</p>
            <p>{t("letterParagraph2")}</p>
          </div>

          {/* Signature & Author Block */}
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
              "{t("motto")}"
            </p>
          </div>
        </div>

        {/* 3 Core Pillars */}
        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
          {coreValues.map((val, idx) => {
            const Icon = val.icon;
            return (
              <div
                key={idx}
                className="border-border/60 bg-muted/30 hover:bg-muted/50 flex items-start gap-3.5 rounded-xl border p-4 transition-colors"
              >
                <div className="bg-primary/15 text-primary mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg">
                  <Icon className="size-4" />
                </div>
                <div>
                  <h3 className="text-foreground text-sm font-semibold">
                    {val.title}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                    {val.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
