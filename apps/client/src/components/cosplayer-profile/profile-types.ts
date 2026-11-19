import type {
  CosplayerDetailResDto,
  CosplayerCharacterResDto,
  CosplayerSummaryResDto,
} from "@/services/cosplayer";
import type { PostSummaryResDto } from "@/services/posts";
import type { FollowUserResDto } from "@/services/social";
import type { CollectionResDto } from "@/services/collections";

export type {
  CosplayerDetailResDto,
  CosplayerCharacterResDto,
  CosplayerSummaryResDto,
  PostSummaryResDto,
  FollowUserResDto,
  CollectionResDto,
};

export type CosplayerProfileData = CosplayerDetailResDto;
export type CosplayerCharacter = CosplayerCharacterResDto;
export type CosplayerAlbum = PostSummaryResDto;
export type FollowedCosplayer = FollowUserResDto;
export type SavedCollection = CollectionResDto;
export type LikedWork = PostSummaryResDto;
