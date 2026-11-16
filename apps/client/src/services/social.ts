import { http } from "@/lib/http";

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
