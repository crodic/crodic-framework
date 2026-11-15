export interface FollowedCosplayer {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  isVerified: boolean;
  previewPhoto: string;
  followersCount?: string;
  isFollowing: boolean;
}

export interface CollectionPhoto {
  id: string;
  src: string;
  title: string;
  authorName: string;
  authorAvatar?: string;
  likesCount?: string;
}

export interface SavedCollection {
  id: string;
  title: string;
  count: number;
  thumbnails: string[];
  photos?: CollectionPhoto[];
  updatedAt?: string;
}

export interface LikedWork {
  id: string;
  title: string;
  image: string;
  authorName: string;
  authorAvatar: string;
  authorHandle?: string;
  likesCount: string;
}

export interface CosplayerProfileData {
  id: string;
  slug: string;
  name: string;
  handle: string;
  location: string;
  isVerified: boolean;
  roleBadge?: string;
  avatarUrl: string;
  coverUrl: string;
  bio: string;
  stats: {
    followersCount: string;
    likesCount: string;
    albumsCount: number;
    charactersCount: number;
    followingCount?: number;
    collectionsCount?: number;
  };
  contact: {
    email: string;
    phone?: string;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    twitter?: string;
  };
  details: {
    height: string;
    experienceYears: string;
    skills: string[];
    specialties: string[];
  };
  isOwner?: boolean;
}

export interface CosplayerAlbum {
  id: string;
  title: string;
  category: "all" | "group" | "series" | "premium";
  categoryLabel: string;
  photosCount: number;
  updatedAt: string;
  isCollage?: boolean;
  collageImages?: string[];
  coverImage: string;
}

export interface CosplayerCharacter {
  id: string;
  characterName: string;
  series: string;
  coverImage: string;
  photosCount: number;
}
