import { http } from "@/lib/http";
import type { PaginatedResponse } from "@repo/query-builder";

export interface FollowUserResDto {
  id: string;
  displayName: string;
  handle?: string | null;
  avatarUrl?: string | null;
  followedAt: string;
}

export const toggleFollow = async (
  targetUserId: string
): Promise<{ following: boolean; followersCount: number }> => {
  const { data } = await http.post<{
    following: boolean;
    followersCount: number;
  }>(`/api/v1/social/follow/${targetUserId}`);
  return data;
};

export const checkIsFollowing = async (
  targetUserId: string
): Promise<boolean> => {
  const { data } = await http.get<{ isFollowing: boolean }>(
    `/api/v1/social/following/${targetUserId}/check`
  );
  return data?.isFollowing ?? false;
};

export const getUserFollowers = async (
  userId: string,
  query?: Record<string, any>
): Promise<PaginatedResponse<FollowUserResDto>> => {
  const searchParams = new URLSearchParams();
  if (query) {
    for (const [key, val] of Object.entries(query)) {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    }
  }
  const qs = searchParams.toString();
  const url = `/api/v1/social/users/${userId}/followers${qs ? `?${qs}` : ""}`;
  const { data } = await http.get<PaginatedResponse<FollowUserResDto>>(url);
  return data;
};

export const getUserFollowing = async (
  userId: string,
  query?: Record<string, any>
): Promise<PaginatedResponse<FollowUserResDto>> => {
  const searchParams = new URLSearchParams();
  if (query) {
    for (const [key, val] of Object.entries(query)) {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    }
  }
  const qs = searchParams.toString();
  const url = `/api/v1/social/users/${userId}/following${qs ? `?${qs}` : ""}`;
  const { data } = await http.get<PaginatedResponse<FollowUserResDto>>(url);
  return data;
};
