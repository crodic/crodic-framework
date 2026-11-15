"use client";

import React, { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Flame, History, Search, TrendingUp, X } from "lucide-react";

export interface MobileSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const POPULAR_SEARCHES = [
  "Acheron",
  "Raiden Shogun",
  "KIRIKO",
  "Honkai Star Rail",
  "Kafka",
  "Genshin Impact",
  "Frieren",
  "Cosplay Festival 2026",
];

const RECENT_SEARCHES = [
  "Acheron cyberpunk",
  "Soriko prop crafting",
  "WIP cosplay",
];

export function MobileSearchDialog({
  open,
  onOpenChange,
}: MobileSearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    onOpenChange(false);
    router.push(`/explore?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border/80 bg-background/95 fixed top-0 right-0 left-0 z-50 m-0 max-h-none w-full max-w-full translate-x-0 translate-y-0 rounded-none border-b p-4 shadow-2xl backdrop-blur-md sm:hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Tìm kiếm trên Kosume</DialogTitle>
        </DialogHeader>

        {/* Search input form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-2">
          <div className="relative flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm nhân vật, cosplayer, series..."
              className="border-border/80 bg-muted/40 focus-visible:ring-primary/40 focus-visible:border-primary/60 h-10 w-full rounded-xl pr-9 pl-9 text-xs"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded-full p-0.5"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <Button
            type="submit"
            size="sm"
            className="bg-primary text-primary-foreground h-10 rounded-xl px-3 text-xs font-semibold"
          >
            Tìm
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground h-10 px-2 text-xs"
          >
            Đóng
          </Button>
        </form>

        {/* Suggestions & Recent searches */}
        <div className="mt-4 space-y-4 pb-2">
          {/* Recent searches */}
          <div>
            <div className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs font-semibold">
              <History className="size-3.5" />
              <span>Tìm kiếm gần đây</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {RECENT_SEARCHES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleSearch(item)}
                  className="border-border/60 bg-card/60 hover:bg-muted text-foreground/90 flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1 text-xs transition-colors"
                >
                  <span>{item}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Popular searches */}
          <div>
            <div className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs font-semibold">
              <Flame className="size-3.5 fill-amber-500 text-amber-500" />
              <span>Gợi ý tìm kiếm thịnh hành</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SEARCHES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleSearch(item)}
                  className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors"
                >
                  <TrendingUp className="size-3" />
                  <span>{item}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
