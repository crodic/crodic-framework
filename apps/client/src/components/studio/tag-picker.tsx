"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, X, Flame, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  // 1. Fetch trending tags for quick suggestions
  const { data: trendingTags = [] } = useQuery<TagSummaryResDto[]>({
    queryKey: ["studio-trending-tags", locale],
    queryFn: () => getTrendingTags(10, locale),
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
    if (value.some((v) => v.trim().toLowerCase() === clean.toLowerCase())) {
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

  // Combine contextual hints (character and fandom) into smart suggestions without duplicates
  const contextualHints = React.useMemo(() => {
    const seen = new Set(value.map((v) => v.trim().toLowerCase()));
    const hints: string[] = [];
    for (const raw of [fandomHint, characterHint]) {
      const trimmed = raw?.trim();
      if (trimmed && !seen.has(trimmed.toLowerCase())) {
        seen.add(trimmed.toLowerCase());
        hints.push(trimmed);
      }
    }
    return hints;
  }, [characterHint, fandomHint, value]);

  return (
    <div ref={containerRef} className={cn("space-y-3", className)}>
      {/* A. Selected Tags Container */}
      <div className="flex flex-wrap items-center gap-2">
        {value.map((tag, idx) => (
          <span
            key={`${tag}-${idx}`}
            className="bg-muted text-foreground inline-flex max-w-full items-center gap-1 rounded-md px-2 py-0.5 text-sm"
          >
            <span className="text-primary/70">#</span>
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="text-muted-foreground hover:text-foreground hover:bg-background focus-visible:ring-ring flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md focus-visible:ring-2"
              aria-label={t("removeTag", { tag })}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}

        {value.length === 0 && (
          <span className="text-muted-foreground text-xs">
            {t("noTagsYet")}
          </span>
        )}
      </div>

      {/* B. Input Field with Autocomplete & Custom Tag Option */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
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
              className="h-10 ps-7"
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
            className="h-10"
          >
            <Plus className="mr-1 size-3.5" />
            <span>{t("addTag")}</span>
          </Button>
        </div>

        {/* C. Autocomplete Dropdown */}
        {isOpen && trimmedInput.length > 0 && (
          <div className="bg-popover absolute start-0 top-full z-50 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border p-1.5 shadow-md">
            {/* Custom tag add CTA if not exact match */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleAddTag(trimmedInput)}
              className="hover:bg-primary/10 text-primary flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-start text-sm font-semibold transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span>
                  {t("addCustomTag")}:{" "}
                  <strong className="underline">#{trimmedInput}</strong>
                </span>
              </div>
            </button>

            {/* System Tag Management Autocomplete items */}
            {suggestions.length > 0 && (
              <div className="border-border/40 mt-1 border-t pt-1">
                <div className="text-muted-foreground px-2 py-1 text-xs font-medium">
                  {t("systemTags")}
                </div>
                {suggestions.map((sug) => {
                  const isSelected = value.includes(sug.name);
                  return (
                    <button
                      key={sug.id}
                      type="button"
                      disabled={isSelected}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleAddTag(sug.name)}
                      className={cn(
                        "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-start text-sm transition-colors",
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
                          <span className="text-muted-foreground text-xs tabular-nums">
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
            {contextualHints.map((hint, idx) => (
              <button
                key={`hint-${idx}-${hint.toLowerCase()}`}
                type="button"
                onClick={() => handleToggleSuggestion(hint)}
                className="border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary inline-flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors select-none"
              >
                <Plus className="size-3" />
                <span>#{hint}</span>
              </button>
            ))}

            {/* Trending system tags */}
            {trendingTags
              .filter(
                (tag) =>
                  !contextualHints.some(
                    (hint) => hint.toLowerCase() === tag.name.toLowerCase()
                  )
              )
              .slice(0, 8)
              .map((tag) => {
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
