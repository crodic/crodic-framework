import "server-only";

import { serverFetch } from "@/lib/server-fetch";
import type { PaginatedResponse } from "@repo/query-builder";
import type { PostSummaryResDto } from "./posts";
import type { CosplayerSummaryResDto } from "./cosplayer";

export async function fetchLandingPosts(
  limit = 4
): Promise<PostSummaryResDto[]> {
  try {
    const res = await serverFetch<PaginatedResponse<PostSummaryResDto>>(
      "/api/v1/public/posts",
      {
        params: { limit },
        anonymous: true,
        next: { revalidate: 300 },
      }
    );
    return res?.data ?? [];
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Failed to fetch landing posts on server:", error);
    }
    return [];
  }
}

export async function fetchLandingCosplayers(
  limit = 4
): Promise<CosplayerSummaryResDto[]> {
  try {
    const res = await serverFetch<PaginatedResponse<CosplayerSummaryResDto>>(
      "/api/v1/public/cosplayers",
      {
        params: { limit },
        anonymous: true,
        next: { revalidate: 300 },
      }
    );
    return res?.data ?? [];
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Failed to fetch landing cosplayers on server:", error);
    }
    return [];
  }
}
