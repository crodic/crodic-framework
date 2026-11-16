import type {
  CosplayerDetailResDto,
  CosplayerCharacterResDto,
  CosplayerServiceResDto,
  CosplayerSummaryResDto,
} from "@/services/cosplayer";
import type { PostSummaryResDto } from "@/services/posts";

export type {
  CosplayerDetailResDto,
  CosplayerCharacterResDto,
  CosplayerServiceResDto,
  CosplayerSummaryResDto,
};

export type CosplayerProfileData = CosplayerDetailResDto;
export type CosplayerCharacter = CosplayerCharacterResDto;
export type CosplayerAlbum = PostSummaryResDto;

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
