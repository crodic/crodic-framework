"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

export function CtaBanner() {
  const t = useTranslations("Landing.cta");

  return (
    <section className="border-border/60 relative overflow-hidden border-t py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-primary text-primary-foreground relative overflow-hidden rounded-xl p-8 shadow-lg sm:p-12 lg:p-14">
          {/* Editorial Watermark */}
          <span
            className="pointer-events-none absolute -right-4 -bottom-6 text-7xl font-black tracking-widest text-white/10 uppercase select-none sm:text-9xl"
            aria-hidden="true"
          >
            KOSUME
          </span>

          <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl space-y-2.5">
              <h2 className="text-3xl font-extrabold tracking-tight text-balance uppercase sm:text-4xl">
                {t("title")}
              </h2>
              <p className="text-primary-foreground/85 text-base leading-relaxed sm:text-lg">
                {t("subtitle")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:shrink-0">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="bg-background text-foreground hover:bg-background/90 h-11 gap-2 px-6 font-bold shadow-sm"
              >
                <Link href="/auth/sign-up">
                  <span>{t("joinNow")}</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 h-11 px-6 font-semibold"
              >
                <a href="#albums">{t("viewWorks")}</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
