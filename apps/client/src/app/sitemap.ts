import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { fetchPublishedCmsPages } from "@/services/cms-pages";
import { getEvents } from "@/services/events";
import { getPosts } from "@/services/posts";
import { getCosplayers } from "@/services/cosplayer";
import { getJobs } from "@/services/jobs";

export async function generateSitemaps() {
  return [
    { id: "pages" },
    { id: "events" },
    { id: "posts" },
    { id: "cosplayers" },
    { id: "jobs" },
  ];
}

export default async function sitemap(props: {
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
    const staticPages = [
      { path: "", changeFrequency: "daily" as const, priority: 1.0 },
      { path: "/explore", changeFrequency: "daily" as const, priority: 0.9 },
      { path: "/feed", changeFrequency: "daily" as const, priority: 0.9 },
      { path: "/ranking", changeFrequency: "daily" as const, priority: 0.8 },
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
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((loc) => [loc, `${baseUrl}/${loc}${page.path}`])
          ),
        },
      }))
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
    const eventListingEntries: MetadataRoute.Sitemap = routing.locales.map(
      (locale) => ({
        url: `${baseUrl}/${locale}/events`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/events`])
          ),
        },
      })
    );

    const eventDetailEntries: MetadataRoute.Sitemap = [];
    try {
      const eventsRes = await getEvents({ limit: 100 });
      const events = eventsRes?.data || [];
      for (const event of events) {
        const slugOrId = event.slug || event.id;
        if (!slugOrId) continue;

        for (const locale of routing.locales) {
          eventDetailEntries.push({
            url: `${baseUrl}/${locale}/events/${slugOrId}`,
            lastModified: event.createdAt ? new Date(event.createdAt) : now,
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

    return [...eventListingEntries, ...eventDetailEntries];
  }

  // 3. Posts Sitemap
  if (id === "posts") {
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
            lastModified: post.publishedAt ? new Date(post.publishedAt) : now,
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

    return postEntries;
  }

  // 4. Cosplayers Sitemap
  if (id === "cosplayers") {
    const cosplayerListingEntries: MetadataRoute.Sitemap = routing.locales.map(
      (locale) => ({
        url: `${baseUrl}/${locale}/cosplayer`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/cosplayer`])
          ),
        },
      })
    );

    const cosplayerDetailEntries: MetadataRoute.Sitemap = [];
    try {
      const cosplayersRes = await getCosplayers({ limit: 100 });
      const cosplayers = cosplayersRes?.data || [];
      for (const cosplayer of cosplayers) {
        if (!cosplayer.slug) continue;

        for (const locale of routing.locales) {
          cosplayerDetailEntries.push({
            url: `${baseUrl}/${locale}/cosplayer/${cosplayer.slug}`,
            lastModified: cosplayer.createdAt
              ? new Date(cosplayer.createdAt)
              : now,
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

    return [...cosplayerListingEntries, ...cosplayerDetailEntries];
  }

  // 5. Jobs Sitemap
  if (id === "jobs") {
    const jobListingEntries: MetadataRoute.Sitemap = routing.locales.map(
      (locale) => ({
        url: `${baseUrl}/${locale}/jobs`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/jobs`])
          ),
        },
      })
    );

    const jobDetailEntries: MetadataRoute.Sitemap = [];
    try {
      const jobsRes = await getJobs({ limit: 100 });
      const jobs = jobsRes?.data || [];
      for (const job of jobs) {
        if (!job.slug) continue;

        for (const locale of routing.locales) {
          jobDetailEntries.push({
            url: `${baseUrl}/${locale}/jobs?slug=${job.slug}`,
            lastModified: job.createdAt ? new Date(job.createdAt) : now,
            changeFrequency: "weekly",
            priority: 0.7,
            alternates: {
              languages: Object.fromEntries(
                routing.locales.map((loc) => [
                  loc,
                  `${baseUrl}/${loc}/jobs?slug=${job.slug}`,
                ])
              ),
            },
          });
        }
      }
    } catch (err) {
      console.warn("Failed to fetch jobs for sitemap:", err);
    }

    return [...jobListingEntries, ...jobDetailEntries];
  }

  return [];
}
