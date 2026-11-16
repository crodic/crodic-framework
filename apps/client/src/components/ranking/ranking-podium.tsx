"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Check, Award, Trophy, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { LeaderboardItemResDto } from "@/services/ranking";

export interface RankingPodiumProps {
  podiumItems: LeaderboardItemResDto[];
}

export function RankingPodium({ podiumItems }: RankingPodiumProps) {
  const t = useTranslations("Ranking.podium");
  const rank1 = podiumItems.find((p) => p.rank === 1);
  const rank2 = podiumItems.find((p) => p.rank === 2);
  const rank3 = podiumItems.find((p) => p.rank === 3);

  const displayOrder: Array<{
    item?: LeaderboardItemResDto;
    tier: "gold" | "silver" | "bronze";
  }> = [
    { item: rank2, tier: "silver" },
    { item: rank1, tier: "gold" },
    { item: rank3, tier: "bronze" },
  ];

  const getTierStyles = (tier: "gold" | "silver" | "bronze") => {
    switch (tier) {
      case "gold":
        return {
          cardBorder: "border-amber-400/90 shadow-xl shadow-amber-500/10",
          bgGradient:
            "bg-gradient-to-b from-amber-500/15 via-card/95 to-card border-2",
          avatarRing: "ring-3 ring-amber-400 shadow-md",
          badgeColor: "text-amber-400",
          medalNumber: "1",
          medalIcon: Trophy,
          elevation: "sm:-translate-y-3 z-10",
        };
      case "silver":
        return {
          cardBorder: "border-slate-400/40 shadow-md",
          bgGradient: "bg-gradient-to-b from-slate-400/10 via-card/95 to-card",
          avatarRing: "ring-2 ring-slate-300",
          badgeColor: "text-slate-300",
          medalNumber: "2",
          medalIcon: Medal,
          elevation: "z-0",
        };
      case "bronze":
        return {
          cardBorder: "border-amber-700/40 shadow-md",
          bgGradient: "bg-gradient-to-b from-amber-700/10 via-card/95 to-card",
          avatarRing: "ring-2 ring-amber-700",
          badgeColor: "text-amber-600",
          medalNumber: "3",
          medalIcon: Award,
          elevation: "z-0",
        };
    }
  };

  return (
    <div className="relative w-full">
      <div className="grid grid-cols-3 items-end gap-2 sm:gap-4 md:gap-6">
        {displayOrder.map(({ item, tier }) => {
          if (!item) return null;
          const styles = getTierStyles(tier);
          const MedalIcon = styles.medalIcon;
          const formattedLikes =
            item.likesCount >= 1000
              ? `${(item.likesCount / 1000).toFixed(1)}k`
              : String(item.likesCount);
          const formattedFollowers =
            item.followersCount >= 1000
              ? `${(item.followersCount / 1000).toFixed(1)}k`
              : String(item.followersCount);

          return (
            <div
              key={item.id}
              className={cn(
                "relative flex flex-col items-center justify-between rounded-2xl border p-2.5 transition-all duration-300 hover:shadow-xl sm:rounded-3xl sm:p-5 md:p-6",
                styles.cardBorder,
                styles.bgGradient,
                styles.elevation
              )}
            >
              {/* Top Medal Badge */}
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1 font-black sm:top-4 sm:right-4">
                <MedalIcon
                  className={cn("size-4 sm:size-5", styles.badgeColor)}
                />
                <span
                  className={cn(
                    "text-xs font-extrabold sm:text-base",
                    styles.badgeColor
                  )}
                >
                  {styles.medalNumber}
                </span>
              </div>

              {/* Avatar with Ring & Verified Tick */}
              <Link
                href={item.portfolioHref}
                className="group/avatar relative mt-4 block transition-transform hover:scale-105 sm:mt-2"
              >
                <div
                  className={cn(
                    "relative size-12 overflow-hidden rounded-full sm:size-16 md:size-20",
                    styles.avatarRing
                  )}
                >
                  <Image
                    src={item.avatarUrl}
                    alt={item.displayName}
                    fill
                    sizes="(max-width: 640px) 48px, (max-width: 768px) 64px, 80px"
                    className="object-cover"
                  />
                </div>
                {item.isVerified && (
                  <span
                    className="ring-card absolute right-0 bottom-0 inline-flex size-4 items-center justify-center rounded-full bg-blue-500 text-white shadow-xs ring-2 sm:size-5"
                    title={t("verified")}
                  >
                    <Check className="size-2.5 stroke-[3] sm:size-3" />
                  </span>
                )}
              </Link>

              {/* Info: Name, Role, Stats */}
              <div className="mt-2 w-full text-center sm:mt-3">
                <Link href={item.portfolioHref}>
                  <h3
                    className="text-foreground hover:text-primary truncate text-xs font-extrabold transition-colors sm:text-base"
                    title={item.displayName}
                  >
                    {item.displayName}
                  </h3>
                </Link>
                <p className="text-muted-foreground truncate text-[10px] font-semibold sm:text-xs">
                  {item.handle}
                </p>
                <p className="text-foreground/80 mt-1 line-clamp-1 hidden text-[11px] font-medium sm:block">
                  {item.roleLabel}
                </p>

                {/* Likes & Followers Counters */}
                <div className="mt-2.5 flex items-center justify-center gap-2 border-t border-white/10 pt-2 text-[10px] font-semibold sm:text-xs">
                  <div>
                    <span className="text-foreground font-bold">
                      {formattedLikes}
                    </span>{" "}
                    <span className="text-muted-foreground">{t("likes")}</span>
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <div>
                    <span className="text-foreground font-bold">
                      {formattedFollowers}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {t("followers")}
                    </span>
                  </div>
                </div>
              </div>

              {/* View Portfolio Button */}
              <div className="mt-3 w-full pt-1 sm:mt-4">
                <Button
                  asChild
                  size="sm"
                  className={cn(
                    "w-full cursor-pointer rounded-xl text-[11px] font-bold shadow-xs sm:h-9 sm:text-xs",
                    tier === "gold"
                      ? "bg-amber-400 font-extrabold text-black hover:bg-amber-300"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  <Link href={item.portfolioHref}>{t("viewPortfolio")}</Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
