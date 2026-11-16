export type { LeaderboardItemResDto } from "@/services/ranking";

export type RankingTimeFilter =
  "week" | "month" | "all" | "projects" | "crafting";

export interface RankingFilterOption {
  id: RankingTimeFilter;
  label: string;
}
