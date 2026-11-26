"use client";

import React, { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Clock,
  Hash,
  Loader2,
  Search,
  TrendingUp,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import {
  autocompleteTags,
  getTrendingTags,
  type TagAutocompleteItemDto,
  type TagSummaryResDto,
} from "@/services/tags";

export interface MobileSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSearchDialog({
  open,
  onOpenChange,
}: MobileSearchDialogProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Explore");
  const tCommon = useTranslations("Common");
  const tNav = useTranslations("Navigation");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query.trim(), 250);

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

  const { data: trendingTags = [] } = useQuery<TagSummaryResDto[]>({
    queryKey: ["mobile-search-trending-tags", locale],
    queryFn: async () => {
      const list = await getTrendingTags(8, locale);
      return list.filter((item) => item.usageCount > 0);
    },
    enabled: open,
    staleTime: 60 * 1000,
  });

  const { data: autocompleteResults = [], isFetching: isSearchingTags } =
    useQuery<TagAutocompleteItemDto[]>({
      queryKey: ["mobile-search-autocomplete", debouncedQuery, locale],
      queryFn: () => autocompleteTags(debouncedQuery, locale),
      enabled: open && debouncedQuery.length >= 1,
      staleTime: 30 * 1000,
    });

  const handleSearch = (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      const updated = [
        trimmed,
        ...prev.filter((item) => item !== trimmed),
      ].slice(0, 8);
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

  const trimmedQuery = query.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className="bg-background border-border top-4 max-h-[82dvh] translate-y-0 gap-0 overflow-hidden rounded-2xl border p-0 shadow-xl sm:top-[14%] sm:max-w-lg"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{t("searchPlaceholder")}</DialogTitle>
        </DialogHeader>

        {/* Integrated Search Bar */}
        <form
          onSubmit={handleSubmit}
          className="border-border flex items-center gap-2.5 border-b px-3.5 py-2.5"
        >
          <Search
            className="text-muted-foreground size-4 shrink-0"
            aria-hidden="true"
          />
          <input
            autoFocus
            type="search"
            enterKeyHint="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={tCommon("search")}
            className="text-foreground placeholder:text-muted-foreground h-9 min-w-0 flex-1 bg-transparent text-sm outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={tNav("clearSearch")}
              className="text-muted-foreground hover:bg-muted hover:text-foreground grid size-7 shrink-0 cursor-pointer place-items-center rounded-md transition-colors"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          )}
          {trimmedQuery ? (
            <Button
              type="submit"
              size="icon-sm"
              className="size-8 shrink-0 rounded-lg"
              aria-label={tCommon("search")}
            >
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label={tCommon("close")}
              className="text-muted-foreground hover:bg-muted hover:text-foreground grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg transition-colors"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </form>

        {/* Scrollable Body */}
        <div className="max-h-[calc(82dvh-3.75rem)] overflow-y-auto p-3.5">
          {trimmedQuery ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleSearch(trimmedQuery)}
                className="bg-muted/40 hover:bg-muted flex min-h-10 w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-colors"
              >
                <Search
                  className="text-primary size-4 shrink-0"
                  aria-hidden="true"
                />
                <span className="text-foreground truncate text-sm font-medium">
                  {trimmedQuery}
                </span>
                <ArrowRight
                  className="text-muted-foreground ms-auto size-3.5 shrink-0"
                  aria-hidden="true"
                />
              </button>

              {isSearchingTags ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="text-muted-foreground size-4 animate-spin" />
                </div>
              ) : (
                autocompleteResults.length > 0 && (
                  <div className="space-y-0.5 pt-1">
                    {autocompleteResults.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSearch(item.name)}
                        className="hover:bg-muted/60 flex min-h-10 w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-colors"
                      >
                        <Hash
                          className="text-muted-foreground size-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-foreground truncate text-sm font-medium">
                            {item.name}
                          </span>
                          {item.translatedName &&
                            item.translatedName !== item.name && (
                              <span className="text-muted-foreground ms-1.5 text-xs">
                                ({item.translatedName})
                              </span>
                            )}
                        </div>
                        {item.usageCount > 0 && (
                          <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                            {item.usageCount}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )
              )}
            </div>
          ) : recentSearches.length === 0 && trendingTags.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-xs">
              {t("exploreDesc")}
            </p>
          ) : (
            <div className="space-y-4">
              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <h2 className="text-muted-foreground flex items-center gap-1.5 font-medium">
                      <Clock className="size-3.5" aria-hidden="true" />
                      <span>{t("recentSearches")}</span>
                    </h2>
                    <button
                      type="button"
                      onClick={handleClearRecent}
                      className="text-muted-foreground hover:text-foreground min-h-7 cursor-pointer text-xs underline-offset-4 hover:underline"
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
                        className="border-border bg-muted/40 hover:bg-muted text-foreground inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors"
                      >
                        <span>{item}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Live trending tags from backend */}
              {trendingTags.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                    <TrendingUp
                      className="text-primary size-3.5"
                      aria-hidden="true"
                    />
                    <span>{t("trendingFandoms")}</span>
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {trendingTags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleSearch(tag.name)}
                        className="border-border bg-muted/40 hover:bg-muted text-foreground inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors"
                      >
                        <span>#{tag.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
