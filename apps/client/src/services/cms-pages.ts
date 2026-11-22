import { serverFetch } from "@/lib/server-fetch";

export type CmsPageTranslation = {
  locale: string;
  slug?: string;
  title: string;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  robots?: string;
};

export type CmsPageApiResponse = {
  id: string;
  status: "draft" | "published";
  translations: CmsPageTranslation[];
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CmsPage = CmsPageTranslation & {
  id: string;
  status: "draft" | "published";
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export const getCmsPageBySlug = async (
  slug: string,
  locale: string
): Promise<CmsPage | null> => {
  try {
    const data = await serverFetch<CmsPageApiResponse>(
      `/api/v1/public/cms-pages/by-slug/${encodeURIComponent(slug)}`,
      {
        params: { locale },
        anonymous: true,
      }
    );

    if (!data || !data.translations || data.translations.length === 0) {
      return null;
    }

    const translation =
      data.translations.find((t) => t.locale === locale) ||
      data.translations[0];

    if (!translation) {
      return null;
    }

    return {
      id: data.id,
      status: data.status,
      publishedAt: data.publishedAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      ...translation,
    };
  } catch (error) {
    console.error(`Failed to fetch CMS page by slug "${slug}":`, error);
    return null;
  }
};

export const fetchPublishedCmsPages = async (): Promise<
  CmsPageApiResponse[]
> => {
  try {
    const data = await serverFetch<CmsPageApiResponse[]>(
      "/api/v1/public/cms-pages",
      {
        anonymous: true,
        next: { revalidate: 300 },
      }
    );
    return data ?? [];
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to fetch published CMS pages:", error);
    }
    return [];
  }
};
