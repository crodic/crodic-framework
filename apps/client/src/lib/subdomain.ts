/**
 * Domain & Subdomain Utility
 *
 * Provides dynamic subdomain extraction and URL generation without hardcoding domain names.
 * All base values are read from environment variables:
 * - NEXT_PUBLIC_ROOT_DOMAIN: e.g. "crodic.click" (prod) or "localhost:3000" (dev)
 * - NEXT_PUBLIC_APP_SUBDOMAIN: e.g. "kosume"
 */

export function getRootDomain(): string {
  if (process.env.NEXT_PUBLIC_ROOT_DOMAIN) {
    return process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    try {
      const url = new URL(process.env.NEXT_PUBLIC_APP_URL);
      return url.host;
    } catch {
      // ignore
    }
  }
  return process.env.NODE_ENV === "production"
    ? "crodic.click"
    : "localhost:3000";
}

export function getDefaultSubdomain(): string {
  return process.env.NEXT_PUBLIC_APP_SUBDOMAIN || "kosume";
}

/**
 * Extracts subdomain from a host string (e.g. "kosume.crodic.click" -> "kosume", "kosume.localhost:3000" -> "kosume")
 * Returns null if the host is the root domain (e.g. "crodic.click", "www.crodic.click", "localhost:3000")
 *
 * @param host - The Host or X-Forwarded-Host header value
 * @param customRootDomain - Optional root domain override (defaults to NEXT_PUBLIC_ROOT_DOMAIN)
 */
export function extractSubdomain(
  host: string | null | undefined,
  customRootDomain?: string
): string | null {
  if (!host) return null;

  // Normalize host: strip port and convert to lowercase
  const rawHost = host.trim().toLowerCase();
  const hostname = rawHost.split(":")[0];

  if (!hostname) return null;

  // Localhost resolution (RFC 6761)
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return null;
  }

  if (hostname.endsWith(".localhost")) {
    const sub = hostname.slice(0, -".localhost".length);
    return sub && sub !== "www" ? sub : null;
  }

  // Configured root domain resolution
  const rootDomain = (customRootDomain || getRootDomain()).trim().toLowerCase();
  const rootHost = rootDomain.split(":")[0];

  if (hostname === rootHost || hostname === `www.${rootHost}`) {
    return null;
  }

  if (rootHost && hostname.endsWith(`.${rootHost}`)) {
    const sub = hostname.slice(0, -(rootHost.length + 1));
    return sub && sub !== "www" ? sub : null;
  }

  // Fallback for general domains: if host has > 2 parts and not an IP
  const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  if (!isIp) {
    const parts = hostname.split(".");
    if (parts.length > 2 && parts[0] && parts[0] !== "www") {
      return parts[0];
    }
  }

  return null;
}

/**
 * Builds the canonical URL for a given subdomain.
 *
 * @param params.subdomain - The target subdomain (e.g. "kosume")
 * @param params.path - Pathname including leading slash (e.g. "/feed")
 * @param params.request - Origin request URL or host header for port & protocol detection
 */
export function buildSubdomainUrl({
  subdomain,
  path = "",
  requestUrl,
}: {
  subdomain: string;
  path?: string;
  requestUrl: URL;
}): URL {
  const rootDomain = getRootDomain().trim().toLowerCase();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const isLocal =
    requestUrl.hostname === "localhost" ||
    requestUrl.hostname.endsWith(".localhost") ||
    rootDomain.includes("localhost");

  const port = requestUrl.port ? `:${requestUrl.port}` : "";
  const protocol = requestUrl.protocol || "http:";

  if (isLocal) {
    return new URL(
      `${protocol}//${subdomain}.localhost${port}${normalizedPath}${requestUrl.search}`
    );
  }

  const rootHost = rootDomain.split(":")[0];
  return new URL(
    `${protocol}//${subdomain}.${rootHost}${port}${normalizedPath}${requestUrl.search}`
  );
}

/**
 * Builds the canonical URL for the root domain (where Landing page resides).
 *
 * @param params.path - Pathname including leading slash (e.g. "/" or "/landing")
 * @param params.requestUrl - Current request URL for protocol and port detection
 */
export function buildRootUrl({
  path = "",
  requestUrl,
}: {
  path?: string;
  requestUrl: URL;
}): URL {
  const rootDomain = getRootDomain().trim().toLowerCase();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const isLocal =
    requestUrl.hostname === "localhost" ||
    requestUrl.hostname.endsWith(".localhost") ||
    rootDomain.includes("localhost");

  const port = requestUrl.port ? `:${requestUrl.port}` : "";
  const protocol = requestUrl.protocol || "http:";

  if (isLocal) {
    return new URL(
      `${protocol}//localhost${port}${normalizedPath}${requestUrl.search}`
    );
  }

  const rootHost = rootDomain.split(":")[0];
  return new URL(
    `${protocol}//${rootHost}${port}${normalizedPath}${requestUrl.search}`
  );
}

/**
 * Returns an absolute URL pointing to the main app subdomain.
 * Safe to use in both SSR and browser client components.
 */
export function getAppExternalUrl(path = ""): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const defaultSubdomain = getDefaultSubdomain();

  if (typeof window !== "undefined") {
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname.endsWith(".localhost");
    const port = window.location.port ? `:${window.location.port}` : "";
    const protocol = window.location.protocol || "http:";

    if (isLocal) {
      return `${protocol}//${defaultSubdomain}.localhost${port}${normalizedPath}`;
    }

    const rootDomain = getRootDomain().trim().toLowerCase().split(":")[0];
    return `${protocol}//${defaultSubdomain}.${rootDomain}${port}${normalizedPath}`;
  }

  // SSR fallback
  const rootDomain = getRootDomain().trim().toLowerCase();
  const isLocal = rootDomain.includes("localhost");
  const protocol = isLocal ? "http:" : "https:";

  if (isLocal) {
    const port = rootDomain.includes(":") ? `:${rootDomain.split(":")[1]}` : "";
    return `${protocol}//${defaultSubdomain}.localhost${port}${normalizedPath}`;
  }

  const rootHost = rootDomain.split(":")[0];
  return `${protocol}//${defaultSubdomain}.${rootHost}${normalizedPath}`;
}

/**
 * Returns an absolute URL pointing to the root domain (Landing page).
 * Safe to use in both SSR and browser client components.
 */
export function getRootExternalUrl(path = ""): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (typeof window !== "undefined") {
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname.endsWith(".localhost");
    const port = window.location.port ? `:${window.location.port}` : "";
    const protocol = window.location.protocol || "http:";

    if (isLocal) {
      return `${protocol}//localhost${port}${normalizedPath}`;
    }

    const rootDomain = getRootDomain().trim().toLowerCase().split(":")[0];
    return `${protocol}//${rootDomain}${port}${normalizedPath}`;
  }

  // SSR fallback
  const rootDomain = getRootDomain().trim().toLowerCase();
  const isLocal = rootDomain.includes("localhost");
  const protocol = isLocal ? "http:" : "https:";

  if (isLocal) {
    const port = rootDomain.includes(":") ? `:${rootDomain.split(":")[1]}` : "";
    return `${protocol}//localhost${port}${normalizedPath}`;
  }

  const rootHost = rootDomain.split(":")[0];
  return `${protocol}//${rootHost}${normalizedPath}`;
}
