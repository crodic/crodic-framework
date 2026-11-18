import { http } from "@/lib/http";
import type { PaginatedResponse } from "@repo/query-builder";

export interface CosplayerCharacterResDto {
  id: string;
  userId: string;
  characterName: string;
  seriesName: string;
  characterTagId?: string | null;
  copyrightTagId?: string | null;
  coverFileId?: string | null;
  coverImageUrl: string;
  albumsCount: number;
  photosCount: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CosplayerSummaryResDto {
  id: string;
  userId: string;
  slug: string;
  displayName: string;
  handle: string;
  roleBadge: string;
  tagline?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  locationLabel?: string | null;
  workArea?: string | null;
  isVerified: boolean;
  isCraftingCreator: boolean;
  followersCount: number;
  totalLikesCount: number;
  albumsCount: number;
  charactersCount: number;
  rankingScore: number;
  specialties: string[];
  createdAt: string;
}

export interface CosplayerDetailResDto extends CosplayerSummaryResDto {
  bio?: string | null;
  artisticBio?: string | null;
  cityId?: string | null;
  countryId?: string | null;
  heightCm?: number | null;
  heightLabel?: string | null;
  experienceYearsNum?: number | null;
  experienceLabel?: string | null;
  skills: string[];
  awardsBadges: string[];
  contactEmail?: string | null;
  contactPhone?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  twitterUrl?: string | null;
  followingCount: number;
  collectionsCount: number;
  characters: CosplayerCharacterResDto[];
  updatedAt: string;
}

export const getCosplayers = async (
  query?: Record<string, any>
): Promise<PaginatedResponse<CosplayerSummaryResDto>> => {
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
  const url = `/api/v1/public/cosplayers${qs ? `?${qs}` : ""}`;
  const { data } =
    await http.get<PaginatedResponse<CosplayerSummaryResDto>>(url);
  return data;
};

export const getCosplayerBySlug = async (
  slug: string
): Promise<CosplayerDetailResDto> => {
  const { data } = await http.get<CosplayerDetailResDto>(
    `/api/v1/public/cosplayers/${slug}`
  );
  return data;
};

export const getCosplayerCharacters = async (
  slug: string
): Promise<CosplayerCharacterResDto[]> => {
  const { data } = await http.get<CosplayerCharacterResDto[]>(
    `/api/v1/public/cosplayers/${slug}/characters`
  );
  return data || [];
};

export const getMyCosplayerProfile =
  async (): Promise<CosplayerDetailResDto> => {
    const { data } = await http.get<CosplayerDetailResDto>(
      "/api/v1/cosplayer/me"
    );
    return data;
  };

export const updateMyCosplayerProfile = async (
  payload: Partial<CosplayerDetailResDto>
): Promise<CosplayerDetailResDto> => {
  const { data } = await http.patch<CosplayerDetailResDto>(
    "/api/v1/cosplayer/me",
    payload
  );
  return data;
};
