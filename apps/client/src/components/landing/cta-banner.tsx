"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "./scroll-reveal";

export function CtaBanner() {
  const t = useTranslations("Landing.cta");

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          {/* Callout card container */}
          <div className="border-border/80 bg-card relative overflow-hidden rounded-3xl border p-8 text-center shadow-xs sm:p-14 lg:p-16">
            <div className="relative z-10 mx-auto max-w-2xl">
              <h2 className="text-foreground text-2xl leading-tight font-black tracking-tight text-balance sm:text-3xl lg:text-4xl">
                {t("title")}
              </h2>

              <p className="text-muted-foreground mt-3.5 text-sm leading-relaxed text-pretty sm:mt-4 sm:text-base">
                {t("subtitle")}
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 cursor-pointer rounded-lg px-8 text-sm font-semibold shadow-xs transition-colors sm:text-base"
                >
                  <Link href="/auth/sign-up">{t("joinNow")}</Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-border bg-background hover:bg-muted text-foreground h-12 cursor-pointer rounded-lg px-8 text-sm font-medium transition-colors sm:text-base"
                >
                  <a href="#albums">{t("viewWorks")}</a>
                </Button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
