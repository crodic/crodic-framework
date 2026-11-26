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
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

export interface MobileSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SUGGESTED_SEARCHES = [
  "Acheron",
  "Raiden Shogun",
  "Honkai Star Rail",
  "Kafka",
  "Genshin Impact",
  "Frieren",
  "Festival",
];

export function MobileSearchDialog({
  open,
  onOpenChange,
}: MobileSearchDialogProps) {
  const router = useRouter();
  const t = useTranslations("Explore");
  const tCommon = useTranslations("Common");
  const tNav = useTranslations("Navigation");
  const [query, setQuery] = useState("");

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("kosume_recent_searches");
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const handleSearch = (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      const updated = [trimmed, ...prev.filter((t) => t !== trimmed)].slice(
        0,
        8
      );
      try {
        localStorage.setItem("kosume_recent_searches", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    onOpenChange(false);
    router.push(`/explore?q=${encodeURIComponent(trimmed)}`);
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem("kosume_recent_searches");
    } catch {}
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className="bg-background max-h-[85dvh] gap-4 overflow-y-auto rounded-xl p-4 sm:p-6"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{t("searchPlaceholder")}</DialogTitle>
        </DialogHeader>

        {/* Search input form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              aria-label={tCommon("search")}
              className="h-11 w-full rounded-lg pr-10 pl-9 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setQuery("")}
                aria-label={tNav("clearSearch")}
                className="text-muted-foreground absolute top-1/2 right-1 -translate-y-1/2"
              >
                <X aria-hidden="true" />
              </Button>
            )}
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={!query.trim()}
            className="h-11 rounded-lg px-3"
          >
            {tCommon("search")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            aria-label={tCommon("close")}
            className="text-muted-foreground size-11 rounded-lg"
          >
            <X aria-hidden="true" />
          </Button>
        </form>

        {/* Suggestions & Recent searches */}
        <div className="space-y-4">
          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between gap-2 text-sm font-medium">
                <h2>{t("recentSearches")}</h2>
                <button
                  type="button"
                  onClick={handleClearRecent}
                  className="text-muted-foreground hover:text-foreground min-h-8 cursor-pointer underline-offset-4 hover:underline"
                >
                  {t("clearRecent")}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleSearch(item)}
                    className="filter-button"
                  >
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular searches */}
          <div>
            <h2 className="mb-2 text-sm font-medium">{t("popularSearches")}</h2>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_SEARCHES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleSearch(item)}
                  className="filter-button"
                >
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
