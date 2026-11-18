"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getPosts } from "@/services/posts";
import { AlbumCard } from "./album-card";
import { Skeleton } from "@/components/ui/skeleton";

export function AlbumShowcase() {
  const t = useTranslations("Landing.albums");
  const { data: postsResponse, isLoading } = useQuery({
    queryKey: ["landing-albums"],
    queryFn: () => getPosts({ limit: 4 }),
  });

  const albums = postsResponse?.data || [];

  return (
    <section id="albums" className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-6 flex items-center justify-between sm:mb-8">
          <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            {t("title")}
          </h2>
        </div>

        {/* 4 Album Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className="aspect-[3/4] rounded-2xl sm:aspect-[9/13]"
              />
            ))}
          </div>
        ) : albums.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
