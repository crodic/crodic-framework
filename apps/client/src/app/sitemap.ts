import type { MetadataRoute } from "next";
import type { PaginatedResponse } from "@repo/query-builder";
import { routing } from "@/i18n/routing";
import { serverFetch } from "@/lib/server-fetch";
import { fetchPublishedCmsPages } from "@/services/cms-pages";
import type { EventSummaryResDto } from "@/services/events";
import type { PostSummaryResDto } from "@/services/posts";
import type { CosplayerSummaryResDto } from "@/services/cosplayer";

export const dynamic = "force-dynamic";

type SitemapFrequency = NonNullable<
  MetadataRoute.Sitemap[number]["changeFrequency"]
>;

function buildLocalizedEntries(
  baseUrl: string,
  rawPath: string,
  lastModified: Date,
  changeFrequency: SitemapFrequency,
  priority: number
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    routing.locales.map((loc) => [loc, `${baseUrl}/${loc}${rawPath}`])
  );
  return routing.locales.map((locale) => ({
    url: `${baseUrl}/${locale}${rawPath}`,
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sections = ["pages", "events", "posts", "cosplayers"] as const;
  const results = await Promise.allSettled(
    sections.map((id) => sitemapSection({ id }))
  );
  return results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : []
  );
}

async function sitemapSection(props: {
  id: Promise<string> | string;
}): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const now = new Date();

  const id =
    props?.id && typeof (props.id as any).then === "function"
      ? await props.id
      : (props?.id as string);

  // 1. Pages Sitemap (Static Pages + Dynamic CMS Pages)
  if (id === "pages") {
    const staticPages: {
      path: string;
      changeFrequency: SitemapFrequency;
      priority: number;
    }[] = [
      { path: "", changeFrequency: "daily", priority: 1.0 },
      { path: "/explore", changeFrequency: "daily", priority: 0.9 },
      { path: "/feed", changeFrequency: "daily", priority: 0.9 },
      { path: "/ranking", changeFrequency: "daily", priority: 0.8 },
      { path: "/landing", changeFrequency: "weekly", priority: 0.7 },
      { path: "/auth/login", changeFrequency: "monthly", priority: 0.5 },
      { path: "/auth/sign-up", changeFrequency: "monthly", priority: 0.5 },
    ];

    const staticEntries: MetadataRoute.Sitemap = staticPages.flatMap((page) =>
      buildLocalizedEntries(
        baseUrl,
        page.path,
        now,
        page.changeFrequency,
        page.priority
      )
    );

    const cmsEntries: MetadataRoute.Sitemap = [];
    try {
      const cmsPages = await fetchPublishedCmsPages();
      for (const page of cmsPages) {
        if (!page.translations || page.translations.length === 0) continue;

        for (const t of page.translations) {
          if (!t.slug) continue;
          if (t.robots && t.robots.toLowerCase().includes("noindex")) {
            continue;
          }

          cmsEntries.push({
            url: `${baseUrl}/${t.locale}/pages/${t.slug}`,
            lastModified: page.updatedAt ? new Date(page.updatedAt) : now,
            changeFrequency: "monthly",
            priority: 0.7,
          });
        }
      }
    } catch (err) {
      console.warn("Failed to fetch CMS pages for sitemap:", err);
    }

    return [...staticEntries, ...cmsEntries];
  }

  // 2. Events Sitemap
  if (id === "events") {
    const entries: MetadataRoute.Sitemap = buildLocalizedEntries(
      baseUrl,
      "/events",
      now,
      "daily",
      0.8
    );

    try {
      const eventsRes = await serverFetch<
        PaginatedResponse<EventSummaryResDto>
      >("/api/v1/public/events", { params: { limit: 100 }, anonymous: true });
      for (const event of eventsRes?.data || []) {
        const slugOrId = event.slug || event.id;
        if (!slugOrId) continue;
        entries.push(
          ...buildLocalizedEntries(
            baseUrl,
            `/events/${slugOrId}`,
            event.createdAt ? new Date(event.createdAt) : now,
            "daily",
            0.8
          )
        );
      }
    } catch (err) {
      console.warn("Failed to fetch events for sitemap:", err);
    }

    return entries;
  }

  // 3. Posts Sitemap
  if (id === "posts") {
    const entries: MetadataRoute.Sitemap = [];
    try {
      const postsRes = await serverFetch<PaginatedResponse<PostSummaryResDto>>(
        "/api/v1/public/posts",
        { params: { limit: 100 }, anonymous: true }
      );
      for (const post of postsRes?.data || []) {
        const slugOrId = post.slug || post.id;
        if (
          !slugOrId ||
          (post as any).deletedAt ||
          (post as any).author?.deletedAt
        )
          continue;
        entries.push(
          ...buildLocalizedEntries(
            baseUrl,
            `/posts/${slugOrId}`,
            post.publishedAt ? new Date(post.publishedAt) : now,
            "weekly",
            0.7
          )
        );
      }
    } catch (err) {
      console.warn("Failed to fetch posts for sitemap:", err);
    }

    return entries;
  }

  // 4. Cosplayers Sitemap
  if (id === "cosplayers") {
    const entries: MetadataRoute.Sitemap = buildLocalizedEntries(
      baseUrl,
      "/cosplayer",
      now,
      "weekly",
      0.8
    );

    try {
      const cosplayersRes = await serverFetch<
        PaginatedResponse<CosplayerSummaryResDto>
      >("/api/v1/public/cosplayers", {
        params: { limit: 100 },
        anonymous: true,
      });
      for (const cosplayer of cosplayersRes?.data || []) {
        if (
          !cosplayer.slug ||
          (cosplayer as any).deletedAt ||
          (cosplayer as any).user?.deletedAt
        ) {
          continue;
        }
        entries.push(
          ...buildLocalizedEntries(
            baseUrl,
            `/cosplayer/${cosplayer.slug}`,
            cosplayer.createdAt ? new Date(cosplayer.createdAt) : now,
            "weekly",
            0.8
          )
        );
      }
    } catch (err) {
      console.warn("Failed to fetch cosplayers for sitemap:", err);
    }

    return entries;
  }

  return [];
}
