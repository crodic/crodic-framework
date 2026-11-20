"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Minus,
  Star,
  UserCheck,
  UserPlus,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { LeaderboardItemResDto } from "@/services/ranking";
import { toggleFollow } from "@/services/social";
import { useAuthStore } from "@/store/use-auth-store";
import { useProfile } from "@/hooks/use-profile";

export interface RankingTableProps {
  items: LeaderboardItemResDto[];
}

export function RankingTable({ items }: RankingTableProps) {
  const tTable = useTranslations("Ranking.table");
  const tRanking = useTranslations("Ranking");
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: currentUser } = useProfile();
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  const handleToggleFollow = async (item: LeaderboardItemResDto) => {
    const isNow = !followingMap[item.id];
    setFollowingMap((prev) => ({
      ...prev,
      [item.id]: isNow,
    }));
    try {
      await toggleFollow(item.userId);
      toast.success(
        isNow
          ? `${tTable("followSuccess")} ${item.displayName}`
          : `${tTable("unfollowSuccess")} ${item.displayName}`
      );
    } catch {
      setFollowingMap((prev) => ({
        ...prev,
        [item.id]: !isNow,
      }));
      toast.error(tRanking("error"));
    }
  };

  const renderTrendIcon = (trend: "up" | "down" | "same") => {
    switch (trend) {
      case "up":
        return (
          <span title={tTable("trendUp")}>
            <ArrowUp className="size-3 text-emerald-400" />
          </span>
        );
      case "down":
        return (
          <span title={tTable("trendDown")}>
            <ArrowDown className="size-3 text-rose-400" />
          </span>
        );
      case "same":
      default:
        return (
          <span title={tTable("trendSame")}>
            <Minus className="text-muted-foreground size-3" />
          </span>
        );
    }
  };

  return (
    <div className="border-border/70 bg-card overflow-hidden rounded-2xl border shadow-xs sm:rounded-3xl">
      {/* ===== DESKTOP TABLE (Visible on >= md) ===== */}
      <div className="hidden md:block">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="border-border/60 hover:bg-transparent">
              <TableHead className="w-16 text-center text-xs font-bold uppercase">
                {tTable("rank")}
              </TableHead>
              <TableHead className="text-xs font-bold uppercase">
                {tTable("cosplayer")}
              </TableHead>
              <TableHead className="text-xs font-bold uppercase">
                {tTable("featured")}
              </TableHead>
              <TableHead className="text-center text-xs font-bold uppercase">
                {tTable("stats")}
              </TableHead>
              <TableHead className="text-center text-xs font-bold uppercase">
                {tTable("score")}
              </TableHead>
              <TableHead className="w-48 text-right text-xs font-bold uppercase">
                {tTable("action")}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-border/50 divide-y">
            {items.map((item) => {
              const isFollowing = followingMap[item.id] ?? false;
              const formattedLikes =
                item.likesCount >= 1000
                  ? `${(item.likesCount / 1000).toFixed(1)}k`
                  : String(item.likesCount);

              return (
                <TableRow
                  key={item.id}
                  className="border-border/40 hover:bg-muted/40 transition-colors"
                >
                  {/* Rank & Trend */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5 font-black">
                      <span className="text-foreground text-sm">
                        #{item.rank}
                      </span>
                      {renderTrendIcon(item.trend)}
                    </div>
                  </TableCell>

                  {/* Cosplayer info: Avatar + Name + Handle */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Link
                        href={item.portfolioHref}
                        className="group relative size-10 shrink-0 overflow-hidden rounded-full"
                      >
                        <Image
                          src={item.avatarUrl}
                          alt={item.displayName}
                          fill
                          sizes="40px"
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      </Link>

                      <div className="min-w-0">
                        <Link
                          href={item.portfolioHref}
                          className="hover:text-primary flex items-center gap-1.5 font-bold transition-colors"
                        >
                          <span className="text-foreground truncate text-sm">
                            {item.displayName}
                          </span>
                          {item.isVerified && (
                            <span
                              className="inline-flex size-3.5 items-center justify-center rounded-full bg-blue-500 text-white"
                              title={tTable("verified")}
                            >
                              <Check className="size-2 stroke-[3]" />
                            </span>
                          )}
                        </Link>
                        <span className="text-muted-foreground block text-xs">
                          {item.handle}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Featured Projects Pills */}
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {item.featuredProjects &&
                      item.featuredProjects.length > 0 ? (
                        item.featuredProjects.map((p, idx) => (
                          <span
                            key={idx}
                            className="border-border/70 bg-muted/50 text-foreground/80 rounded-md border px-2 py-0.5 text-[11px] font-medium"
                          >
                            {p}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Likes count */}
                  <TableCell className="text-center font-bold">
                    <span className="text-foreground text-xs sm:text-sm">
                      {formattedLikes}
                    </span>
                  </TableCell>

                  {/* Kosume Score */}
                  <TableCell className="text-center">
                    <div className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-400">
                      <Star className="size-3" />
                      <span>{item.score}</span>
                    </div>
                  </TableCell>

                  {/* Action CTA */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isAuthenticated &&
                        String(currentUser?.id) !== String(item.userId) && (
                          <Button
                            type="button"
                            size="sm"
                            variant={isFollowing ? "secondary" : "outline"}
                            onClick={() => handleToggleFollow(item)}
                            className="h-8 cursor-pointer rounded-xl px-3 text-xs font-semibold"
                          >
                            {isFollowing ? (
                              <>
                                <UserCheck className="mr-1.5 size-3 text-emerald-500" />
                                <span>{tTable("following")}</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="mr-1.5 size-3" />
                                <span>{tTable("follow")}</span>
                              </>
                            )}
                          </Button>
                        )}

                      <Button
                        asChild
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 cursor-pointer rounded-xl px-3 text-xs font-bold"
                      >
                        <Link href={item.portfolioHref}>
                          {tTable("viewPortfolio")}
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* ===== MOBILE CARDS LIST (Visible on < md) ===== */}
      <div className="divide-border/60 divide-y md:hidden">
        {items.map((item) => {
          const isFollowing = followingMap[item.id] ?? false;
          const formattedLikes =
            item.likesCount >= 1000
              ? `${(item.likesCount / 1000).toFixed(1)}k`
              : String(item.likesCount);

          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 p-3.5"
            >
              {/* Left: Rank & Avatar */}
              <div className="flex items-center gap-2.5">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-foreground text-xs font-extrabold">
                    #{item.rank}
                  </span>
                  {renderTrendIcon(item.trend)}
                </div>

                <Link
                  href={item.portfolioHref}
                  className="relative size-10 shrink-0 overflow-hidden rounded-full"
                >
                  <Image
                    src={item.avatarUrl}
                    alt={item.displayName}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </Link>

                <div className="min-w-0">
                  <Link
                    href={item.portfolioHref}
                    className="flex items-center gap-1 font-bold"
                  >
                    <span className="text-foreground max-w-[110px] truncate text-xs">
                      {item.displayName}
                    </span>
                  </Link>

                  <div className="flex items-center gap-1 text-[10px]">
                    <span className="text-muted-foreground">{item.handle}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-foreground font-semibold">
                      {formattedLikes}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-1.5">
                {isAuthenticated &&
                  String(currentUser?.id) !== String(item.userId) && (
                    <Button
                      type="button"
                      size="icon"
                      variant={isFollowing ? "secondary" : "outline"}
                      onClick={() => handleToggleFollow(item)}
                      className="size-8 cursor-pointer rounded-xl"
                      title={
                        isFollowing ? tTable("following") : tTable("follow")
                      }
                    >
                      {isFollowing ? (
                        <UserCheck className="size-3.5 text-emerald-500" />
                      ) : (
                        <UserPlus className="size-3.5" />
                      )}
                    </Button>
                  )}

                <Button
                  asChild
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 cursor-pointer rounded-xl px-2.5 text-xs font-bold"
                >
                  <Link href={item.portfolioHref}>
                    {tTable("viewPortfolio")}
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
