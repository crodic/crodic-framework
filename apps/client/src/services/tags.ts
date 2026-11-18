import { http } from "@/lib/http";
import type { PaginatedResponse } from "@repo/query-builder";

export interface TagSummaryResDto {
  id: string;
  name: string;
  slug: string;
  category?: string;
  usageCount: number;
  trendingScore: number;
  isOfficial?: boolean;
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
