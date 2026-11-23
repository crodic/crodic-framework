export const COOKIE_ACCESS_TOKEN = "accessToken";
export const COOKIE_REFRESH_TOKEN = "refreshToken";

/**
 * Resolves the shared cookie domain from environment variable.
 * - In production: e.g. ".crodic.click" (prefixed with dot to cover all subdomains)
 * - In development: undefined (browser binds cookie to current host like "kosume.localhost")
 */
export function getCookieDomain(): string | undefined {
  const domain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN?.trim();
  return domain || undefined;
}

/**
 * Returns standardized options for authentication cookies.
 */
export function getAuthCookieOptions(expires?: Date) {
  const domain = getCookieDomain();
  return {
    path: "/",
    httpOnly: true,
    expires,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    ...(domain ? { domain } : {}),
  };
}

/**
 * Returns options required when removing cookies across subdomains.
 */
export function getDeleteCookieOptions() {
  const domain = getCookieDomain();
  return {
    path: "/",
    ...(domain ? { domain } : {}),
  };
}
