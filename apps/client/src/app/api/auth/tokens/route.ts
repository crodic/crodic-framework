import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import {
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
  getAuthCookieOptions,
  deleteAuthCookies,
} from "@/lib/cookies";

export const GET = async () => {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value || "";
  const refreshToken = cookieStore.get(COOKIE_REFRESH_TOKEN)?.value || "";

  let needsRefresh = !accessToken && Boolean(refreshToken);
  if (accessToken && refreshToken) {
    try {
      const exp = decodeJwt(accessToken).exp;
      if (!exp || exp * 1000 < Date.now() + 30_000) {
        needsRefresh = true;
      }
    } catch {
      needsRefresh = true;
    }
  }

  if (needsRefresh && refreshToken) {
    try {
      const apiUrl =
        process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/v1/user/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (res.ok) {
        const data = await res.json();
        const newAccessToken = data?.data?.accessToken || data?.accessToken;
        const newRefreshToken = data?.data?.refreshToken || data?.refreshToken;

        if (newAccessToken) {
          const expAccess = decodeJwt(newAccessToken).exp;
          if (expAccess) {
            cookieStore.set(
              COOKIE_ACCESS_TOKEN,
              newAccessToken,
              getAuthCookieOptions(new Date(expAccess * 1000))
            );
          }
          accessToken = newAccessToken;
        }

        if (newRefreshToken) {
          const expRefresh = decodeJwt(newRefreshToken).exp;
          if (expRefresh) {
            cookieStore.set(
              COOKIE_REFRESH_TOKEN,
              newRefreshToken,
              getAuthCookieOptions(new Date(expRefresh * 1000))
            );
          }
        }
      }
    } catch {
      // ignore transient error
    }
  }

  return Response.json({ accessToken }, { status: 200 });
};

export const POST = async (req: Request) => {
  const body: { accessToken?: string; refreshToken?: string } =
    await req.json();
  const cookieStore = await cookies();
  const { accessToken, refreshToken } = body;

  if (!accessToken && !refreshToken) {
    return Response.json({ message: "Tokens are required" }, { status: 400 });
  }

  if (accessToken) {
    const expAccessToken = decodeJwt(accessToken).exp;
    if (!expAccessToken) {
      return Response.json({ message: "Invalid accessToken" }, { status: 400 });
    }
    cookieStore.set(
      COOKIE_ACCESS_TOKEN,
      accessToken,
      getAuthCookieOptions(new Date(expAccessToken * 1000))
    );
  }

  if (refreshToken) {
    const expRefreshToken = decodeJwt(refreshToken).exp;
    if (!expRefreshToken) {
      return Response.json(
        { message: "Invalid refreshToken" },
        { status: 400 }
      );
    }
    cookieStore.set(
      COOKIE_REFRESH_TOKEN,
      refreshToken,
      getAuthCookieOptions(new Date(expRefreshToken * 1000))
    );
  }

  return Response.json({ success: true }, { status: 200 });
};

export const DELETE = async () => {
  const cookieStore = await cookies();
  deleteAuthCookies(cookieStore);
  return Response.json({ message: "Success" }, { status: 200 });
};
