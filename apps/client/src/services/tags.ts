import { http } from "@/lib/http";
import type { PaginatedResponse } from "@repo/query-builder";

export interface TagCategoryResDto {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  color: string;
  icon: string;
  sortOrder: number;
  isSystem: boolean;
  isActive: boolean;
  tagCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TagTranslationResDto {
  id: string;
  locale: string;
  translatedName: string;
  shortSummary?: string | null;
  source: string;
}

export interface TagAliasResDto {
  id: string;
  aliasName: string;
  aliasType: "synonym" | "abbreviation" | "typo" | "legacy_merge";
  locale?: string | null;
}

export interface TagSummaryResDto {
  id: string;
  name: string;
  slug: string;
  translatedName?: string | null;
  shortSummary?: string | null;
  featuredImageUrl?: string | null;
  category?: string;
  categoryId?: string | null;
  categoryDetail?: TagCategoryResDto | null;
  safetyRating?: "safe" | "sensitive" | "r18" | "r18g";
  status?: "active" | "pending" | "merged" | "banned";
  isOfficial?: boolean;
  isSystem?: boolean;
  usageCount: number;
  trendingScore: number;
  translations?: TagTranslationResDto[];
  aliases?: TagAliasResDto[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TagGraphResDto {
  parents: TagSummaryResDto[];
  children: TagSummaryResDto[];
  siblings: TagSummaryResDto[];
  related: TagSummaryResDto[];
  disambiguations: TagSummaryResDto[];
}

export interface TagDetailResDto extends TagSummaryResDto {
  redirectSlug?: string | null;
  mergedIntoId?: string | null;
  isMutedByCurrentUser?: boolean;
  hasEncyclopedia?: boolean;
  graph: TagGraphResDto;
}

export interface TagEncyclopediaRevisionResDto {
  id: string;
  revisionNumber: number;
  summary: string;
  body: string;
  changeNote?: string | null;
  editorName?: string | null;
  createdAt: string;
}

export interface TagEncyclopediaResDto {
  id: string;
  tagId: string;
  locale: string;
  summary: string;
  body: string;
  featuredImageUrl?: string | null;
  featuredFileId?: string | null;
  isEditLocked: boolean;
  currentRevision: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  revisions?: TagEncyclopediaRevisionResDto[];
}

export interface TagTooltipResDto {
  id: string;
  slug: string;
  name: string;
  translatedName?: string | null;
  summary?: string | null;
  featuredImageUrl?: string | null;
  category: string;
  categoryDetail?: TagCategoryResDto | null;
  safetyRating: "safe" | "sensitive" | "r18" | "r18g";
  isOfficial: boolean;
  usageCount: number;
  parentTag?: TagSummaryResDto | null;
}

export interface TagAutocompleteItemDto {
  id: string;
  name: string;
  slug: string;
  category: string;
  usageCount: number;
  isOfficial: boolean;
  matchType?: string;
  matchedAlias?: string;
  translatedName?: string | null;
}

export const getTags = async (
  query?: Record<string, any>
): Promise<PaginatedResponse<TagSummaryResDto>> => {
  const searchParams = new URLSearchParams();
  if (query) {
    for (const [key, val] of Object.entries(query)) {
      if (val !== undefined && val !== null && val !== "") {
        if (key === "search") {
          searchParams.append("filter[search]", String(val));
          searchParams.append("search", String(val));
        } else if (["category", "safetyRating", "isOfficial"].includes(key)) {
          searchParams.append(`filter[${key}]`, String(val));
        } else {
          searchParams.append(key, String(val));
        }
      }
    }
  }
  const qs = searchParams.toString();
  const url = `/api/v1/public/tags${qs ? `?${qs}` : ""}`;
  const { data } = await http.get<PaginatedResponse<TagSummaryResDto>>(url);
  return data;
};

export const getTagBySlug = async (
  slug: string,
  locale = "en"
): Promise<TagDetailResDto> => {
  const { data } = await http.get<TagDetailResDto>(
    `/api/v1/public/tags/by-slug/${encodeURIComponent(slug)}?locale=${locale}`
  );
  return data;
};

export const getTagEncyclopedia = async (
  slug: string,
  locale = "en"
): Promise<TagEncyclopediaResDto | null> => {
  try {
    const { data } = await http.get<TagEncyclopediaResDto>(
      `/api/v1/public/tags/encyclopedia/${encodeURIComponent(slug)}?locale=${locale}`
    );
    return data;
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
};

export const getTagTooltip = async (
  slug: string,
  locale = "en"
): Promise<TagTooltipResDto | null> => {
  try {
    const { data } = await http.get<TagTooltipResDto>(
      `/api/v1/public/tags/by-slug/${encodeURIComponent(slug)}/tooltip?locale=${locale}`
    );
    return data;
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    return null;
  }
};

export const autocompleteTags = async (
  q: string,
  locale = "en"
): Promise<TagAutocompleteItemDto[]> => {
  const { data } = await http.get<TagAutocompleteItemDto[]>(
    `/api/v1/public/tags/autocomplete?q=${encodeURIComponent(q)}&locale=${locale}`
  );
  return data;
};

export const getTrendingTags = async (
  limit = 10,
  locale = "en",
  category?: string
): Promise<TagSummaryResDto[]> => {
  const searchParams = new URLSearchParams({
    limit: String(limit),
    locale,
  });
  if (category) {
    searchParams.set("category", category);
  }
  const { data } = await http.get<TagSummaryResDto[]>(
    `/api/v1/public/tags/trending?${searchParams.toString()}`
  );
  return data;
};

export const getTagCategories = async (): Promise<TagCategoryResDto[]> => {
  const { data } = await http.get<TagCategoryResDto[]>(
    "/api/v1/public/tag-categories"
  );
  return data;
};

export const getTagCategoryBySlug = async (
  slug: string
): Promise<TagCategoryResDto> => {
  const { data } = await http.get<TagCategoryResDto>(
    `/api/v1/public/tag-categories/${encodeURIComponent(slug)}`
  );
  return data;
};

export const muteTag = async (tagId: string): Promise<void> => {
  await http.post("/api/v1/user/muted-tags", { tagId });
};

export const unmuteTag = async (tagId: string): Promise<void> => {
  await http.delete(`/api/v1/user/muted-tags/${encodeURIComponent(tagId)}`);
};

export const contributeTagEncyclopedia = async (
  tagId: string,
  payload: { summary: string; body: string; changeNote?: string }
): Promise<TagEncyclopediaResDto> => {
  const { data } = await http.put<TagEncyclopediaResDto>(
    `/api/v1/user/tags/${encodeURIComponent(tagId)}/encyclopedia`,
    payload
  );
  return data;
};
