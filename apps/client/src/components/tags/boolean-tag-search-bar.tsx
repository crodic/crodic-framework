"use client";

import React, { useState } from "react";
import { MinusCircle, PlusCircle, Search, Split, X } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const router = useRouter();
  const [tokens, setTokens] = useState<QueryToken[]>(() =>
    parseInitialQuery(initialQuery)
  );
  const [mode, setMode] = useState<TokenMode>("and");
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { data: suggestions = [] } = useTagAutocomplete(
    inputValue.replace(/^-/, ""),
    locale,
    isOpen
  );

  const runSearch = (nextTokens: QueryToken[]) => {
    const serialized = serializeQueryTokens(nextTokens);
    const params = new URLSearchParams();
    if (serialized) params.set("q", serialized);
    if (!expandHierarchy) params.set("expand", "false");
    const qs = params.toString();
    router.push(qs ? `/tags?${qs}` : "/tags");
  };

  const pushToken = (rawVal: string) => {
    const trimmed = rawVal.replace(/^#+/, "").trim();
    if (!trimmed) return;

    const detectedNot = trimmed.startsWith("-") && trimmed.length > 1;
    const effectiveMode: TokenMode = detectedNot ? "not" : mode;
    const cleanWord = detectedNot
      ? trimmed.slice(1).replace(/\s+/g, "_")
      : trimmed.replace(/\s+/g, "_");

    if (!cleanWord) return;
    const updated: QueryToken[] = [
      ...tokens.filter(
        (t) => t.value.toLowerCase() !== cleanWord.toLowerCase()
      ),
      { mode: effectiveMode, value: cleanWord },
    ];
    setTokens(updated);
    setInputValue("");
    setIsOpen(false);
    runSearch(updated);
  };

  const removeTokenAt = (idx: number) => {
    const updated = tokens.filter((_, i) => i !== idx);
    setTokens(updated);
    runSearch(updated);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-2.5">
      {/* Operator Selector Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div
          role="group"
          aria-label="Boolean search operator"
          className="bg-muted/60 inline-flex items-center gap-1 rounded-lg border p-1"
        >
          <button
            type="button"
            onClick={() => setMode("and")}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-colors",
              mode === "and"
                ? "bg-background text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <PlusCircle className="size-3.5" aria-hidden="true" />
            AND (Must match)
          </button>
          <button
            type="button"
            onClick={() => setMode("or")}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-colors",
              mode === "or"
                ? "bg-background text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Split className="size-3.5" aria-hidden="true" />
            OR (Any match)
          </button>
          <button
            type="button"
            onClick={() => setMode("not")}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-colors",
              mode === "not"
                ? "bg-background text-rose-600 shadow-2xs dark:text-rose-400"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MinusCircle className="size-3.5" aria-hidden="true" />
            -NOT (Exclude)
          </button>
        </div>

        {tokens.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setTokens([]);
              router.push("/tags");
            }}
            className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
          >
            Clear expression
          </button>
        )}
      </div>

      {/* Tokenized Search Input Box */}
      <div className="relative">
        <div className="bg-background focus-within:ring-ring/40 flex min-h-12 flex-wrap items-center gap-1.5 rounded-xl border px-3 py-2 shadow-xs focus-within:ring-2">
          <Search
            className="text-muted-foreground mr-1 size-4 shrink-0"
            aria-hidden="true"
          />

          {tokens.map((tok, idx) => (
            <Badge
              key={`${tok.mode}-${tok.value}-${idx}`}
              variant={tok.mode === "not" ? "destructive" : "secondary"}
              className="gap-1 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap"
            >
              <span className="font-mono text-[10px] uppercase opacity-75">
                {tok.mode === "not" ? "NOT" : tok.mode.toUpperCase()}
              </span>
              <span>#{tok.value}</span>
              <button
                type="button"
                aria-label={`Remove ${tok.value} from search`}
                onClick={() => removeTokenAt(idx)}
                className="ml-0.5 rounded-xs opacity-75 hover:opacity-100"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </Badge>
          ))}

          <input
            type="text"
            value={inputValue}
            onFocus={() => setIsOpen(true)}
            onBlur={() => {
              window.setTimeout(() => setIsOpen(false), 160);
            }}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (inputValue.trim()) {
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
                ? "Type tag, alias, or -exclude (e.g. Cyberpunk OR SciFi -Horror)..."
                : "Add another tag token..."
            }
            aria-label="Boolean tag search input"
            className="placeholder:text-muted-foreground min-w-44 flex-1 bg-transparent text-sm outline-none"
          />

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
            className="h-8 shrink-0 px-3 text-xs"
          >
            Search
          </Button>
        </div>

        {/* Autocomplete Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div
            role="listbox"
            aria-label="Boolean search tag suggestions"
            className="bg-popover text-popover-foreground absolute top-full right-0 left-0 z-40 mt-1.5 max-h-64 divide-y overflow-y-auto rounded-xl border shadow-lg"
          >
            {suggestions.map((item) => {
              const cat = getTagCategoryToken(item.category);
              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pushToken(item.slug);
                  }}
                  className="hover:bg-muted/60 flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-xs transition-colors"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={cn("size-2 shrink-0 rounded-full", cat.dot)}
                      aria-hidden="true"
                    />
                    <span className="truncate font-semibold">
                      #{item.translatedName || item.name}
                    </span>
                    {item.translatedName &&
                      item.translatedName !== item.name && (
                        <span className="text-muted-foreground truncate">
                          ({item.name})
                        </span>
                      )}
                    {item.matchedAlias && (
                      <Badge
                        variant="outline"
                        className="px-1.5 py-0 text-[10px]"
                      >
                        alias: {item.matchedAlias}
                      </Badge>
                    )}
                  </div>
                  <span className="text-muted-foreground font-mono text-[11px] tabular-nums">
                    {item.usageCount.toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
