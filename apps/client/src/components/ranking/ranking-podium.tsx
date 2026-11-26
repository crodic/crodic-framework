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
    { item: rank1, tier: "gold" },
    { item: rank2, tier: "silver" },
    { item: rank3, tier: "bronze" },
  ];

  const getTierStyles = (tier: "gold" | "silver" | "bronze") => {
    switch (tier) {
      case "gold":
        return {
          cardBorder: "border-amber-500/50",
          avatarRing: "ring-2 ring-amber-500/60",
          badgeColor: "text-amber-800 dark:text-amber-300",
          medalNumber: "1",
          medalIcon: Trophy,
        };
      case "silver":
        return {
          cardBorder: "border-border",
          avatarRing: "ring-2 ring-border",
          badgeColor: "text-muted-foreground",
          medalNumber: "2",
          medalIcon: Medal,
        };
      case "bronze":
        return {
          cardBorder: "border-border",
          avatarRing: "ring-2 ring-border",
          badgeColor: "text-amber-800 dark:text-amber-400",
          medalNumber: "3",
          medalIcon: Award,
        };
    }
  };

  return (
    <div className="relative w-full">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {displayOrder.map(({ item, tier }) => {
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
            <article
              key={item.id}
              className={cn(
                "bg-card relative flex min-w-0 flex-col items-center rounded-xl border p-4",
                styles.cardBorder
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
                  className="hover:text-primary block truncate text-base font-semibold tracking-tight transition-colors"
                >
                  {item.displayName}
                </Link>
                <p className="text-muted-foreground truncate text-xs">
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
                  <span className="text-muted-foreground block text-xs">
                    {t("likes")}
                  </span>
                </div>
                <div className="bg-border/60 h-6 w-px" />
                <div>
                  <span className="text-foreground block text-xs font-black tabular-nums sm:text-sm md:text-base">
                    {formattedFollowers}
                  </span>
                  <span className="text-muted-foreground block text-xs">
                    {t("followers")}
                  </span>
                </div>
              </div>

              {/* View Portfolio Button */}
              <Button
                asChild
                variant={isGold ? "default" : "outline"}
                size="sm"
                className={cn(
                  "mt-4 h-9 w-full rounded-lg px-2 text-xs font-medium",
                  isGold ? "bg-amber-400 text-amber-950 hover:bg-amber-300" : ""
                )}
              >
                <Link href={item.portfolioHref}>{t("viewPortfolio")}</Link>
              </Button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
