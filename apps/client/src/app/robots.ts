import type { MetadataRoute } from "next";
import { getAppExternalUrl } from "@/lib/subdomain";

export default function robots(): MetadataRoute.Robots {
  const appBaseUrl = getAppExternalUrl().replace(/\/+$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/auth/", "/*/profile", "/profile"],
      },
    ],
    sitemap: `${appBaseUrl}/sitemap.xml`,
  };
}
