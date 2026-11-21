import { http } from "@/lib/http";

export interface CosplayerSocialLinks {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  twitter?: string;
  youtube?: string;
  other?: string;
}

export interface CreateCosplayerApplicationDto {
  stageName: string;
  bio: string;
  socialLinks?: CosplayerSocialLinks;
  portfolioUrls?: string[];
}

export interface CosplayerApplicationResDto {
  id: string;
  userId: string;
  stageName: string;
  bio: string;
  socialLinks?: CosplayerSocialLinks | null;
  portfolioUrls?: string[] | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string | null;
  reviewedById?: string | null;
  reviewedAt?: string | null;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function submitCosplayerApplication(
  dto: CreateCosplayerApplicationDto
): Promise<CosplayerApplicationResDto> {
  const { data } = await http.post<CosplayerApplicationResDto>(
    "/api/v1/cosplayer-applications",
    dto
  );
  return data;
}

export async function getMyCosplayerApplication(): Promise<CosplayerApplicationResDto | null> {
  const { data } = await http.get<CosplayerApplicationResDto | null>(
    "/api/v1/cosplayer-applications/me"
  );
  return data;
}
