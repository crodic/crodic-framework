/**
 * Domain & Subdomain Utility
 *
 * Provides dynamic subdomain extraction and URL generation without hardcoding domain names or ports.
 * All base values are read dynamically from environment variables:
 * - NEXT_PUBLIC_ROOT_DOMAIN: e.g. "crodic.click" (prod) or "localhost:3000" (dev)
 * - NEXT_PUBLIC_APP_SUBDOMAIN: e.g. "kosume"
 */

export function isSubdomainRoutingEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_SUBDOMAIN_ROUTING !== "false";
}

export function isLocalHost(host?: string | null): boolean {
  if (!host) return false;
  const [firstPart] = host.split(":");
  const clean = (firstPart ?? "").toLowerCase();
  return (
    clean === "localhost" ||
    clean === "127.0.0.1" ||
    clean.endsWith(".localhost")
  );
}

function getHostWithoutPort(host: string): string {
  const [firstPart] = host.split(":");
  return (firstPart ?? host).toLowerCase();
}

function getPortWithColon(host: string): string {
  const parts = host.split(":");
  return parts[1] ? `:${parts[1]}` : "";
}

export function getRootDomain(): string {
  if (process.env.NEXT_PUBLIC_ROOT_DOMAIN) {
    return process.env.NEXT_PUBLIC_ROOT_DOMAIN.trim().toLowerCase();
  }
  if (process.env.NEXT_PUBLIC_LANDING_URL) {
    try {
      const url = new URL(process.env.NEXT_PUBLIC_LANDING_URL);
      return url.host.toLowerCase();
    } catch {
      // ignore
    }
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    try {
      const url = new URL(process.env.NEXT_PUBLIC_APP_URL);
      const hostname = url.hostname.toLowerCase();
      // If hostname has subdomain (e.g. "app.domain.com"), extract "domain.com"
      const parts = hostname.split(".");
      if (parts.length > 2 && !hostname.endsWith(".localhost")) {
        const root = parts.slice(1).join(".");
        return url.port ? `${root}:${url.port}` : root;
      }
      return url.host.toLowerCase();
    } catch {
      // ignore
    }
  }
  return process.env.NODE_ENV === "production" ? "crodic.click" : "localhost";
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
  if (!isSubdomainRoutingEnabled()) {
    return null;
  }
  if (!host) return null;

  // Normalize host: strip port and convert to lowercase
  const rawHost = host.trim().toLowerCase();
  const hostname = getHostWithoutPort(rawHost);

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
  const rootHost = getHostWithoutPort(rootDomain);

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
      return parts[0] ?? null;
    }
  }

  return null;
}

/**
 * Builds the canonical URL for a given subdomain.
 *
 * @param params.subdomain - The target subdomain (e.g. "kosume")
 * @param params.path - Pathname including leading slash (e.g. "/feed")
 * @param params.requestUrl - Origin request URL for path & search params
 * @param params.protoHeader - Protocol from x-forwarded-proto
 */
export function buildSubdomainUrl({
  subdomain = getDefaultSubdomain(),
  path = "",
  requestUrl,
  protoHeader,
}: {
  subdomain?: string;
  path?: string;
  requestUrl: URL;
  protoHeader?: string | null;
}): URL {
  if (!isSubdomainRoutingEnabled()) {
    return buildRootUrl({ path, requestUrl, protoHeader });
  }

  const rootDomain = getRootDomain();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const isLocal =
    isLocalHost(requestUrl.hostname) || rootDomain.includes("localhost");

  if (isLocal) {
    const port = requestUrl.port ? `:${requestUrl.port}` : "";
    return new URL(
      `http://${subdomain}.localhost${port}${normalizedPath}${requestUrl.search}`
    );
  }

  // Production: Always HTTPS and NEVER append internal server ports
  const rootHost = getHostWithoutPort(rootDomain);
  const protocol =
    protoHeader === "http" || protoHeader === "https"
      ? `${protoHeader}:`
      : "https:";

  return new URL(
    `${protocol}//${subdomain}.${rootHost}${normalizedPath}${requestUrl.search}`
  );
}

/**
 * Builds the canonical URL for the root domain (where Landing page resides).
 *
 * @param params.path - Pathname including leading slash (e.g. "/" or "/landing")
 * @param params.requestUrl - Current request URL for search params
 * @param params.protoHeader - Protocol from x-forwarded-proto
 */
export function buildRootUrl({
  path = "",
  requestUrl,
  protoHeader,
}: {
  path?: string;
  requestUrl: URL;
  protoHeader?: string | null;
}): URL {
  const rootDomain = getRootDomain();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const isLocal =
    isLocalHost(requestUrl.hostname) || rootDomain.includes("localhost");

  if (isLocal) {
    const port = requestUrl.port ? `:${requestUrl.port}` : "";
    return new URL(
      `http://localhost${port}${normalizedPath}${requestUrl.search}`
    );
  }

  // Production: Always HTTPS and NEVER append internal server ports
  const rootHost = getHostWithoutPort(rootDomain);
  const protocol =
    protoHeader === "http" || protoHeader === "https"
      ? `${protoHeader}:`
      : "https:";

  return new URL(
    `${protocol}//${rootHost}${normalizedPath}${requestUrl.search}`
  );
}

/**
 * Returns an absolute URL pointing to the main app subdomain.
 * Safe to use in both SSR and browser client components.
 */
export function getAppExternalUrl(path = ""): string {
  if (!isSubdomainRoutingEnabled()) {
    return getRootExternalUrl(path);
  }

  const normalizedPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  const defaultSubdomain = getDefaultSubdomain();

  if (typeof window !== "undefined") {
    const isLocal = isLocalHost(window.location.hostname);
    if (isLocal) {
      const port = window.location.port ? `:${window.location.port}` : "";
      return `http://${defaultSubdomain}.localhost${port}${normalizedPath}`;
    }

    const rootDomain = getHostWithoutPort(getRootDomain());
    return `https://${defaultSubdomain}.${rootDomain}${normalizedPath}`;
  }

  // SSR fallback
  const rootDomain = getRootDomain();
  const isLocal = rootDomain.includes("localhost");
  if (isLocal) {
    const port = getPortWithColon(rootDomain);
    return `http://${defaultSubdomain}.localhost${port}${normalizedPath}`;
  }

  const rootHost = getHostWithoutPort(rootDomain);
  return `https://${defaultSubdomain}.${rootHost}${normalizedPath}`;
}

/**
 * Returns an absolute URL pointing to the root domain (Landing page).
 * Safe to use in both SSR and browser client components.
 */
export function getRootExternalUrl(path = ""): string {
  const normalizedPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";

  if (typeof window !== "undefined") {
    const isLocal = isLocalHost(window.location.hostname);
    if (isLocal) {
      const port = window.location.port ? `:${window.location.port}` : "";
      return `http://localhost${port}${normalizedPath}`;
    }

    const rootDomain = getHostWithoutPort(getRootDomain());
    return `https://${rootDomain}${normalizedPath}`;
  }

  // SSR fallback
  const rootDomain = getRootDomain();
  const isLocal = rootDomain.includes("localhost");
  if (isLocal) {
    const port = getPortWithColon(rootDomain);
    return `http://localhost${port}${normalizedPath}`;
  }

  const rootHost = getHostWithoutPort(rootDomain);
  return `https://${rootHost}${normalizedPath}`;
}
