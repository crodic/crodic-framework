import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { fetchPublishedCmsPages } from "@/services/cms-pages";
import { getEvents } from "@/services/events";
import { getPosts } from "@/services/posts";
import { getCosplayers } from "@/services/cosplayer";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // 1. Static Core Pages
  const staticPages = [
    { path: "", changeFrequency: "daily" as const, priority: 1.0 },
    { path: "/explore", changeFrequency: "daily" as const, priority: 0.9 },
    { path: "/feed", changeFrequency: "daily" as const, priority: 0.9 },
    { path: "/ranking", changeFrequency: "daily" as const, priority: 0.8 },
    { path: "/events", changeFrequency: "daily" as const, priority: 0.8 },
    { path: "/jobs", changeFrequency: "daily" as const, priority: 0.8 },
    { path: "/cosplayer", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/landing", changeFrequency: "weekly" as const, priority: 0.7 },
    {
      path: "/auth/login",
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      path: "/auth/sign-up",
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.flatMap((page) =>
    routing.locales.map((locale) => ({
      url: `${baseUrl}/${locale}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((loc) => [loc, `${baseUrl}/${loc}${page.path}`])
        ),
      },
    }))
  );

  // 2. Dynamic CMS Pages
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
          lastModified: page.updatedAt ? new Date(page.updatedAt) : new Date(),
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }
    }
  } catch (err) {
    console.warn("Failed to fetch CMS pages for sitemap:", err);
  }

  // 3. Dynamic Events
  const eventEntries: MetadataRoute.Sitemap = [];
  try {
    const eventsRes = await getEvents({ limit: 100 });
    const events = eventsRes?.data || [];
    for (const event of events) {
      const slugOrId = event.slug || event.id;
      if (!slugOrId) continue;

      for (const locale of routing.locales) {
        eventEntries.push({
          url: `${baseUrl}/${locale}/events/${slugOrId}`,
          lastModified: event.createdAt
            ? new Date(event.createdAt)
            : new Date(),
          changeFrequency: "daily",
          priority: 0.8,
          alternates: {
            languages: Object.fromEntries(
              routing.locales.map((loc) => [
                loc,
                `${baseUrl}/${loc}/events/${slugOrId}`,
              ])
            ),
          },
        });
      }
    }
  } catch (err) {
    console.warn("Failed to fetch events for sitemap:", err);
  }

  // 4. Dynamic Posts / Artworks
  const postEntries: MetadataRoute.Sitemap = [];
  try {
    const postsRes = await getPosts({ limit: 100 });
    const posts = postsRes?.data || [];
    for (const post of posts) {
      const slugOrId = post.slug || post.id;
      if (!slugOrId) continue;

      for (const locale of routing.locales) {
        postEntries.push({
          url: `${baseUrl}/${locale}/post/${slugOrId}`,
          lastModified: post.publishedAt
            ? new Date(post.publishedAt)
            : new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
          alternates: {
            languages: Object.fromEntries(
              routing.locales.map((loc) => [
                loc,
                `${baseUrl}/${loc}/post/${slugOrId}`,
              ])
            ),
          },
        });
      }
    }
  } catch (err) {
    console.warn("Failed to fetch posts for sitemap:", err);
  }

  // 5. Dynamic Cosplayer Profiles
  const cosplayerEntries: MetadataRoute.Sitemap = [];
  try {
    const cosplayersRes = await getCosplayers({ limit: 100 });
    const cosplayers = cosplayersRes?.data || [];
    for (const cosplayer of cosplayers) {
      if (!cosplayer.slug) continue;

      for (const locale of routing.locales) {
        cosplayerEntries.push({
          url: `${baseUrl}/${locale}/cosplayer/${cosplayer.slug}`,
          lastModified: cosplayer.createdAt
            ? new Date(cosplayer.createdAt)
            : new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
          alternates: {
            languages: Object.fromEntries(
              routing.locales.map((loc) => [
                loc,
                `${baseUrl}/${loc}/cosplayer/${cosplayer.slug}`,
              ])
            ),
          },
        });
      }
    }
  } catch (err) {
    console.warn("Failed to fetch cosplayers for sitemap:", err);
  }

  return [
    ...staticEntries,
    ...cmsEntries,
    ...eventEntries,
    ...postEntries,
    ...cosplayerEntries,
  ];
}
