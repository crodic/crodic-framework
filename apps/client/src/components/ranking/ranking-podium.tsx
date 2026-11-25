"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Check, Award, Trophy, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { LeaderboardItemResDto } from "@/services/ranking";
import { motion } from "motion/react";

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
    delay: number;
  }> = [
    { item: rank2, tier: "silver", delay: 0.1 },
    { item: rank1, tier: "gold", delay: 0.25 },
    { item: rank3, tier: "bronze", delay: 0.18 },
  ];

  const getTierStyles = (tier: "gold" | "silver" | "bronze") => {
    switch (tier) {
      case "gold":
        return {
          cardBorder: "border-amber-400/90 shadow-xl shadow-amber-500/15",
          bgGradient:
            "bg-gradient-to-b from-amber-500/20 via-card/95 to-card border-2",
          avatarRing: "ring-3 ring-amber-400 shadow-lg shadow-amber-400/30",
          badgeColor: "text-amber-400",
          medalNumber: "1",
          medalIcon: Trophy,
          elevation: "sm:-translate-y-4 z-10",
        };
      case "silver":
        return {
          cardBorder: "border-slate-400/50 shadow-md",
          bgGradient: "bg-gradient-to-b from-slate-400/15 via-card/95 to-card",
          avatarRing: "ring-2 ring-slate-300",
          badgeColor: "text-slate-300",
          medalNumber: "2",
          medalIcon: Medal,
          elevation: "z-0",
        };
      case "bronze":
        return {
          cardBorder: "border-amber-700/50 shadow-md",
          bgGradient: "bg-gradient-to-b from-amber-700/15 via-card/95 to-card",
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
        {displayOrder.map(({ item, tier, delay }) => {
          if (!item) return null;
          const styles = getTierStyles(tier);
          const MedalIcon = styles.medalIcon;
          const isGold = tier === "gold";
          const formattedLikes =
            item.likesCount >= 1000
              ? `${(item.likesCount / 1000).toFixed(1)}k`
              : String(item.likesCount);
          const formattedFollowers =
            item.followersCount >= 1000
              ? `${(item.followersCount / 1000).toFixed(1)}k`
              : String(item.followersCount);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: isGold ? 50 : 35, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.55,
                delay,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              whileHover={{
                y: -4,
                transition: { duration: 0.2, ease: "easeOut" },
              }}
              className={cn(
                "relative flex flex-col items-center justify-between rounded-2xl border p-2.5 transition-shadow sm:rounded-3xl sm:p-5 md:p-6",
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
                    "text-xs font-extrabold tabular-nums sm:text-base",
                    styles.badgeColor
                  )}
                >
                  {styles.medalNumber}
                </span>
              </div>

              {/* Avatar with Ring & Verified Tick */}
              <Link
                href={item.portfolioHref}
                className="group/avatar relative mt-4 block sm:mt-2"
              >
                <div
                  className={cn(
                    "relative size-12 overflow-hidden rounded-full sm:size-16 md:size-20",
                    styles.avatarRing
                  )}
                >
                  {item.avatarUrl ? (
                    <Image
                      src={item.avatarUrl}
                      alt={item.displayName}
                      fill
                      sizes="(max-width: 640px) 48px, (max-width: 768px) 64px, 80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="bg-primary/20 text-primary flex size-full items-center justify-center text-base font-extrabold sm:text-xl">
                      {item.displayName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
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

              {/* Display Name & Handle */}
              <div className="mt-2.5 w-full text-center sm:mt-3">
                <Link
                  href={item.portfolioHref}
                  className="hover:text-primary block truncate text-xs font-extrabold tracking-tight transition-colors sm:text-base md:text-lg"
                >
                  {item.displayName}
                </Link>
                <p className="text-muted-foreground truncate text-[10px] sm:text-xs">
                  {item.handle}
                </p>
              </div>

              {/* Role badge preview */}
              {item.roleLabel && (
                <div className="mt-2 hidden w-full justify-center sm:flex">
                  <span className="border-border/60 bg-muted/70 text-foreground/90 max-w-[85%] truncate rounded-full border px-2.5 py-0.5 text-[10px] font-semibold">
                    {item.roleLabel}
                  </span>
                </div>
              )}

              {/* Stats Bar */}
              <div className="border-border/40 mt-3 flex w-full items-center justify-around border-t pt-2.5 text-center sm:mt-4 sm:pt-3">
                <div>
                  <span className="text-foreground block text-xs font-black tabular-nums sm:text-sm md:text-base">
                    {formattedLikes}
                  </span>
                  <span className="text-muted-foreground block text-[9px] tracking-wider uppercase sm:text-[10px]">
                    {t("likes")}
                  </span>
                </div>
                <div className="bg-border/60 h-6 w-px" />
                <div>
                  <span className="text-foreground block text-xs font-black tabular-nums sm:text-sm md:text-base">
                    {formattedFollowers}
                  </span>
                  <span className="text-muted-foreground block text-[9px] tracking-wider uppercase sm:text-[10px]">
                    {t("followers")}
                  </span>
                </div>
              </div>

              {/* View Portfolio Button */}
              <Button
                asChild
                size="sm"
                className={cn(
                  "mt-3 h-7 w-full cursor-pointer rounded-full text-[10px] font-bold shadow-xs sm:mt-4 sm:h-8 sm:text-xs",
                  isGold
                    ? "bg-amber-400 text-amber-950 transition-colors hover:bg-amber-300"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border/80 border"
                )}
              >
                <Link href={item.portfolioHref}>{t("viewPortfolio")}</Link>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
