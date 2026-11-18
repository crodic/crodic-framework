import { http } from "@/lib/http";

export interface SpotlightBannerResDto {
  id: string;
  name: string;
  isVerified: boolean;
  badge: string;
  tagline: string;
  bannerImageUrl: string;
  portfolioHref: string;
  sortOrder: number;
  cosplayerUserId: string;
  createdAt: string;
}

export const getSpotlightBanners = async (): Promise<
  SpotlightBannerResDto[]
> => {
  const { data } = await http.get<SpotlightBannerResDto[]>(
    "/api/v1/public/spotlight"
  );
  return data || [];
};
