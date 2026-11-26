"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Star, MessageCircleHeart, CheckCircle2 } from "lucide-react";

export function CommunityTestimonials() {
  const t = useTranslations("Landing.testimonials") as any;

  const testimonials = [
    {
      id: "meiko",
      name: t("items.meiko.name"),
      role: t("items.meiko.role"),
      location: t("items.meiko.location"),
      tag: t("items.meiko.tag"),
      quote: t("items.meiko.quote"),
      initials: "MT",
      avatarColor:
        "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
    },
    {
      id: "kuroki",
      name: t("items.kuroki.name"),
      role: t("items.kuroki.role"),
      location: t("items.kuroki.location"),
      tag: t("items.kuroki.tag"),
      quote: t("items.kuroki.quote"),
      initials: "HL",
      avatarColor:
        "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    },
    {
      id: "quynhanh",
      name: t("items.quynhanh.name"),
      role: t("items.quynhanh.role"),
      location: t("items.quynhanh.location"),
      tag: t("items.quynhanh.tag"),
      quote: t("items.quynhanh.quote"),
      initials: "QA",
      avatarColor:
        "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    },
  ];

  return (
    <section
      id="community-stories"
      className="border-border/40 bg-muted/20 border-t py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-semibold tracking-wider uppercase">
            <MessageCircleHeart className="size-3.5" />
            {t("badge")}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="text-muted-foreground mt-3 text-base sm:text-lg">
            {t("subtitle")}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="border-border/70 bg-card hover:border-border flex flex-col justify-between rounded-2xl border p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <div>
                {/* 5-star rating */}
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                  <span className="text-muted-foreground ml-2 text-xs font-medium">
                    5.0
                  </span>
                </div>

                {/* Quote */}
                <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                  "{item.quote}"
                </p>
              </div>

              {/* Author Info */}
              <div className="border-border/40 mt-6 flex items-center justify-between border-t pt-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-10 items-center justify-center rounded-full border text-sm font-bold ${item.avatarColor}`}
                  >
                    {item.initials}
                  </div>
                  <div>
                    <div className="text-foreground flex items-center gap-1 text-sm font-semibold">
                      <span>{item.name}</span>
                      <CheckCircle2
                        className="text-primary size-3.5"
                        aria-label="Verified creator"
                      />
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {item.role} • {item.location}
                    </p>
                  </div>
                </div>

                <span className="bg-muted text-muted-foreground hidden rounded-md px-2 py-0.5 text-[11px] font-medium sm:inline-block">
                  {item.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
