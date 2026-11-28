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
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "@/components/ui/motion-primitives";

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

  const journeySteps = [
    {
      step: "01",
      title: "Khởi tạo Portfolio Nghệ Thuật",
      desc: "Tạo hồ sơ cá nhân với đường dẫn định danh riêng, giới thiệu phong cách, chiều cao, kỹ năng và trạng thái nhận Booking.",
    },
    {
      step: "02",
      title: "Lưu trữ Bộ sưu tập & Nhân vật",
      desc: "Đăng tải photoset độ phân giải gốc (tối đa 20 ảnh/album), tự động gom nhóm theo từng Nhân vật và Series.",
    },
    {
      step: "03",
      title: "Ghi danh Ekip & Đồng sáng tạo",
      desc: "Tag trực tiếp Photographer, Make-up Artist, Prop Maker vào tác phẩm và bảo vệ ảnh với Watermark tự động.",
    },
    {
      step: "04",
      title: "Tỏa sáng tại Sự kiện & Bảng xếp hạng",
      desc: "Theo dõi lịch trình Cosplay Festival, góp mặt trên bảng xếp hạng thịnh hành và mở rộng cơ hội hợp tác.",
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

      <div className="mx-auto max-w-7xl space-y-20 px-4 sm:space-y-24 sm:px-6 lg:px-8">
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
                alt="Consolidated Cosplay Portfolio"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute inset-x-5 bottom-5 text-white">
                <span className="bg-primary text-primary-foreground mb-2 inline-block rounded-md px-2.5 py-0.5 text-xs font-semibold">
                  All-In-One Cosplay Hub
                </span>
                <h3 className="text-xl font-bold sm:text-2xl">
                  Đại bản doanh cho mọi màn hóa thân của bạn
                </h3>
                <p className="mt-1 text-xs text-white/80 sm:text-sm">
                  Gom toàn bộ bộ ảnh, danh sách nhân vật, lịch chạy Fes và thông
                  tin liên hệ Booking về một nơi duy nhất.
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
                  Vì tác phẩm Cosplay của bạn xứng đáng{" "}
                  <span className="text-primary">hơn cả những lượt Like</span>
                </h2>
                <span className="bg-primary block h-1 w-20 rounded-full" />
              </div>
            </div>

            <p className="text-muted-foreground text-base leading-relaxed">
              Chúng tôi không tạo ra một bảng tin lướt vội. Kosume là{" "}
              <span className="text-foreground font-semibold">
                kho lưu trữ nghệ thuật
              </span>{" "}
              giúp bạn tổ chức, trình diễn và phát triển danh tính Cosplayer
              chuyên nghiệp.
            </p>

            <ul className="space-y-3.5 text-sm sm:text-base">
              {[
                {
                  lead: "Xây dựng ",
                  highlight: "Portfolio cá nhân hóa",
                  trail: " với độ phân giải ảnh gốc sắc nét",
                },
                {
                  lead: "Tự động phân loại bộ ảnh theo từng ",
                  highlight: "Nhân vật & Series Fandom",
                  trail: "",
                },
                {
                  lead: "Ghi nhận công sức cả ekip với tính năng ",
                  highlight: "gắn thẻ Collaborators",
                  trail: " (Photographer, MUA, Prop Maker)",
                },
                {
                  lead: "Bảo vệ chất xám bằng ",
                  highlight: "Watermark tự động",
                  trail: " và cơ chế kiểm duyệt bản quyền",
                },
                {
                  lead: "Mở trạng thái ",
                  highlight: "nhận Booking & Hợp tác",
                  trail: " trực tiếp trên trang hồ sơ",
                },
              ].map((item, idx) => (
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

        {/* Part 2: 4-Step Creator Journey */}
        <div className="border-border/70 bg-muted/30 rounded-xl border p-6 sm:p-10">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-primary text-xs font-bold tracking-wider uppercase">
                Lộ trình 4 bước
              </span>
              <h3 className="text-foreground mt-1 text-2xl font-extrabold tracking-tight uppercase sm:text-3xl">
                Hành trình phát triển trên Kosume
              </h3>
            </div>
            <Button asChild size="sm" className="w-fit gap-1.5 font-semibold">
              <Link href="/auth/sign-up">
                <span>Bắt đầu ngay</span>
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

        {/* Part 3: Founder Letter & 3 Core Pillars */}
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
