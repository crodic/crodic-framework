"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function CtaBanner() {
  const t = useTranslations("Landing.cta");

  return (
    <section className="border-border bg-muted/40 border-t py-12 sm:py-16">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
        <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {t("title")}
        </h2>

        <div className="flex flex-wrap items-center gap-3 lg:shrink-0">
          <Button asChild size="lg" className="h-11 rounded-lg">
            <Link href="/auth/sign-up">{t("joinNow")}</Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-11 rounded-lg shadow-none"
          >
            <a href="#albums">{t("viewWorks")}</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
