import type { MetadataRoute } from "next";
import type { PaginatedResponse } from "@repo/query-builder";
import { routing } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";
import { serverFetch } from "@/lib/server-fetch";
import { fetchPublishedCmsPages } from "@/services/cms-pages";
import type { EventSummaryResDto } from "@/services/events";
import type { PostSummaryResDto } from "@/services/posts";
import type { CosplayerSummaryResDto } from "@/services/cosplayer";
import { getAppExternalUrl, getRootExternalUrl } from "@/lib/subdomain";

export const dynamic = "force-dynamic";

type SitemapFrequency = NonNullable<
  MetadataRoute.Sitemap[number]["changeFrequency"]
>;

function localizedUrl(baseUrl: string, locale: string, path: string) {
  return `${baseUrl.replace(/\/+$/, "")}${getPathname({ locale, href: path || "/" })}`;
}

function buildLocalizedEntries(
  baseUrl: string,
  rawPath: string,
  lastModified: Date | undefined,
  changeFrequency: SitemapFrequency,
  priority: number
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [
      locale,
      localizedUrl(baseUrl, locale, rawPath),
    ])
  );
  return routing.locales.map((locale) => ({
    url: localizedUrl(baseUrl, locale, rawPath),
    ...(lastModified ? { lastModified } : {}),
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
  const entries = results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : []
  );
  return [...new Map(entries.map((entry) => [entry.url, entry])).values()];
}

async function sitemapSection(props: {
  id: Promise<string> | string;
}): Promise<MetadataRoute.Sitemap> {
  const appBaseUrl = getAppExternalUrl().replace(/\/+$/, "");
  const rootBaseUrl = getRootExternalUrl().replace(/\/+$/, "");

  const id =
    props?.id && typeof (props.id as any).then === "function"
      ? await props.id
      : (props?.id as string);

  // 1. Pages Sitemap (Root Domain Landing Page + App Static Pages + Dynamic CMS Pages)
  if (id === "pages") {
    // 1a. Root Domain Landing Page (Canonical marketing entry on crodic.click)
    const rootLandingEntries = buildLocalizedEntries(
      rootBaseUrl,
      "",
      undefined,
      "weekly",
      1.0
    );

    // 1b. App Static Pages on Subdomain (feed, explore, ranking, tags, events)
    const appStaticPages: {
      path: string;
      changeFrequency: SitemapFrequency;
      priority: number;
    }[] = [
      { path: "", changeFrequency: "daily", priority: 1.0 },
      { path: "/explore", changeFrequency: "daily", priority: 0.9 },
      { path: "/feed", changeFrequency: "daily", priority: 0.9 },
      { path: "/ranking", changeFrequency: "daily", priority: 0.8 },
      { path: "/tags", changeFrequency: "daily", priority: 0.8 },
      { path: "/events", changeFrequency: "daily", priority: 0.8 },
    ];

    const appStaticEntries: MetadataRoute.Sitemap = appStaticPages.flatMap(
      (page) =>
        buildLocalizedEntries(
          appBaseUrl,
          page.path,
          undefined,
          page.changeFrequency,
          page.priority
        )
    );

    // 1c. CMS Legal & Policy Pages (on root domain)
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
            url: localizedUrl(rootBaseUrl, t.locale, `/pages/${t.slug}`),
            ...(page.updatedAt
              ? { lastModified: new Date(page.updatedAt) }
              : {}),
            changeFrequency: "monthly",
            priority: 0.7,
          });
        }
      }
    } catch (err) {
      console.warn("Failed to fetch CMS pages for sitemap:", err);
    }

    return [...rootLandingEntries, ...appStaticEntries, ...cmsEntries];
  }

  // 2. Events Sitemap
  if (id === "events") {
    const entries: MetadataRoute.Sitemap = [];

    try {
      const eventsRes = await serverFetch<
        PaginatedResponse<EventSummaryResDto>
      >("/api/v1/public/events", { params: { limit: 100 }, anonymous: true });
      for (const event of eventsRes?.data || []) {
        const slugOrId = event.slug || event.id;
        if (!slugOrId) continue;
        entries.push(
          ...buildLocalizedEntries(
            appBaseUrl,
            `/events/${slugOrId}`,
            event.createdAt ? new Date(event.createdAt) : undefined,
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
            appBaseUrl,
            `/posts/${slugOrId}`,
            post.publishedAt ? new Date(post.publishedAt) : undefined,
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
    const entries: MetadataRoute.Sitemap = [];

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
            appBaseUrl,
            `/cosplayer/${cosplayer.slug}`,
            cosplayer.createdAt ? new Date(cosplayer.createdAt) : undefined,
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
