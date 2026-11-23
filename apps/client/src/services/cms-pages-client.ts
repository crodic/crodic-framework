import { http } from "@/lib/http";
import type { CmsPageApiResponse } from "./cms-pages";

export async function fetchPublishedCmsPagesClient(): Promise<
  CmsPageApiResponse[]
> {
  try {
    const res = await http.get<CmsPageApiResponse[]>(
      "/api/v1/public/cms-pages"
    );
    return res.data ?? [];
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Failed to fetch published CMS pages on client:", error);
    }
    return [];
  }
}
