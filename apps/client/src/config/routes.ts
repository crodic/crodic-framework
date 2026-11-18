export type RoutePattern = string | RegExp;

/**
 * Compiles an array of string or RegExp patterns into a reusable route matcher function.
 * Patterns are pre-compiled into regular expressions once at initialization time to ensure optimal request performance.
 *
 * Supports:
 * - RegExp objects: e.g. `/^\/profile(\/.*)?$/`
 * - Wildcard strings: e.g. `"/settings/*"` (matches `/settings` and `/settings/anything`), `"/profile(.*)"`
 * - Exact string paths: e.g. `"/auth"`
 *
 * @param patterns - List of route patterns (RegExp or wildcard string like `/settings/*`).
 * @returns A matcher function testing whether a given pathname matches any configured pattern.
 */
export function createRouteMatcher(patterns: RoutePattern[]) {
  const regexPatterns = patterns.map((pattern) => {
    if (pattern instanceof RegExp) {
      return pattern;
    }

    if (pattern.endsWith("/*")) {
      const base = pattern.slice(0, -2).replace(/[.+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`^${base}(?:/.*)?$`);
    }

    // Clerk standard wildcard: "/profile(.*)" or "/profile/(.*)"
    if (pattern.endsWith("(.*)")) {
      const rawBase = pattern.slice(0, -4).replace(/\/$/, "");
      const base = rawBase.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`^${base}(?:/.*)?$`);
    }

    // Next.js path-to-regexp style wildcard: "/profile/:path*"
    if (pattern.endsWith(":path*")) {
      const rawBase = pattern.slice(0, -7).replace(/\/$/, "");
      const base = rawBase.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`^${base}(?:/.*)?$`);
    }

    const cleanPattern = pattern
      .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\\\*/g, ".*");

    return new RegExp(`^${cleanPattern}$`);
  });

  return (pathname: string): boolean => {
    const normalizedPath =
      pathname.length > 1 && pathname.endsWith("/")
        ? pathname.slice(0, -1)
        : pathname;

    return regexPatterns.some((regex) => regex.test(normalizedPath));
  };
}

/**
 * Matches explicit public routes and subpaths.
 * Acts as an exception list to allow public access even within otherwise protected sections.
 */
export const isPublicRoute = createRouteMatcher([/^\/pages(\/.*)?$/]);

/**
 * Internal route matcher for base protected endpoints.
 * All subpaths under these roots strictly require user authentication.
 */
const protectedMatcher = createRouteMatcher([
  /^\/feed(\/.*)?$/,
  /^\/notifications(\/.*)?$/,
  /^\/onboarding(\/.*)?$/,
  /^\/profile(\/.*)?$/,
  /^\/settings(\/.*)?$/,
  /^\/upload(\/.*)?$/,
]);

/**
 * Determines whether a route strictly requires user authentication.
 * Evaluates against base protected routes while automatically exempting any matching `isPublicRoute` exceptions.
 *
 * @param pathname - The normalized route pathname without locale prefix.
 * @returns `true` if authentication is strictly required, `false` otherwise.
 */
export const isProtectedRoute = (pathname: string): boolean => {
  if (isPublicRoute(pathname)) {
    return false;
  }
  return protectedMatcher(pathname);
};

/**
 * Internal route matcher for guest-facing authentication forms.
 */
const authPagesMatcher = createRouteMatcher([
  /^\/auth\/?$/,
  /^\/auth\/(login|sign-up|forgot-password|reset-password|restore)(\/.*)?$/,
]);

/**
 * Identifies guest-only authentication pages (sign-in, registration, password recovery).
 * Authenticated visitors to these routes are redirected to their profile.
 * Automatically excludes `/auth/oauth/callback` to prevent interrupting social login token exchanges.
 *
 * @param pathname - The normalized route pathname without locale prefix.
 * @returns `true` if the route is a guest-only auth page, `false` otherwise.
 */
export const isAuthRoute = (pathname: string): boolean => {
  if (pathname.startsWith("/auth/oauth/callback")) {
    return false;
  }
  return authPagesMatcher(pathname);
};
