import { http } from "@/lib/http";
import type { PaginatedResponse } from "@repo/query-builder";

export interface JobSummaryResDto {
  id: string;
  slug: string;
  title: string;
  brandName: string;
  brandLogoUrl?: string | null;
  brandInitials?: string | null;
  brandColor?: string | null;
  isVerified: boolean;
  locationLabel: string;
  locationFilterCode?: string | null;
  budgetLabel: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  categoryCode: "lookbook" | "event" | "crafting" | "game_ads";
  categoryLabel: string;
  deadlineLabel: string;
  deadlineAt?: string | null;
  filterTags: string[];
  perks: string[];
  contactEmail: string;
  thumbnailUrl?: string | null;
  isFeatured: boolean;
  status: "open" | "closed" | "draft" | "pending_approval" | "expired";
  applicationsCount: number;
  isAppliedByCurrentUser?: boolean;
  createdAt: string;
}

export interface JobDetailResDto extends JobSummaryResDto {
  brandId?: string | null;
  description: string;
  requirements: string;
  benefits?: string[];
  selectionProcess?: string;
  brandWebsite?: string | null;
  isBookmarkedByCurrentUser?: boolean;
  updatedAt: string;
}

export interface JobApplicationPayload {
  fullName: string;
  stageName: string;
  contactInfo: string;
  portfolioUrl?: string;
  experience: string;
  message?: string;
}

export interface CreateJobPayload {
  title: string;
  brandName: string;
  brandLogoUrl?: string;
  brandInitials?: string;
  brandColor?: string;
  isVerified?: boolean;
  categoryCode: "lookbook" | "event" | "crafting" | "game_ads";
  categoryLabel: string;
  budgetLabel: string;
  budgetMin?: number;
  budgetMax?: number;
  locationLabel: string;
  locationFilterCode?: string;
  deadlineLabel: string;
  deadlineAt?: string;
  requirements: string;
  description: string;
  perks?: string[];
  filterTags?: string[];
  contactEmail: string;
  thumbnailUrl?: string;
  isFeatured?: boolean;
}

export const getJobs = async (
  query?: Record<string, any>
): Promise<PaginatedResponse<JobSummaryResDto>> => {
  const searchParams = new URLSearchParams();
  if (query) {
    for (const [key, val] of Object.entries(query)) {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    }
  }
  const qs = searchParams.toString();
  const url = `/api/v1/public/jobs${qs ? `?${qs}` : ""}`;
  const { data } = await http.get<PaginatedResponse<JobSummaryResDto>>(url);
  return data;
};

export const getJobBySlug = async (slug: string): Promise<JobDetailResDto> => {
  const { data } = await http.get<JobDetailResDto>(
    `/api/v1/public/jobs/${slug}`
  );
  return data;
};

export const createJob = async (
  payload: CreateJobPayload
): Promise<JobDetailResDto> => {
  const { data } = await http.post<JobDetailResDto>("/api/v1/jobs", payload);
  return data;
};

export const applyJob = async (
  jobId: string,
  payload: JobApplicationPayload
): Promise<any> => {
  const { data } = await http.post(`/api/v1/jobs/${jobId}/apply`, payload);
  return data;
};
