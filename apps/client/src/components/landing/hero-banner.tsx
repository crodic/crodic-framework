"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function HeroBanner() {
  const t = useTranslations("Landing.hero");

  return (
    <section className="bg-background relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-60 overflow-hidden select-none sm:inset-y-0 sm:h-auto lg:left-auto lg:w-[68%]"
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

        <div className="from-background via-background/85 absolute inset-y-0 left-0 hidden w-3/4 bg-linear-to-r to-transparent sm:block lg:w-2/3" />
        <div className="from-background via-background/65 absolute inset-x-0 bottom-0 h-24 bg-linear-to-t to-transparent sm:h-32" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-center pt-56 pb-10 sm:min-h-[480px] sm:py-16 lg:min-h-[540px]">
          <div className="max-w-xl lg:max-w-2xl">
            <h1 className="text-foreground text-4xl leading-tight font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {t("titleLead")} <span className="text-primary">Cosplay</span>{" "}
              {t("titleTrail")}
            </h1>

            <p className="text-foreground/80 mt-4 max-w-lg text-base leading-relaxed text-pretty lg:text-lg">
              {t("subtitle")}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8">
              <Button asChild size="lg" className="h-11 rounded-lg">
                <a href="#albums">{t("exploreNow")}</a>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-background h-11 rounded-lg shadow-none"
              >
                <Link href="/auth/sign-up">{t("signUp")}</Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-foreground hover:text-primary h-11 rounded-lg px-4"
              >
                <Link href="/tags">{t("viewTags")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
