"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { Film, Plus, Check, Sparkles, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import {
  getMyCharacters,
  type CosplayerCharacterResDto,
} from "@/services/cosplayer";
import { autocompleteTags, type TagAutocompleteItemDto } from "@/services/tags";
import { cn } from "@/lib/utils";

export interface SeriesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectSeries?: (seriesName: string, copyrightTagId?: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

interface SeriesItem {
  id: string;
  seriesName: string;
  copyrightTagId?: string;
  type: "own" | "encyclopedia";
}

export function SeriesAutocomplete({
  value = "",
  onChange,
  onSelectSeries,
  placeholder,
  className,
  disabled,
}: SeriesAutocompleteProps) {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 1. Fetch current cosplayer's showcased characters to get previously cosplayed series
  const { data: myCharacters = [] } = useQuery<CosplayerCharacterResDto[]>({
    queryKey: ["my-cosplayer-characters"],
    queryFn: () => getMyCharacters(),
    staleTime: 60 * 1000,
  });

  // 2. Fetch tag suggestions from global tags encyclopedia
  const trimmedValue = value.trim();
  const { data: tagSuggestions = [] } = useQuery<TagAutocompleteItemDto[]>({
    queryKey: ["series-tag-suggestions", trimmedValue, locale],
    queryFn: () => autocompleteTags(trimmedValue, locale),
    enabled: isOpen && trimmedValue.length > 0,
    staleTime: 20 * 1000,
  });

  // Filter and merge suggestions
  const { ownSeries, encyclopediaSeries, allSuggestions } = useMemo(() => {
    const own: SeriesItem[] = [];
    const enc: SeriesItem[] = [];
    const seenNames = new Set<string>();

    // Priority 1: User's own previously cosplayed series
    for (const char of myCharacters) {
      if (!char.seriesName) continue;
      const match =
        !trimmedValue ||
        char.seriesName.toLowerCase().includes(trimmedValue.toLowerCase());

      const key = char.seriesName.toLowerCase();
      if (match && !seenNames.has(key)) {
        seenNames.add(key);
        own.push({
          id: `own-series-${char.id}`,
          seriesName: char.seriesName,
          copyrightTagId: char.copyrightTagId || undefined,
          type: "own",
        });
      }
    }

    // Priority 2: System tags (copyright / franchise)
    for (const tag of tagSuggestions) {
      const key = tag.name.toLowerCase();
      if (!seenNames.has(key)) {
        seenNames.add(key);
        enc.push({
          id: `tag-${tag.id}`,
          seriesName: tag.name,
          copyrightTagId: tag.id,
          type: "encyclopedia",
        });
      }
    }

    const combined = [...own.slice(0, 5), ...enc.slice(0, 5)];
    return {
      ownSeries: own.slice(0, 5),
      encyclopediaSeries: enc.slice(0, 5),
      allSuggestions: combined,
    };
  }, [myCharacters, tagSuggestions, trimmedValue]);

  const hasExactMatch = allSuggestions.some(
    (s) => s.seriesName.toLowerCase() === trimmedValue.toLowerCase()
  );

  const canCreate = trimmedValue.length > 0 && !hasExactMatch;
  const totalOptionsCount = allSuggestions.length + (canCreate ? 1 : 0);
  const createOptionIndex = canCreate ? allSuggestions.length : -1;

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex < 0 || !listRef.current) return;
    const items = listRef.current.querySelectorAll("[data-autocomplete-item]");
    const activeEl = items[highlightedIndex] as HTMLElement | undefined;
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  const handleSelect = (item: {
    seriesName: string;
    copyrightTagId?: string;
  }) => {
    onChange(item.seriesName);
    if (onSelectSeries) {
      onSelectSeries(item.seriesName, item.copyrightTagId);
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % totalOptionsCount);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev <= 0 ? totalOptionsCount - 1 : prev - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selectedItem = allSuggestions[highlightedIndex];
      if (selectedItem) {
        handleSelect(selectedItem);
      } else if (highlightedIndex === createOptionIndex && canCreate) {
        handleSelect({ seriesName: trimmedValue });
      } else if (trimmedValue) {
        handleSelect({ seriesName: trimmedValue });
      } else {
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const isPopoverOpen = isOpen && (allSuggestions.length > 0 || canCreate);

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsOpen}>
      <PopoverAnchor asChild>
        <div className="relative w-full">
          <Input
            ref={inputRef}
            value={value}
            disabled={disabled}
            placeholder={placeholder}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              onChange(e.target.value);
              setIsOpen(true);
              setHighlightedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            className={cn("h-10", className)}
          />
        </div>
      </PopoverAnchor>

      <PopoverContent
        align="start"
        sideOffset={6}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="z-50 w-(--radix-popover-anchor-width) max-w-(--radix-popover-content-available-width) p-1.5"
      >
        <div ref={listRef} className="max-h-64 space-y-1 overflow-y-auto">
          {/* Group 1: User's previously used series */}
          {ownSeries.length > 0 && (
            <div>
              <div className="text-muted-foreground flex items-center gap-1.5 px-2 py-1 text-xs font-medium">
                <Sparkles className="size-3 text-amber-500" />
                <span>
                  {locale === "vi" ? "Series bạn từng làm" : "From your series"}
                </span>
              </div>
              <div className="space-y-0.5">
                {ownSeries.map((item) => {
                  const globalIdx = allSuggestions.findIndex(
                    (s) => s.id === item.id
                  );
                  const isSelected =
                    item.seriesName.toLowerCase() ===
                    value.trim().toLowerCase();
                  const isHighlighted = globalIdx === highlightedIndex;

                  return (
                    <div
                      key={item.id}
                      data-autocomplete-item
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelect(item);
                      }}
                      onMouseEnter={() => setHighlightedIndex(globalIdx)}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors sm:text-sm",
                        isHighlighted
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-muted/50",
                        isSelected && "bg-primary/10 text-primary font-semibold"
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="bg-primary/10 text-primary flex size-6 shrink-0 items-center justify-center rounded-md">
                          <Film className="size-3.5" />
                        </div>
                        <p className="truncate font-medium">
                          {item.seriesName}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <Badge
                          variant="secondary"
                          className="h-4 px-1.5 py-0 text-[10px] font-normal"
                        >
                          Series
                        </Badge>
                        {isSelected && (
                          <Check className="text-primary size-4 shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Group 2: Encyclopedia / Copyright tags */}
          {encyclopediaSeries.length > 0 && (
            <div
              className={
                ownSeries.length > 0 ? "border-border/40 border-t pt-1" : ""
              }
            >
              <div className="text-muted-foreground flex items-center gap-1.5 px-2 py-1 text-xs font-medium">
                <BookOpen className="size-3 text-sky-500" />
                <span>
                  {locale === "vi" ? "Từ điển Series" : "Series Encyclopedia"}
                </span>
              </div>
              <div className="space-y-0.5">
                {encyclopediaSeries.map((item) => {
                  const globalIdx = allSuggestions.findIndex(
                    (s) => s.id === item.id
                  );
                  const isSelected =
                    item.seriesName.toLowerCase() ===
                    value.trim().toLowerCase();
                  const isHighlighted = globalIdx === highlightedIndex;

                  return (
                    <div
                      key={item.id}
                      data-autocomplete-item
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelect(item);
                      }}
                      onMouseEnter={() => setHighlightedIndex(globalIdx)}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors sm:text-sm",
                        isHighlighted
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-muted/50",
                        isSelected && "bg-primary/10 text-primary font-semibold"
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-sky-500/10 text-sky-500">
                          <Film className="size-3.5" />
                        </div>
                        <p className="truncate font-medium">
                          {item.seriesName}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className="text-muted-foreground h-4 px-1.5 py-0 text-[10px] font-normal"
                        >
                          Tag
                        </Badge>
                        {isSelected && (
                          <Check className="text-primary size-4 shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Creatable option: Type arbitrary new series */}
          {canCreate && (
            <div
              data-autocomplete-item
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect({ seriesName: trimmedValue });
              }}
              onMouseEnter={() => setHighlightedIndex(createOptionIndex)}
              className={cn(
                "border-border/40 mt-1 flex cursor-pointer items-center gap-2.5 rounded-lg border-t px-2.5 py-2 text-xs transition-colors sm:text-sm",
                highlightedIndex === createOptionIndex
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted/50 text-muted-foreground"
              )}
            >
              <div className="bg-primary/15 text-primary flex size-6 shrink-0 items-center justify-center rounded-md">
                <Plus className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1 truncate">
                <span>
                  {locale === "vi" ? "Sử dụng series:" : "Use series:"}{" "}
                  <strong className="text-foreground">"{trimmedValue}"</strong>
                </span>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
