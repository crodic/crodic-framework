import { http } from "@/lib/http";
import type { PaginatedResponse } from "@repo/query-builder";

export interface LeaderboardItemResDto {
  id: string;
  rank: number;
  previousRank?: number | null;
  trend: "up" | "down" | "same";
  userId: string;
  postId?: string | null;
  displayName: string;
  handle: string;
  roleLabel: string;
  avatarUrl: string;
  isVerified: boolean;
  likesCount: number;
  followersCount: number;
  score: number;
  featuredProjects: string[];
  portfolioHref: string;
  filterCategory: "week" | "month" | "all" | "projects" | "crafting";
  periodKey: string;
}

export const getLeaderboard = async (
  filterCategory: string = "week"
): Promise<PaginatedResponse<LeaderboardItemResDto>> => {
  const { data } = await http.get<PaginatedResponse<LeaderboardItemResDto>>(
    `/api/v1/public/rankings?filter[filterCategory]=${filterCategory}`
  );
  return data;
};
