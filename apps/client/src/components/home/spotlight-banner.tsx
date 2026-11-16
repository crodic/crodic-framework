"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { BadgeCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getSpotlightBanners } from "@/services/spotlight";
import { cn } from "@/lib/utils";

export function SpotlightBanner() {
  const t = useTranslations("Home.spotlight");
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const { data: slides = [], isLoading } = useQuery({
    queryKey: ["public-spotlight-banners"],
    queryFn: getSpotlightBanners,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  if (isLoading) {
    return (
      <div className="border-border/70 bg-card/40 flex min-h-[210px] w-full animate-pulse items-center justify-center rounded-2xl border sm:min-h-[230px]">
        <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
          <Sparkles className="text-primary size-4 animate-spin" />
          <span>{t("viewPortfolio")}...</span>
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <Carousel
      setApi={setApi}
      opts={{ loop: true }}
      className="border-border/70 from-card via-card/95 to-card/60 group relative w-full overflow-hidden rounded-2xl border bg-gradient-to-r via-35% shadow-sm select-none"
    >
      <CarouselContent className="m-0">
        {slides.map((slide, index) => (
          <CarouselItem
            key={slide.id || index}
            className="relative flex min-h-[210px] flex-col justify-between p-0 sm:min-h-[230px]"
          >
            {/* Ambient glow behind artwork */}
            <div
              className="pointer-events-none absolute top-1/2 -right-6 z-0 h-[150%] w-[65%] -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.22)_0%,rgba(99,102,241,0.06)_45%,transparent_70%)] select-none"
              aria-hidden="true"
            />

            {/* Character Artwork */}
            <div
              className="pointer-events-none absolute top-0 right-0 bottom-0 z-0 w-[58%] overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.15)_15%,rgba(0,0,0,0.7)_40%,black_70%)] select-none [-webkit-mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.15)_15%,rgba(0,0,0,0.7)_40%,black_70%)] sm:w-[56%] md:w-[60%] lg:w-[62%]"
              aria-hidden="true"
            >
              <Image
                src={slide.bannerImageUrl}
                alt={slide.name}
                fill
                priority={index === 0}
                sizes="(min-width: 1024px) 50vw, 70vw"
                className="object-cover object-[70%_center] transition-transform duration-700 ease-out group-hover:scale-105"
              />

              <div className="from-card/90 via-card/30 absolute inset-0 bg-gradient-to-r via-20% to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex max-w-sm flex-col justify-center space-y-2 p-5 sm:max-w-md sm:p-7 lg:max-w-lg">
              <span className="text-muted-foreground/90 text-[11px] font-semibold tracking-wide sm:text-xs">
                {slide.badge}
              </span>

              <div className="flex items-center gap-2">
                <h2 className="text-foreground text-3xl font-black tracking-tight sm:text-4xl">
                  {slide.name}
                </h2>
                {slide.isVerified && (
                  <BadgeCheck
                    className="size-5 shrink-0 fill-sky-400/20 text-sky-400 sm:size-6"
                    aria-label={t("verified")}
                  />
                )}
              </div>

              <p className="text-muted-foreground text-xs leading-relaxed font-normal sm:text-sm">
                {slide.tagline}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2 sm:gap-3 sm:pt-3">
                <Button
                  asChild
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/25 h-9 cursor-pointer rounded-lg px-4 text-xs font-semibold shadow-xs transition-all hover:scale-[1.02] sm:px-5 sm:text-sm"
                >
                  <Link href={slide.portfolioHref || "/cosplayer"}>
                    {t("viewPortfolio")}
                  </Link>
                </Button>

                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="border-border/80 bg-background/50 hover:bg-muted text-foreground h-9 cursor-pointer rounded-lg px-4 text-xs font-medium transition-all hover:scale-[1.02] sm:px-5 sm:text-sm"
                >
                  <Link href={slide.bookingHref || "/cosplayer"}>
                    {t("contactBooking")}
                  </Link>
                </Button>
              </div>
            </div>

            <div className="h-6" />
          </CarouselItem>
        ))}
      </CarouselContent>

      {/* Bottom Indicators */}
      {slides.length > 1 && (
        <div className="pointer-events-auto absolute right-0 bottom-3 left-0 z-20 flex items-center justify-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => api?.scrollTo(idx)}
              className={cn(
                "h-1 cursor-pointer rounded-full transition-all duration-300",
                current === idx
                  ? "w-5 bg-white/90"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/60 w-1.5"
              )}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </Carousel>
  );
}
