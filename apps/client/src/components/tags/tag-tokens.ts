import type { TagCategory } from "@/services/tags";

export interface TagCategoryToken {
  dot: string;
  ring: string;
  badge: string;
  gradient: string;
  accentColor: string;
  label: string;
}

export const TAG_CATEGORY_TOKENS: Record<TagCategory, TagCategoryToken> = {
  general: {
    dot: "bg-sky-500 dark:bg-sky-400",
    ring: "border-sky-200/80 bg-sky-50/50 hover:border-sky-400/70 dark:border-sky-900/60 dark:bg-sky-950/30",
    badge:
      "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/60 dark:text-sky-300",
    gradient:
      "from-sky-500/20 via-indigo-500/10 to-purple-500/5 dark:from-sky-950/50 dark:via-indigo-950/30 dark:to-transparent",
    accentColor: "text-sky-600 dark:text-sky-400",
    label: "General",
  },
  copyright: {
    dot: "bg-violet-600 dark:bg-violet-400",
    ring: "border-violet-200/80 bg-violet-50/50 hover:border-violet-400/70 dark:border-violet-900/60 dark:bg-violet-950/30",
    badge:
      "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900/60 dark:bg-violet-950/60 dark:text-violet-300",
    gradient:
      "from-violet-600/20 via-purple-600/10 to-fuchsia-500/5 dark:from-violet-950/50 dark:via-purple-950/30 dark:to-transparent",
    accentColor: "text-violet-600 dark:text-violet-400",
    label: "Copyright",
  },
  character: {
    dot: "bg-emerald-600 dark:bg-emerald-400",
    ring: "border-emerald-200/80 bg-emerald-50/50 hover:border-emerald-400/70 dark:border-emerald-900/60 dark:bg-emerald-950/30",
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300",
    gradient:
      "from-emerald-600/20 via-teal-600/10 to-cyan-500/5 dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-transparent",
    accentColor: "text-emerald-600 dark:text-emerald-400",
    label: "Character",
  },
  artist: {
    dot: "bg-amber-600 dark:bg-amber-400",
    ring: "border-amber-200/80 bg-amber-50/50 hover:border-amber-400/70 dark:border-amber-900/60 dark:bg-amber-950/30",
    badge:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300",
    gradient:
      "from-amber-600/20 via-orange-600/10 to-yellow-500/5 dark:from-amber-950/50 dark:via-orange-950/30 dark:to-transparent",
    accentColor: "text-amber-600 dark:text-amber-400",
    label: "Artist",
  },
  meta: {
    dot: "bg-blue-600 dark:bg-blue-400",
    ring: "border-blue-200/80 bg-blue-50/50 hover:border-blue-400/70 dark:border-blue-900/60 dark:bg-blue-950/30",
    badge:
      "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-300",
    gradient:
      "from-blue-600/20 via-indigo-600/10 to-slate-500/5 dark:from-blue-950/50 dark:via-indigo-950/30 dark:to-transparent",
    accentColor: "text-blue-600 dark:text-blue-400",
    label: "Meta",
  },
  system: {
    dot: "bg-rose-600 dark:bg-rose-400",
    ring: "border-rose-200/80 bg-rose-50/50 hover:border-rose-400/70 dark:border-rose-900/60 dark:bg-rose-950/30",
    badge:
      "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-300",
    gradient:
      "from-rose-600/20 via-pink-600/10 to-red-500/5 dark:from-rose-950/50 dark:via-pink-950/30 dark:to-transparent",
    accentColor: "text-rose-600 dark:text-rose-400",
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
