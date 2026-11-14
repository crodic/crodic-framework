"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Check, Flame, SearchX, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EXPLORE_ITEMS, EXPLORE_TAGS } from "./explore-data";
import { ExploreCard } from "./explore-card";
import { cn } from "@/lib/utils";

const FILTER_TABS = [
  { id: "all", label: "Tất cả" },
  { id: "works", label: "Tác phẩm" },
  { id: "cosplayers", label: "Cosplayers" },
  { id: "characters", label: "Nhân vật / Series" },
];

export function ExploreFeed() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");

  // Keep search input in sync if URL query changes
  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedTag("all");
    router.replace("/explore");
  };

  // Filter items based on activeTab, selectedTag, and searchQuery
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return EXPLORE_ITEMS.filter((item) => {
      // 1. Tag filter
      if (selectedTag !== "all" && item.tag !== selectedTag) {
        return false;
      }

      // 2. Query filter
      if (q) {
        const matchCharacter = item.character.toLowerCase().includes(q);
        const matchAuthor = item.author.name.toLowerCase().includes(q);
        const matchTag = item.tag.toLowerCase().includes(q);
        const matchTagLabel = item.tagLabel.toLowerCase().includes(q);

        if (!matchCharacter && !matchAuthor && !matchTag && !matchTagLabel) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, selectedTag]);

  // Extract unique cosplayers matching the search query
  const matchingCosplayers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const seen = new Set<string>();
    const list: (typeof EXPLORE_ITEMS)[0]["author"][] = [];

    EXPLORE_ITEMS.forEach((item) => {
      if (!seen.has(item.author.name)) {
        seen.add(item.author.name);
        if (!q || item.author.name.toLowerCase().includes(q)) {
          list.push(item.author);
        }
      }
    });

    return list;
  }, [searchQuery]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ======================================================== */}
      {/* 1. CATEGORY TABS & TRENDING TAGS                         */}
      {/* ======================================================== */}
      <div className="space-y-4">
        {/* Category Tabs (Tất cả, Tác phẩm, Cosplayers, Nhân vật) */}
        <div className="border-border/60 flex scrollbar-none items-center gap-2 overflow-x-auto border-b pb-2">
          {FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all select-none sm:text-sm",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Trending Tags Section ("Thẻ xu hướng 🔥") */}
        <div className="flex scrollbar-none items-center gap-2 overflow-x-auto pb-1">
          <div className="text-foreground mr-1 flex shrink-0 items-center gap-1 text-xs font-bold sm:text-sm">
            <span>Xu hướng</span>
            <Flame className="size-3.5 fill-amber-500 text-amber-500" />
          </div>

          {EXPLORE_TAGS.map((tag) => {
            const isActive = selectedTag === tag.id;
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => setSelectedTag(tag.id)}
                className={cn(
                  "cursor-pointer rounded-full px-3.5 py-1 text-xs font-medium whitespace-nowrap transition-all select-none",
                  isActive
                    ? "bg-primary/20 text-primary border-primary/40 border font-semibold"
                    : "bg-card/70 border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted border"
                )}
              >
                {tag.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Search Result Announcement Banner */}
      {searchQuery && (
        <div className="border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary size-4" />
            <span>
              Kết quả tìm kiếm cho:{" "}
              <strong className="text-foreground font-bold">
                &ldquo;{searchQuery}&rdquo;
              </strong>{" "}
              ({filteredItems.length} tác phẩm)
            </span>
          </div>
          <button
            type="button"
            onClick={handleClearSearch}
            className="text-primary cursor-pointer font-semibold hover:underline"
          >
            Xóa tìm kiếm / Xem tất cả
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. MATCHING COSPLAYERS STRIP (if activeTab is cosplayers  */}
      {/*    or query matches cosplayers)                         */}
      {/* ======================================================== */}
      {(activeTab === "cosplayers" ||
        (searchQuery && matchingCosplayers.length > 0)) && (
        <section className="space-y-3">
          <div className="text-foreground flex items-center gap-2 text-sm font-bold">
            <Users className="text-primary size-4" />
            <span>Cosplayers phù hợp</span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {matchingCosplayers.map((cosplayer) => (
              <Link
                key={cosplayer.name}
                href="/cosplayer/kiriko"
                className="border-border/70 bg-card/60 hover:border-primary/50 group flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors"
              >
                <div className="border-border/70 relative size-10 shrink-0 overflow-hidden rounded-full border">
                  <Image
                    src={cosplayer.avatarUrl}
                    alt={cosplayer.name}
                    fill
                    sizes="40px"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1">
                    <span className="text-foreground group-hover:text-primary truncate text-xs font-bold transition-colors">
                      {cosplayer.name}
                    </span>
                    {cosplayer.isVerified && (
                      <span className="bg-primary/20 text-primary flex size-3 shrink-0 items-center justify-center rounded-full">
                        <Check className="size-2 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <span className="text-muted-foreground text-[10px]">
                    Xem Portfolio
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 4. MAIN EXPLORE GRID (Tác phẩm)                         */}
      {/* ======================================================== */}
      {activeTab !== "cosplayers" && (
        <section>
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {filteredItems.map((item) => (
                <ExploreCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="border-border/70 bg-card/40 flex flex-col items-center justify-center rounded-2xl border p-12 text-center">
              <div className="bg-muted/60 text-muted-foreground mb-3 flex size-12 items-center justify-center rounded-full">
                <SearchX className="size-6" />
              </div>
              <h3 className="text-foreground text-base font-bold">
                Không tìm thấy tác phẩm nào
              </h3>
              <p className="text-muted-foreground mt-1 max-w-sm text-xs">
                Không có kết quả nào phù hợp với từ khóa &ldquo;{searchQuery}
                &rdquo;. Hãy thử tìm với tên nhân vật, tựa game hoặc từ khóa
                khác.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSearch}
                className="mt-4 cursor-pointer rounded-xl text-xs font-semibold"
              >
                Xem tất cả tác phẩm
              </Button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
