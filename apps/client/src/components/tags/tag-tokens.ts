import type { TagCategory } from "@/services/tags";

export interface TagCategoryToken {
  dot: string;
  ring: string;
  label: string;
}

export const TAG_CATEGORY_TOKENS: Record<TagCategory, TagCategoryToken> = {
  general: {
    dot: "bg-zinc-500 dark:bg-zinc-400",
    ring: "border-border/80 bg-card hover:border-foreground/30",
    label: "General",
  },
  copyright: {
    dot: "bg-violet-600 dark:bg-violet-400",
    ring: "border-violet-200/80 bg-violet-50/50 hover:border-violet-400/70 dark:border-violet-900/60 dark:bg-violet-950/30",
    label: "Copyright",
  },
  character: {
    dot: "bg-emerald-600 dark:bg-emerald-400",
    ring: "border-emerald-200/80 bg-emerald-50/50 hover:border-emerald-400/70 dark:border-emerald-900/60 dark:bg-emerald-950/30",
    label: "Character",
  },
  artist: {
    dot: "bg-amber-600 dark:bg-amber-400",
    ring: "border-amber-200/80 bg-amber-50/50 hover:border-amber-400/70 dark:border-amber-900/60 dark:bg-amber-950/30",
    label: "Artist",
  },
  meta: {
    dot: "bg-sky-600 dark:bg-sky-400",
    ring: "border-sky-200/80 bg-sky-50/50 hover:border-sky-400/70 dark:border-sky-900/60 dark:bg-sky-950/30",
    label: "Meta",
  },
  system: {
    dot: "bg-rose-600 dark:bg-rose-400",
    ring: "border-rose-200/80 bg-rose-50/50 hover:border-rose-400/70 dark:border-rose-900/60 dark:bg-rose-950/30",
    label: "System",
  },
};

export function getTagCategoryToken(
  category?: string | null
): TagCategoryToken {
  if (category && category in TAG_CATEGORY_TOKENS) {
    return TAG_CATEGORY_TOKENS[category as TagCategory];
  }
  return TAG_CATEGORY_TOKENS.general;
}

export type TokenMode = "and" | "or" | "not";

export interface QueryToken {
  mode: TokenMode;
  value: string;
}

export function parseInitialQuery(rawQuery: string): QueryToken[] {
  if (!rawQuery.trim()) return [];
  const parts = rawQuery.trim().split(/\s+/).filter(Boolean);
  const tokens: QueryToken[] = [];

  for (let i = 0; i < parts.length; i++) {
    const word = parts[i];
    if (!word || word.toUpperCase() === "OR") continue;

    const prevWasOr = i > 0 && parts[i - 1]?.toUpperCase() === "OR";
    const nextIsOr = parts[i + 1]?.toUpperCase() === "OR";

    if (word.startsWith("-") && word.length > 1) {
      tokens.push({ mode: "not", value: word.slice(1) });
    } else if (prevWasOr || nextIsOr) {
      tokens.push({ mode: "or", value: word });
    } else {
      tokens.push({ mode: "and", value: word });
    }
  }
  return tokens;
}

export function serializeQueryTokens(tokens: QueryToken[]): string {
  const andList = tokens.filter((t) => t.mode === "and").map((t) => t.value);
  const orList = tokens.filter((t) => t.mode === "or").map((t) => t.value);
  const notList = tokens
    .filter((t) => t.mode === "not")
    .map((t) => `-${t.value}`);

  const segments: string[] = [];
  if (andList.length > 0) segments.push(andList.join(" "));
  if (orList.length > 0) segments.push(orList.join(" OR "));
  if (notList.length > 0) segments.push(notList.join(" "));

  return segments.join(" ").trim();
}
