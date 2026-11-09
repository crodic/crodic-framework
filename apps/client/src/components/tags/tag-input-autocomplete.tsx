"use client";

import React, { useRef, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTagAutocomplete, type TagAutocompleteItem } from "@/services/tags";
import { getTagCategoryToken } from "./tag-tokens";

export interface TagInputAutocompleteProps {
  locale?: string;
  currentCount?: number;
  maxTags?: number;
  placeholder?: string;
  disabled?: boolean;
  excludeNames?: string[];
  onSelectTag: (tagName: string, item?: TagAutocompleteItem) => void;
  allowCustomFolksonomy?: boolean;
  className?: string;
}

export function TagInputAutocomplete({
  locale = "en",
  currentCount,
  maxTags = 10,
  placeholder = "Add canonical or community tag...",
  disabled = false,
  excludeNames = [],
  onSelectTag,
  allowCustomFolksonomy = true,
  className,
}: TagInputAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isCapReached =
    typeof currentCount === "number" && currentCount >= maxTags;
  const effectiveDisabled = disabled || isCapReached;

  const { data: suggestions = [] } = useTagAutocomplete(
    query,
    locale,
    isOpen && !effectiveDisabled
  );

  const excludedLower = new Set(excludeNames.map((n) => n.toLowerCase()));
  const visibleSuggestions = suggestions.filter(
    (s) => !excludedLower.has(s.name.toLowerCase())
  );

  const commitRaw = (raw: string, item?: TagAutocompleteItem) => {
    const cleaned = raw.replace(/^#+/, "").trim();
    if (!cleaned || cleaned.startsWith("-") || effectiveDisabled) return;
    onSelectTag(cleaned, item);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            value={query}
            disabled={effectiveDisabled}
            onFocus={() => setIsOpen(true)}
            onBlur={() => {
              window.setTimeout(() => setIsOpen(false), 160);
            }}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (visibleSuggestions.length > 0 && !allowCustomFolksonomy) {
                  const first = visibleSuggestions[0];
                  if (first) commitRaw(first.name, first);
                } else {
                  commitRaw(query);
                }
              } else if (e.key === "Escape") {
                setIsOpen(false);
              }
            }}
            placeholder={
              isCapReached ? `Maximum ${maxTags} tags reached` : placeholder
            }
            className="h-9 rounded-xl pr-3 pl-8 text-xs shadow-2xs"
            aria-label="Search or add tag"
          />
        </div>

        {allowCustomFolksonomy && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={effectiveDisabled || !query.trim()}
            onClick={() => commitRaw(query)}
            className="h-9 shrink-0 rounded-xl px-3 text-xs font-medium"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Add
          </Button>
        )}

        {typeof currentCount === "number" && (
          <span
            role="status"
            aria-atomic="true"
            className="text-muted-foreground shrink-0 font-mono text-xs font-semibold tabular-nums"
          >
            {currentCount} / {maxTags}
          </span>
        )}
      </div>

      {isOpen && !effectiveDisabled && visibleSuggestions.length > 0 && (
        <div
          role="listbox"
          aria-label="Tag suggestions"
          className="bg-popover/98 text-popover-foreground divide-border/60 border-border/80 absolute top-full right-0 left-0 z-40 mt-1.5 max-h-60 divide-y overflow-y-auto rounded-2xl border shadow-xl backdrop-blur-md"
        >
          {visibleSuggestions.map((item) => {
            const cat = getTagCategoryToken(item.category);
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={false}
                onMouseDown={(e) => {
                  e.preventDefault();
                  commitRaw(item.name, item);
                }}
                className="hover:bg-muted/70 flex w-full cursor-pointer items-center justify-between gap-2 px-3.5 py-2 text-left text-xs transition-colors"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={cn("size-2 shrink-0 rounded-full", cat.dot)}
                    aria-hidden="true"
                  />
                  <span className="text-foreground truncate font-semibold">
                    #{item.translatedName || item.name}
                  </span>
                  {item.translatedName && item.translatedName !== item.name && (
                    <span className="text-muted-foreground truncate font-mono text-[11px]">
                      ({item.name})
                    </span>
                  )}
                  {item.matchedAlias && (
                    <span className="text-muted-foreground bg-muted truncate rounded-md px-1.5 py-0.5 font-mono text-[10px]">
                      via {item.matchedAlias}
                    </span>
                  )}
                </div>
                <span className="text-muted-foreground shrink-0 font-mono text-[11px] tabular-nums">
                  {item.usageCount.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
