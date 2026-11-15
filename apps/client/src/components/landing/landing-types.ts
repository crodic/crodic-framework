export interface NavLinkItem {
  label: string;
  href: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface FeatureHighlightItem {
  id: string;
  title: string;
  description: string;
  iconName?: "folder" | "search" | "users";
}

export interface CosplayerWorkItem {
  id: string;
  imageUrl: string;
  title?: string;
}

export interface FeaturedCosplayer {
  id: string;
  name: string;
  avatarUrl: string;
  isVerified: boolean;
  followerCount: string;
  works: CosplayerWorkItem[];
  isFollowing?: boolean;
}

export interface AlbumItem {
  id: string;
  characterName: string;
  seriesName?: string;
  avatarUrl: string;
  coverUrl: string;
  likesCount: string;
  liked?: boolean;
}

export interface FooterLinkItem {
  label: string;
  href: string;
}
