import { getRootDomain } from "./subdomain";

export const COOKIE_ACCESS_TOKEN = "accessToken";
export const COOKIE_REFRESH_TOKEN = "refreshToken";

/**
 * Resolves the shared cookie domain from environment variable.
 * - In production: e.g. ".crodic.click" (prefixed with dot to cover all subdomains)
 * - In development: undefined (browser binds cookie to current host like "kosume.localhost")
 */
export function getCookieDomain(): string | undefined {
  if (process.env.NEXT_PUBLIC_COOKIE_DOMAIN) {
    return process.env.NEXT_PUBLIC_COOKIE_DOMAIN.trim() || undefined;
  }
  if (process.env.NODE_ENV === "production") {
    const root = getRootDomain().trim().toLowerCase().split(":")[0];
    if (root && root !== "localhost" && !root.includes("127.0.0.1")) {
      return root.startsWith(".") ? root : `.${root}`;
    }
  }
  return undefined;
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
    expires: new Date(0),
    maxAge: 0,
    ...(domain ? { domain } : {}),
  };
}

/**
 * Interface representing a Next.js cookie store capable of deleting cookies.
 * Compatible with `await cookies()` and `NextResponse.cookies`.
 */
export interface CookieDeleter {
  delete: (...args: any[]) => any;
}

/**
 * Deletes authentication cookies cleanly using Next.js ResponseCookies API.
 * Ensures domain is properly included so the browser purges shared domain cookies.
 */
export function deleteAuthCookies(cookieStore: CookieDeleter) {
  const deleteOptions = getDeleteCookieOptions();
  cookieStore.delete({ name: COOKIE_ACCESS_TOKEN, ...deleteOptions });
  cookieStore.delete({ name: COOKIE_REFRESH_TOKEN, ...deleteOptions });
}
