"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Heart,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
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
import { LeaderboardItem } from "./ranking-types";
import { useAuthStore } from "@/store/use-auth-store";
import { useRouter } from "@/i18n/navigation";

export interface RankingTableProps {
  items: LeaderboardItem[];
  onBooking: (item: LeaderboardItem) => void;
}

export function RankingTable({ items, onBooking }: RankingTableProps) {
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();

  const handleToggleFollow = (item: LeaderboardItem) => {
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để theo dõi cosplayer!");
      router.push("/auth/login?from=/ranking");
      return;
    }

    const isNowFollowing = !followingMap[item.id];
    setFollowingMap((prev) => ({ ...prev, [item.id]: isNowFollowing }));

    if (isNowFollowing) {
      toast.success(`Đã theo dõi ${item.handle}!`, {
        description:
          "Bạn sẽ nhận được thông báo khi cosplayer có tác phẩm mới.",
      });
    } else {
      toast.info(`Đã bỏ theo dõi ${item.handle}`);
    }
  };

  const handleBooking = (item: LeaderboardItem) => {
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để gửi yêu cầu Booking!");
      router.push("/auth/login?from=/ranking");
      return;
    }
    onBooking(item);
  };

  return (
    <div className="border-border/70 bg-card overflow-hidden rounded-2xl border shadow-sm sm:rounded-3xl">
      {/* ===== DESKTOP TABLE (Hidden on Mobile) ===== */}
      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="border-border/60 hover:bg-transparent">
              <TableHead className="text-muted-foreground w-24 text-center text-xs font-bold tracking-wider uppercase">
                Hạng
              </TableHead>
              <TableHead className="text-muted-foreground w-48 text-xs font-bold tracking-wider uppercase">
                Cosplayer
              </TableHead>
              <TableHead className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                Dự án nổi bật
              </TableHead>
              <TableHead className="text-muted-foreground w-28 text-center text-xs font-bold tracking-wider uppercase">
                Lượt thích
              </TableHead>
              <TableHead className="text-muted-foreground w-56 pr-6 text-right text-xs font-bold tracking-wider uppercase">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const isFollowing = !!followingMap[item.id];

              return (
                <TableRow
                  key={item.id}
                  className="border-border/50 hover:bg-muted/30 transition-colors"
                >
                  {/* 1. Hạng (Rank + Trend Indicator) */}
                  <TableCell className="text-center font-bold">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-foreground text-sm font-extrabold">
                        #{item.rank}
                      </span>
                      {item.trend === "up" ? (
                        <span
                          className="inline-flex items-center text-emerald-400"
                          title="Tăng hạng"
                        >
                          <ChevronUp className="size-4 stroke-[3]" />
                        </span>
                      ) : item.trend === "down" ? (
                        <span
                          className="inline-flex items-center text-rose-400"
                          title="Giảm hạng"
                        >
                          <ChevronDown className="size-4 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs font-bold">
                          —
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* 2. Cosplayer (Avatar + Handle) */}
                  <TableCell>
                    <Link
                      href={item.portfolioHref}
                      className="group flex items-center gap-2.5 transition-opacity hover:opacity-85"
                    >
                      <div className="ring-border relative size-8 shrink-0 overflow-hidden rounded-full ring-1">
                        <Image
                          src={item.avatarUrl}
                          alt={item.name}
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-foreground group-hover:text-primary block truncate text-xs font-bold transition-colors">
                          {item.handle}
                        </span>
                      </div>
                    </Link>
                  </TableCell>

                  {/* 3. Dự án nổi bật (Mini Photos Gallery) */}
                  <TableCell>
                    <div className="flex scrollbar-none items-center gap-1.5 overflow-x-auto py-1">
                      {item.featuredProjects.map((imgSrc, idx) => (
                        <div
                          key={idx}
                          className="ring-border/60 relative size-9 shrink-0 overflow-hidden rounded-md ring-1 transition-transform hover:z-10 hover:scale-110"
                        >
                          <Image
                            src={imgSrc}
                            alt={`Dự án ${idx + 1}`}
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </TableCell>

                  {/* 4. Lượt thích */}
                  <TableCell className="text-foreground text-center text-sm font-bold">
                    {item.likes}
                  </TableCell>

                  {/* 5. Thao tác (Theo dõi + Booking) */}
                  <TableCell className="pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant={isFollowing ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => handleToggleFollow(item)}
                        className="h-8 cursor-pointer rounded-xl px-3 text-xs font-medium transition-all"
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck className="text-primary mr-1 size-3.5" />
                            Đã theo dõi
                          </>
                        ) : (
                          <>
                            <UserPlus className="mr-1 size-3.5" />
                            Theo dõi
                          </>
                        )}
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleBooking(item)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 cursor-pointer rounded-xl px-3 text-xs font-bold shadow-2xs transition-transform active:scale-95"
                      >
                        Booking
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* ===== MOBILE TABLE (Matching Mockup Mobile Phone View) ===== */}
      <div className="block md:hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="border-border/60 hover:bg-transparent">
              <TableHead className="text-muted-foreground w-16 px-3 py-2.5 text-left text-[11px] font-bold tracking-wide uppercase">
                Hạng
              </TableHead>
              <TableHead className="text-muted-foreground px-2 py-2.5 text-left text-[11px] font-bold tracking-wide uppercase">
                Cosplayer
              </TableHead>
              <TableHead className="text-muted-foreground w-20 px-2 py-2.5 text-center text-[11px] font-bold tracking-wide uppercase">
                Lượt thích
              </TableHead>
              <TableHead className="text-muted-foreground w-20 px-3 py-2.5 text-right text-[11px] font-bold tracking-wide uppercase">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const isFollowing = !!followingMap[item.id];

              return (
                <TableRow
                  key={item.id}
                  className="border-border/40 hover:bg-muted/20 transition-colors"
                >
                  {/* 1. Hạng (Rank + Trend Indicator) */}
                  <TableCell className="px-3 py-2.5 font-bold">
                    <div className="flex items-center gap-1">
                      <span className="text-foreground text-xs font-extrabold">
                        #{item.rank}
                      </span>
                      {item.trend === "up" ? (
                        <span className="text-emerald-400">
                          <ChevronUp className="size-3.5 stroke-[3]" />
                        </span>
                      ) : item.trend === "down" ? (
                        <span className="text-rose-400">
                          <ChevronDown className="size-3.5 stroke-[3]" />
                        </span>
                      ) : null}
                    </div>
                  </TableCell>

                  {/* 2. Cosplayer (Avatar + Handle) */}
                  <TableCell className="px-2 py-2.5">
                    <Link
                      href={item.portfolioHref}
                      className="flex items-center gap-2"
                    >
                      <div className="ring-border relative size-7 shrink-0 overflow-hidden rounded-full ring-1">
                        <Image
                          src={item.avatarUrl}
                          alt={item.name}
                          fill
                          sizes="28px"
                          className="object-cover"
                        />
                      </div>
                      <span className="text-foreground max-w-[90px] truncate text-xs font-semibold">
                        {item.handle}
                      </span>
                    </Link>
                  </TableCell>

                  {/* 3. Lượt thích */}
                  <TableCell className="text-foreground px-2 py-2.5 text-center text-xs font-bold">
                    {item.likes}
                  </TableCell>

                  {/* 4. Thao tác (Heart + Booking Icon Button) */}
                  <TableCell className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Heart Follow Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleFollow(item)}
                        className={`cursor-pointer rounded-lg p-1.5 transition-colors ${
                          isFollowing
                            ? "bg-rose-500/10 text-rose-500"
                            : "text-muted-foreground hover:bg-muted hover:text-rose-500"
                        }`}
                        title={
                          isFollowing ? "Bỏ thích/theo dõi" : "Thích/theo dõi"
                        }
                        aria-label="Thích"
                      >
                        <Heart
                          className={`size-4 ${
                            isFollowing ? "fill-rose-500 text-rose-500" : ""
                          }`}
                        />
                      </button>

                      {/* Booking Button */}
                      <button
                        type="button"
                        onClick={() => handleBooking(item)}
                        className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground cursor-pointer rounded-lg p-1.5 transition-all"
                        title="Booking cosplayer"
                        aria-label="Booking"
                      >
                        <Calendar className="size-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
