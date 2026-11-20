"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, X, Sparkles, Flame, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import {
  autocompleteTags,
  getTrendingTags,
  type TagAutocompleteItemDto,
  type TagSummaryResDto,
} from "@/services/tags";
import { cn } from "@/lib/utils";

export interface TagPickerProps {
  value: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  characterHint?: string;
  fandomHint?: string;
  className?: string;
}

export function TagPicker({
  value = [],
  onChange,
  maxTags = 10,
  characterHint,
  fandomHint,
  className,
}: TagPickerProps) {
  const t = useTranslations("Studio");
  const locale = useLocale();
  const [inputVal, setInputVal] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Fetch trending system tags for quick suggestions (prioritizing fandoms/characters)
  const { data: trendingTags = [] } = useQuery<TagSummaryResDto[]>({
    queryKey: ["studio-trending-tags", locale],
    queryFn: async () => {
      const fandoms = await getTrendingTags(10, locale, "copyright");
      if (fandoms && fandoms.length >= 4) return fandoms;
      return getTrendingTags(10, locale);
    },
    staleTime: 60 * 1000,
  });

  // 2. Fetch autocomplete suggestions from Tag Management
  const trimmedInput = inputVal.trim().replace(/^#/, "");
  const { data: suggestions = [] } = useQuery<TagAutocompleteItemDto[]>({
    queryKey: ["studio-autocomplete-tags", trimmedInput, locale],
    queryFn: () => autocompleteTags(trimmedInput, locale),
    enabled: isOpen && trimmedInput.length > 0,
    staleTime: 20 * 1000,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddTag = (rawTag: string) => {
    const clean = rawTag.trim().replace(/^#/, "");
    if (!clean) return;
    if (value.includes(clean)) {
      setInputVal("");
      setIsOpen(false);
      return;
    }
    if (value.length >= maxTags) {
      return;
    }
    onChange([...value, clean]);
    setInputVal("");
    setIsOpen(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(value.filter((t) => t !== tagToRemove));
  };

  const handleToggleSuggestion = (tagName: string) => {
    if (value.includes(tagName)) {
      handleRemoveTag(tagName);
    } else {
      handleAddTag(tagName);
    }
  };

  // Combine contextual hints (character and fandom) into smart suggestions
  const contextualHints = React.useMemo(() => {
    const hints: string[] = [];
    if (fandomHint?.trim()) hints.push(fandomHint.trim());
    if (characterHint?.trim()) hints.push(characterHint.trim());
    return hints.filter((h) => !value.includes(h));
  }, [characterHint, fandomHint, value]);

  return (
    <div ref={containerRef} className={cn("space-y-3", className)}>
      {/* A. Selected Tags Container */}
      <div className="flex min-h-[36px] flex-wrap items-center gap-1.5">
        {value.map((tag) => (
          <span
            key={tag}
            className="group bg-primary/10 text-primary border-primary/20 hover:border-primary/40 inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all select-none"
          >
            <span className="text-primary/70">#</span>
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="text-primary/60 hover:text-primary hover:bg-primary/20 -mr-1 ml-0.5 cursor-pointer rounded-full p-0.5 transition-colors"
              title={t("removeTag", { tag })}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}

        {value.length === 0 && (
          <span className="text-muted-foreground/60 text-xs italic select-none">
            {t("noTagsYet")}
          </span>
        )}
      </div>

      {/* B. Input Field with Autocomplete & Custom Tag Option */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs font-bold">
              #
            </span>
            <Input
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (trimmedInput) {
                    handleAddTag(trimmedInput);
                  }
                } else if (e.key === "Escape") {
                  setIsOpen(false);
                }
              }}
              disabled={value.length >= maxTags}
              placeholder={
                value.length >= maxTags
                  ? t("tagLimitReached")
                  : t("tagInputPlaceholder")
              }
              className="border-border/70 bg-background/50 focus-visible:ring-primary/40 focus-visible:border-primary/60 h-9.5 rounded-xl pr-3 pl-7 text-xs sm:text-sm"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (trimmedInput) handleAddTag(trimmedInput);
            }}
            disabled={!trimmedInput || value.length >= maxTags}
            className="border-border/70 hover:border-primary/60 hover:text-primary h-9.5 cursor-pointer rounded-xl px-3 text-xs font-semibold"
          >
            <Plus className="mr-1 size-3.5" />
            <span>{t("addTag")}</span>
          </Button>
        </div>

        {/* C. Autocomplete Dropdown */}
        {isOpen && trimmedInput.length > 0 && (
          <div className="border-border/80 bg-popover/95 absolute top-full left-0 z-50 mt-1.5 max-h-56 w-full overflow-y-auto rounded-2xl border p-1.5 shadow-2xl backdrop-blur-md">
            {/* Custom tag add CTA if not exact match */}
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleAddTag(trimmedInput);
              }}
              className="hover:bg-primary/10 text-primary flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-3.5" />
                <span>
                  {t("addCustomTag")}:{" "}
                  <strong className="underline">#{trimmedInput}</strong>
                </span>
              </div>
              <Badge
                variant="outline"
                className="border-primary/30 text-[10px] font-normal"
              >
                Custom
              </Badge>
            </button>

            {/* System Tag Management Autocomplete items */}
            {suggestions.length > 0 && (
              <div className="border-border/40 mt-1 border-t pt-1">
                <div className="text-muted-foreground/80 px-2 py-1 text-[10px] font-bold tracking-wider uppercase">
                  {t("systemTags")}
                </div>
                {suggestions.map((sug) => {
                  const isSelected = value.includes(sug.name);
                  return (
                    <button
                      key={sug.id}
                      type="button"
                      disabled={isSelected}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleAddTag(sug.name);
                      }}
                      className={cn(
                        "flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors",
                        isSelected
                          ? "bg-muted/30 cursor-not-allowed opacity-50"
                          : "hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-foreground font-semibold">
                          #{sug.name}
                        </span>
                        {sug.category && (
                          <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-[10px] capitalize">
                            {sug.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {sug.usageCount > 0 && (
                          <span className="text-muted-foreground text-[11px] tabular-nums">
                            {sug.usageCount.toLocaleString()}
                          </span>
                        )}
                        {isSelected && (
                          <Check className="text-primary size-3.5" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* D. Quick Suggestions Chips */}
      {(contextualHints.length > 0 || trendingTags.length > 0) && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
              <Flame className="size-3 fill-amber-500 text-amber-500" />
              <span>{t("popularSuggestions")}</span>
            </span>
            <span className="text-muted-foreground/60 text-[10px]">
              {value.length}/{maxTags}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Contextual hints from character/fandom */}
            {contextualHints.map((hint) => (
              <button
                key={`hint-${hint}`}
                type="button"
                onClick={() => handleToggleSuggestion(hint)}
                className="border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary inline-flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors select-none"
              >
                <Plus className="size-3" />
                <span>#{hint}</span>
              </button>
            ))}

            {/* Trending system tags */}
            {trendingTags.slice(0, 8).map((tag) => {
              const isSelected = value.includes(tag.name);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleToggleSuggestion(tag.name)}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1 rounded-lg border px-2 py-0.5 text-xs transition-colors select-none",
                    isSelected
                      ? "border-primary/60 bg-primary/20 text-primary font-semibold"
                      : "border-border/60 bg-card/60 hover:bg-muted text-muted-foreground hover:text-foreground font-normal"
                  )}
                >
                  {isSelected ? (
                    <Check className="size-3" />
                  ) : (
                    <Plus className="size-3 opacity-60" />
                  )}
                  <span>#{tag.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
