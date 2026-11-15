export type RankingTimeFilter =
  "week" | "month" | "all" | "projects" | "crafting";

export interface RankingFilterOption {
  id: RankingTimeFilter;
  label: string;
}

export interface PodiumItem {
  id: string;
  rank: 1 | 2 | 3;
  name: string;
  handle: string;
  avatarUrl: string;
  isVerified: boolean;
  role: string;
  likes: string;
  followers: string;
  portfolioHref: string;
}

export interface LeaderboardItem {
  id: string;
  rank: number;
  trend: "up" | "down" | "same";
  name: string;
  handle: string;
  avatarUrl: string;
  isVerified: boolean;
  featuredProjects: string[];
  likes: string;
  isFollowing?: boolean;
  portfolioHref: string;
}
