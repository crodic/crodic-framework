import xior from "xior";
import { NextResponse } from "next/server";
import type { NextRequest, ProxyConfig } from "next/server";
import { decodeToken } from "./lib/utils";
import { JWTPayload } from "jose";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { AUTH_CODE, AUTH_QUERY_PARAM, AuthCode } from "./constants/auth";
import {
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
  getAuthCookieOptions,
  getDeleteCookieOptions,
} from "./lib/cookies";
import { isAuthRoute, isProtectedRoute, isPublicRoute } from "./config/routes";
import {
  extractSubdomain,
  getDefaultSubdomain,
  buildSubdomainUrl,
  buildRootUrl,
} from "./lib/subdomain";

const handleI18nRouting = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "";
  const subdomain = extractSubdomain(host);
  const isRootDomain = subdomain === null;

  const intlResponse = handleI18nRouting(request);
  if (!intlResponse.ok) {
    return intlResponse;
  }

  const { locale, pathname } = extractLocaleAndPathname(request, intlResponse);

  // ---------------------------------------------------------------------------
  // 1. Root Domain Routing (crodic.click / localhost:3000)
  // ---------------------------------------------------------------------------
  if (isRootDomain) {
    // When visiting root home, rewrite internally to Landing page
    if (pathname === "/" || pathname === "") {
      return rewriteToLanding(request, intlResponse, locale);
    }

    // Explicit /landing URL -> 301 redirect to root home for clean SEO canonical
    if (pathname === "/landing") {
      const cleanRootUrl = new URL(
        locale === routing.defaultLocale ? "/" : `/${locale}`,
        request.url
      );
      cleanRootUrl.search = request.nextUrl.search;
      return NextResponse.redirect(cleanRootUrl, {
        headers: intlResponse.headers,
        status: 301,
      });
    }

    // Public CMS / legal pages (/pages/*) are allowed on the root domain
    if (isPublicRoute(pathname)) {
      return finalizeResponse(request, intlResponse, pathname, null);
    }

    // Any app route accessed on root domain -> redirect to app subdomain
    const targetSubdomain = getDefaultSubdomain();
    const appUrl = buildSubdomainUrl({
      subdomain: targetSubdomain,
      path: request.nextUrl.pathname,
      requestUrl: request.nextUrl,
    });
    return NextResponse.redirect(appUrl, { status: 307 });
  }

  // ---------------------------------------------------------------------------
  // 2. Subdomain Routing (e.g. kosume.crodic.click / kosume.localhost:3000)
  // ---------------------------------------------------------------------------
  // If user accesses /landing on a subdomain, redirect to root domain
  if (pathname === "/landing") {
    const rootUrl = buildRootUrl({
      path: locale === routing.defaultLocale ? "/" : `/${locale}`,
      requestUrl: request.nextUrl,
    });
    return NextResponse.redirect(rootUrl, { status: 307 });
  }

  // ---------------------------------------------------------------------------
  // 3. Auth & Session Management (Runs on Subdomain)
  // ---------------------------------------------------------------------------
  const accessToken = request.cookies.get(COOKIE_ACCESS_TOKEN)?.value || "";
  const refreshToken = request.cookies.get(COOKIE_REFRESH_TOKEN)?.value || "";

  const { isCorrupt, shouldRefresh } = evaluateTokenState(
    accessToken,
    refreshToken
  );

  if (isProtectedRoute(pathname) && !refreshToken) {
    return unauthorizedResponse(
      request,
      intlResponse,
      locale,
      pathname,
      accessToken ? AUTH_CODE.SESSION_EXPIRED : AUTH_CODE.UNAUTHORIZED
    );
  }

  if (isAuthRoute(pathname) && refreshToken) {
    const payload = decodeToken(refreshToken);
    if (payload?.exp && payload.exp * 1000 > Date.now()) {
      const profileUrl = new URL(`/${locale}/profile`, request.url);
      return NextResponse.redirect(profileUrl, {
        headers: intlResponse.headers,
      });
    }
  }

  if (isCorrupt) {
    const unauthRes = unauthorizedResponse(
      request,
      intlResponse,
      locale,
      pathname,
      AUTH_CODE.INVALID_TOKEN
    );
    if (unauthRes !== intlResponse) {
      return unauthRes;
    }
  }

  if (shouldRefresh) {
    const refreshRes = await refreshTokenMiddleware(
      request,
      intlResponse,
      locale,
      pathname
    );
    if (refreshRes !== intlResponse) {
      return refreshRes;
    }
  }

  return finalizeResponse(request, intlResponse, pathname, subdomain);
}

function extractLocaleAndPathname(
  request: NextRequest,
  intlResponse: NextResponse
) {
  const [, rawLocale, ...rest] = new URL(
    intlResponse.headers.get("x-middleware-rewrite") || request.url
  ).pathname.split("/");

  return {
    locale: rawLocale || routing.defaultLocale,
    pathname: "/" + rest.join("/"),
  };
}

function rewriteToLanding(
  request: NextRequest,
  intlResponse: NextResponse,
  locale: string
) {
  const rewriteUrl = new URL(`/${locale}/landing`, request.url);
  rewriteUrl.search = request.nextUrl.search;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", "/landing");
  requestHeaders.set("x-subdomain", "");

  intlResponse.headers.forEach((value, key) => {
    if (key.startsWith("x-middleware-request-")) {
      requestHeaders.set(key.replace("x-middleware-request-", ""), value);
    }
  });

  const response = NextResponse.rewrite(rewriteUrl, {
    request: {
      headers: requestHeaders,
    },
    headers: intlResponse.headers,
  });

  intlResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie);
  });

  return response;
}

function evaluateTokenState(accessToken: string, refreshToken: string) {
  if (!refreshToken) {
    return { shouldRefresh: false, isCorrupt: false };
  }

  if (!accessToken) {
    return { shouldRefresh: true, isCorrupt: false };
  }

  const payload = decodeToken(accessToken);
  if (!payload?.exp) {
    return { shouldRefresh: false, isCorrupt: true };
  }

  const oneMinuteFromNow = Date.now() + 60_000;
  const isExpiringSoon = payload.exp * 1000 < oneMinuteFromNow;

  return { shouldRefresh: isExpiringSoon, isCorrupt: false };
}

function finalizeResponse(
  request: NextRequest,
  intlResponse: NextResponse,
  pathname: string,
  subdomain: string | null
) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  requestHeaders.set("x-subdomain", subdomain || "");

  intlResponse.headers.forEach((value, key) => {
    if (key.startsWith("x-middleware-request-")) {
      requestHeaders.set(key.replace("x-middleware-request-", ""), value);
    }
  });

  const finalResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
    headers: intlResponse.headers,
  });

  intlResponse.cookies.getAll().forEach((cookie) => {
    finalResponse.cookies.set(cookie);
  });

  return finalResponse;
}

const refreshTokenMiddleware = async (
  request: NextRequest,
  intlResponse: NextResponse,
  locale: string,
  pathname: string
) => {
  const refreshToken = request.cookies.get(COOKIE_REFRESH_TOKEN)?.value || "";
  try {
    const apiUrl =
      process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL;
    const { data } = await xior.post(`${apiUrl}/api/v1/user/auth/refresh`, {
      refreshToken: refreshToken,
    });
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data;

    const { exp: expAccessToken } = decodeToken(newAccessToken) as JWTPayload;
    const { exp: expRefreshToken } = decodeToken(newRefreshToken) as JWTPayload;

    if (!expAccessToken || !expRefreshToken) {
      return unauthorizedResponse(
        request,
        intlResponse,
        locale,
        pathname,
        AUTH_CODE.SESSION_EXPIRED
      );
    }

    intlResponse.cookies.set(
      COOKIE_ACCESS_TOKEN,
      newAccessToken,
      getAuthCookieOptions(new Date(expAccessToken * 1000))
    );
    intlResponse.cookies.set(
      COOKIE_REFRESH_TOKEN,
      newRefreshToken,
      getAuthCookieOptions(new Date(expRefreshToken * 1000))
    );

    return intlResponse;
  } catch (error: any) {
    console.error("Middleware refresh token failed:", error?.message || error);
    const status = error?.response?.status;
    if (status === 401 || status === 400) {
      return unauthorizedResponse(
        request,
        intlResponse,
        locale,
        pathname,
        AUTH_CODE.SESSION_EXPIRED
      );
    }
    // Network error or transient 5xx error: do not wipe cookies, proceed with request
    return intlResponse;
  }
};

const unauthorizedResponse = (
  request: NextRequest,
  intlResponse: NextResponse,
  locale: string,
  pathname: string,
  code: AuthCode = AUTH_CODE.SESSION_EXPIRED
) => {
  const deleteOptions = getDeleteCookieOptions();
  intlResponse.cookies.set(COOKIE_ACCESS_TOKEN, "", {
    ...deleteOptions,
    maxAge: 0,
  });
  intlResponse.cookies.set(COOKIE_REFRESH_TOKEN, "", {
    ...deleteOptions,
    maxAge: 0,
  });
  intlResponse.cookies.delete(COOKIE_ACCESS_TOKEN);
  intlResponse.cookies.delete(COOKIE_REFRESH_TOKEN);

  // If already on an auth page, or on public home page, do not force-redirect to login
  if (!pathname || pathname === "/" || pathname.startsWith("/auth")) {
    return intlResponse;
  }

  const redirectUrl = new URL(`/${locale}/auth/login`, request.url);
  redirectUrl.searchParams.set(AUTH_QUERY_PARAM.CODE, code);
  redirectUrl.searchParams.set(AUTH_QUERY_PARAM.FROM, pathname);

  const response = NextResponse.redirect(redirectUrl, {
    headers: intlResponse.headers,
  });
  response.cookies.set(COOKIE_ACCESS_TOKEN, "", {
    ...deleteOptions,
    maxAge: 0,
  });
  response.cookies.set(COOKIE_REFRESH_TOKEN, "", {
    ...deleteOptions,
    maxAge: 0,
  });
  response.cookies.delete(COOKIE_ACCESS_TOKEN);
  response.cookies.delete(COOKIE_REFRESH_TOKEN);
  return response;
};

export const config: ProxyConfig = {
  matcher: [
    {
      source:
        "/((?!api|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)",
      missing: [{ type: "header", key: "next-action" }],
    },
  ],
};
