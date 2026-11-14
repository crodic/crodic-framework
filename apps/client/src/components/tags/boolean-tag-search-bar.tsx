"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  CornerDownLeft,
  HelpCircle,
  Search,
  Tag as TagIcon,
  X,
} from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useTagAutocomplete } from "@/services/tags";
import {
  getTagCategoryToken,
  parseInitialQuery,
  serializeQueryTokens,
  type QueryToken,
  type TokenMode,
} from "./tag-tokens";

export {
  parseInitialQuery,
  serializeQueryTokens,
  type QueryToken,
  type TokenMode,
};

export function BooleanTagSearchBar({
  initialQuery = "",
  locale = "en",
  expandHierarchy = true,
}: {
  initialQuery?: string;
  locale?: string;
  expandHierarchy?: boolean;
}) {
  const t = useTranslations("Tags");
  const router = useRouter();
  const [tokens, setTokens] = useState<QueryToken[]>(() =>
    parseInitialQuery(initialQuery)
  );
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { data: suggestions = [] } = useTagAutocomplete(
    inputValue.replace(/^-/, ""),
    locale,
    isOpen
  );

  // Reset activeIndex when suggestions change
  useEffect(() => {
    setActiveIndex(-1);
  }, [suggestions]);

  const runSearch = (nextTokens: QueryToken[]) => {
    const serialized = serializeQueryTokens(nextTokens);
    const params = new URLSearchParams();
    if (serialized) params.set("q", serialized);
    if (!expandHierarchy) params.set("expand", "false");
    const qs = params.toString();
    router.push(qs ? `/explore?${qs}` : "/explore");
  };

  const pushToken = (rawVal: string) => {
    const trimmed = rawVal.replace(/^#+/, "").trim();
    if (!trimmed) return;

    // Power syntax: -tag excludes
    const detectedNot = trimmed.startsWith("-") && trimmed.length > 1;
    const effectiveMode: TokenMode = detectedNot ? "not" : "and";
    const cleanWord = detectedNot
      ? trimmed.slice(1).replace(/\s+/g, "_")
      : trimmed.replace(/\s+/g, "_");

    if (!cleanWord) return;
    const updated: QueryToken[] = [
      ...tokens.filter(
        (tok) => tok.value.toLowerCase() !== cleanWord.toLowerCase()
      ),
      { mode: effectiveMode, value: cleanWord },
    ];
    setTokens(updated);
    setInputValue("");
    setIsOpen(false);
    setActiveIndex(-1);
    runSearch(updated);
  };

  const removeTokenAt = (idx: number) => {
    const updated = tokens.filter((_, i) => i !== idx);
    setTokens(updated);
    runSearch(updated);
  };

  const toggleTokenMode = (idx: number) => {
    const target = tokens[idx];
    if (!target) return;
    const nextMode: TokenMode = target.mode === "not" ? "and" : "not";
    const updated = tokens.map((tok, i) =>
      i === idx ? { ...tok, mode: nextMode } : tok
    );
    setTokens(updated);
    runSearch(updated);
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Clean, Frictionless Search Bar */}
      <div className="relative">
        <div
          className={cn(
            "bg-card/90 border-border/80 relative flex min-h-12 w-full flex-wrap items-center gap-1.5 rounded-2xl border px-3 py-1.5 shadow-sm backdrop-blur-md transition-all",
            "focus-within:border-primary/60 focus-within:ring-primary/15 focus-within:shadow-md focus-within:ring-3"
          )}
        >
          <Search
            className="text-muted-foreground mr-0.5 ml-1 size-4 shrink-0"
            aria-hidden="true"
          />

          {/* Active Tag Filter Badges */}
          {tokens.map((tok, idx) => {
            const isNot = tok.mode === "not";

            return (
              <Badge
                key={`${tok.mode}-${tok.value}-${idx}`}
                variant="outline"
                className={cn(
                  "group/tok gap-1 rounded-lg px-2 py-0.5 text-xs font-medium whitespace-nowrap shadow-2xs transition-all",
                  isNot
                    ? "border-rose-200/80 bg-rose-50/80 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
                    : "border-primary/20 bg-primary/5 text-foreground"
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleTokenMode(idx)}
                  title={
                    isNot
                      ? "Excluded tag (click to include)"
                      : "Included tag (click to exclude)"
                  }
                  className="cursor-pointer hover:underline"
                >
                  {isNot ? `-${tok.value}` : `#${tok.value}`}
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${tok.value}`}
                  onClick={() => removeTokenAt(idx)}
                  className="hover:bg-foreground/10 ml-0.5 cursor-pointer rounded-full p-0.5 transition-colors"
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              </Badge>
            );
          })}

          {/* Search Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onFocus={() => setIsOpen(true)}
            onBlur={() => {
              window.setTimeout(() => setIsOpen(false), 200);
            }}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                if (!isOpen && suggestions.length > 0) {
                  setIsOpen(true);
                  return;
                }
                e.preventDefault();
                setActiveIndex((prev) =>
                  prev < suggestions.length - 1 ? prev + 1 : 0
                );
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex((prev) =>
                  prev > 0 ? prev - 1 : suggestions.length - 1
                );
              } else if (e.key === "Escape") {
                setIsOpen(false);
                setActiveIndex(-1);
              } else if (e.key === "Enter") {
                e.preventDefault();
                if (activeIndex >= 0 && suggestions[activeIndex]) {
                  pushToken(suggestions[activeIndex].slug);
                } else if (inputValue.trim()) {
                  pushToken(inputValue);
                } else {
                  runSearch(tokens);
                }
              } else if (
                e.key === "Backspace" &&
                !inputValue &&
                tokens.length > 0
              ) {
                removeTokenAt(tokens.length - 1);
              }
            }}
            placeholder={
              tokens.length === 0
                ? locale === "vi"
                  ? "Tìm kiếm thẻ (#character, -exclude)..."
                  : "Search tags (#character, -exclude)..."
                : locale === "vi"
                  ? "Thêm thẻ khác..."
                  : "Add another tag..."
            }
            aria-label="Tag search input"
            className="placeholder:text-muted-foreground/60 text-foreground min-w-36 flex-1 bg-transparent px-1 text-sm font-normal outline-none"
          />

          {/* Right Action Controls */}
          <div className="flex shrink-0 items-center gap-1.5">
            {tokens.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setTokens([]);
                  router.push("/explore");
                }}
                className="text-muted-foreground cursor-pointer rounded-md px-1.5 py-1 text-[11px] transition-colors hover:text-rose-600"
              >
                {locale === "vi" ? "Xoá bộ lọc" : "Clear"}
              </button>
            )}

            {/* Quick Power Syntax Help Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  title="Search Syntax Help"
                  aria-label="Search tips"
                  className="text-muted-foreground hover:text-foreground cursor-pointer rounded-md p-1 transition-colors"
                >
                  <HelpCircle className="size-3.5" aria-hidden="true" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-72 space-y-2 rounded-xl p-3 text-xs shadow-xl"
              >
                <div className="text-foreground flex items-center gap-1.5 font-bold">
                  <HelpCircle className="text-primary size-3.5" />
                  <span>
                    {locale === "vi" ? "Mẹo tìm kiếm thẻ" : "Tag Search Tips"}
                  </span>
                </div>
                <div className="text-muted-foreground space-y-1.5 text-[11px] leading-relaxed">
                  <p>
                    <code className="bg-muted text-foreground rounded px-1 py-0.5 font-mono">
                      tag1 tag2
                    </code>{" "}
                    :{" "}
                    {locale === "vi"
                      ? "Kết hợp tất cả thẻ (AND)"
                      : "Matches all tags (AND)"}
                  </p>
                  <p>
                    <code className="bg-muted rounded px-1 py-0.5 font-mono text-rose-600 dark:text-rose-400">
                      -tag
                    </code>{" "}
                    :{" "}
                    {locale === "vi"
                      ? "Loại trừ thẻ khỏi kết quả (NOT)"
                      : "Excludes tag (NOT)"}
                  </p>
                  <p>
                    {locale === "vi"
                      ? "Nhấn Enter để thêm thẻ vào bộ lọc. Nhấp vào thẻ để đổi giữa gồm / loại trừ."
                      : "Press Enter to add tags. Click any chip to toggle include/exclude."}
                  </p>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (inputValue.trim()) {
                  pushToken(inputValue);
                } else {
                  runSearch(tokens);
                }
              }}
              className="h-8 gap-1 rounded-xl px-3 text-xs font-semibold shadow-xs"
            >
              <span>{t("searchBtn")}</span>
              <CornerDownLeft
                className="size-3 opacity-70"
                aria-hidden="true"
              />
            </Button>
          </div>
        </div>

        {/* Command Palette Autocomplete Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div
            ref={listRef}
            role="listbox"
            aria-label="Tag suggestions"
            className="bg-popover/98 border-border/80 animate-in fade-in-0 zoom-in-95 absolute top-full right-0 left-0 z-50 mt-1.5 max-h-80 overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl duration-100"
          >
            {/* Header info */}
            <div className="text-muted-foreground bg-muted/40 border-border/60 flex items-center justify-between border-b px-3.5 py-1.5 text-[11px]">
              <span className="flex items-center gap-1.5 font-medium">
                <Search className="text-primary size-3.5" aria-hidden="true" />
                {locale === "vi" ? "Gợi ý thẻ phù hợp" : "Matching tags"}
              </span>
              <span className="font-mono text-[10px]">
                {suggestions.length} {locale === "vi" ? "kết quả" : "results"}
              </span>
            </div>

            {/* Suggestions list */}
            <div className="divide-border/40 max-h-68 divide-y overflow-y-auto">
              {suggestions.map((item, idx) => {
                const cat = getTagCategoryToken(item.category);
                const isSelected = idx === activeIndex;

                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      pushToken(item.slug);
                    }}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between gap-3 px-3.5 py-2 text-left text-xs transition-colors",
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted/70 text-foreground"
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={cn("size-2 shrink-0 rounded-full", cat.dot)}
                        aria-hidden="true"
                      />
                      <div className="flex min-w-0 items-baseline gap-1.5">
                        <span className="truncate font-semibold transition-colors">
                          #{item.translatedName || item.name}
                        </span>
                        {item.translatedName &&
                          item.translatedName !== item.name && (
                            <span className="text-muted-foreground truncate font-mono text-[11px]">
                              ({item.name})
                            </span>
                          )}
                      </div>
                      {item.matchedAlias && (
                        <Badge
                          variant="outline"
                          className="bg-muted/50 text-muted-foreground px-1.5 py-0 font-mono text-[10px]"
                        >
                          alias: {item.matchedAlias}
                        </Badge>
                      )}
                    </div>

                    <div className="text-muted-foreground flex shrink-0 items-center gap-2">
                      <span className="bg-muted/50 inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[11px] tabular-nums">
                        <TagIcon
                          className="size-3 opacity-60"
                          aria-hidden="true"
                        />
                        {item.usageCount.toLocaleString()}
                      </span>
                      <CornerDownLeft
                        className={cn(
                          "text-primary size-3 transition-opacity",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                        aria-hidden="true"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
