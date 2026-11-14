export interface FeedAuthor {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  isVerified: boolean;
  roleBadge?: string;
}

export interface FeedComment {
  id: string;
  author: FeedAuthor;
  content: string;
  createdAt: string;
  likesCount?: number;
}

export interface FeedPost {
  id: string;
  author: FeedAuthor;
  createdAt: string;
  caption: string;
  images: string[];
  tags: string[];
  likesCount: number;
  isLiked: boolean;
  commentsCount: number;
  isBookmarked: boolean;
  sharesCount: number;
  recentComments: FeedComment[];
}

export interface SuggestedCosplayer {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  isVerified: boolean;
  badge?: string;
  isFollowing: boolean;
  followerCount?: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  badge: string;
  badgeColor?: string;
  dateTime: string;
  location: string;
  thumbnailUrl: string;
  isInterested: boolean;
}

export interface TrendingTag {
  name: string;
  count: string;
  isHot?: boolean;
}
