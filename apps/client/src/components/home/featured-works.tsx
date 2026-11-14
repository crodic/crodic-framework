"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { BadgeCheck, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { HOME_FEATURED_WORKS } from "./home-data";
import { ShowcaseWork } from "./home-types";
import { cn } from "@/lib/utils";

function WorkCard({ work }: { work: ShowcaseWork }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(work.likesCount);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked((prev) => !prev);
    if (!isLiked) {
      setLikes((current) => {
        const num = parseFloat(current);
        return isNaN(num) ? "3.5K" : `${(num + 0.1).toFixed(1)}K`;
      });
    } else {
      setLikes(work.likesCount);
    }
  };

  return (
    <Card className="group border-border/70 bg-card/60 hover:border-primary/50 hover:shadow-primary/5 flex flex-col justify-between gap-0 overflow-hidden rounded-2xl p-0 backdrop-blur-sm transition-all duration-300 hover:shadow-md">
      {/* Top Image Showcase - Full Bleed (Click to open Post Detail Modal) */}
      <Link
        href={`/post/${work.id}`}
        className="bg-muted relative block aspect-[4/3.6] w-full cursor-pointer overflow-hidden"
      >
        <Image
          src={work.coverImage}
          alt={work.title}
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top-Right Tag Badge */}
        {work.categoryBadge && (
          <span className="absolute top-2.5 right-2.5 rounded-full border border-white/10 bg-black/60 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md select-none">
            {work.categoryBadge}
          </span>
        )}

        {/* Bottom-Right Heart Like Badge */}
        <button
          type="button"
          onClick={handleLike}
          className={cn(
            "absolute right-2.5 bottom-2.5 z-10 inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-md transition-all select-none",
            isLiked
              ? "border-rose-500/50 bg-rose-500/25 text-rose-300"
              : "border-white/10 bg-black/60 text-white hover:bg-black/80"
          )}
          aria-label={`Thích ${work.title}`}
        >
          <Heart className="size-3 fill-rose-500 text-rose-500" />
          <span>{likes}</span>
        </button>
      </Link>

      {/* Info & Actions below image */}
      <CardContent className="flex flex-1 flex-col justify-between space-y-2.5 p-3 sm:p-3.5">
        <div className="space-y-1.5">
          <Link href={`/post/${work.id}`} className="block">
            <h3 className="text-foreground group-hover:text-primary line-clamp-1 text-sm font-bold transition-colors">
              {work.title}
            </h3>
          </Link>

          {/* Author Row (Links to public cosplayer profile) */}
          <Link
            href={`/cosplayer/${work.author.name.toLowerCase() === "soriko" ? "soriko" : "kiriko"}`}
            className="group/author flex items-center gap-2 transition-opacity hover:opacity-85"
          >
            <div className="border-border/80 bg-muted relative size-6 shrink-0 overflow-hidden rounded-full border">
              <Image
                src={work.author.avatarUrl}
                alt={work.author.name}
                fill
                sizes="24px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-foreground group-hover/author:text-primary truncate text-xs font-semibold transition-colors">
                  {work.author.name}
                </span>
                {work.author.isVerified && (
                  <BadgeCheck
                    className="size-3 shrink-0 fill-sky-400/20 text-sky-400"
                    aria-label="Đã xác minh"
                  />
                )}
              </div>
              <p className="text-muted-foreground truncate text-[10px]">
                {work.author.role}
              </p>
            </div>
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="border-border/80 bg-background/50 hover:bg-muted h-8 cursor-pointer rounded-lg px-2 text-xs font-medium transition-colors"
          >
            <Link href={`/post/${work.id}`}>Xem dự án</Link>
          </Button>

          <Button
            asChild
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 h-8 cursor-pointer rounded-lg px-2 text-xs font-semibold shadow-xs transition-colors"
          >
            <a href={work.bookingHref}>Booking</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function FeaturedWorks() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-lg font-bold tracking-tight sm:text-xl">
          Tác phẩm mới nổi bật
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {HOME_FEATURED_WORKS.map((work) => (
          <WorkCard key={work.id} work={work} />
        ))}
      </div>
    </section>
  );
}
