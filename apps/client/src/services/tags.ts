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

export interface TagSummaryResDto {
  id: string;
  name: string;
  slug: string;
  category?: string;
  categoryId?: string | null;
  categoryDetail?: TagCategoryResDto | null;
  usageCount: number;
  trendingScore: number;
  isOfficial?: boolean;
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
}

export const getTags = async (
  query?: Record<string, any>
): Promise<PaginatedResponse<TagSummaryResDto>> => {
  const searchParams = new URLSearchParams();
  if (query) {
    for (const [key, val] of Object.entries(query)) {
      if (val !== undefined && val !== null) {
        if (key === "search") {
          searchParams.append("filter[search]", String(val));
          searchParams.append("search", String(val));
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
