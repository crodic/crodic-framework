export type RoutePattern = string | RegExp;

/**
 * Route Matcher Factory (Chuẩn Clerk / Next.js Architecture)
 * Nhận danh sách RegExp hoặc String wildcard pattern (ví dụ: '/profile(.*)', '/auth/(.*)')
 * Trả về một hàm kiểm tra pathname có khớp hay không.
 */
export function createRouteMatcher(patterns: RoutePattern[]) {
  return (pathname: string): boolean => {
    // Chuẩn hóa loại bỏ trailing slash (trừ root '/')
    const normalizedPath =
      pathname.length > 1 && pathname.endsWith("/")
        ? pathname.slice(0, -1)
        : pathname;

    return patterns.some((pattern) => {
      if (pattern instanceof RegExp) {
        return pattern.test(normalizedPath);
      }
      if (typeof pattern === "string") {
        // Hỗ trợ string wildcard dạng: '/profile(.*)' hoặc '/profile/*'
        const regexPattern = new RegExp(
          `^${pattern.replace(/\(\.\*\)/g, ".*").replace(/\/\*/g, "(?:/.*)?")}$`
        );
        return regexPattern.test(normalizedPath);
      }
      return false;
    });
  };
}

/**
 * 1. STRICTLY PROTECTED ROUTES (Bắt buộc đăng nhập):
 * Nếu khách chưa có session cố tình truy cập, Middleware lập tức chuyển hướng về /auth/login.
 */
export const isProtectedRoute = createRouteMatcher([
  /^\/profile(\/.*)?$/,
  /^\/settings(\/.*)?$/,
  /^\/upload(\/.*)?$/,
]);

/**
 * 2. GUEST-ONLY AUTH ROUTES (Dành riêng cho khách chưa login):
 * Nếu người dùng đã đăng nhập hợp lệ truy cập vào đây, Middleware sẽ chuyển hướng về /profile.
 */
export const isAuthRoute = createRouteMatcher([/^\/auth(\/.*)?$/]);

/**
 * LƯU Ý VỀ CÁC TRANG CÒN LẠI (AUTH OPTIONAL / HYBRID):
 * Mọi route không nằm trong `isProtectedRoute` và `isAuthRoute`
 * (như `/`, `/feed`, `/explore`, `/ranking`, `/events`, `/jobs`, `/cosplayer/[slug]`, `/post/[id]`)
 * mặc nhiên là AUTH OPTIONAL.
 * Middleware cho phép cả khách và người dùng đăng nhập truy cập tự nhiên,
 * đồng thời vẫn âm thầm duy trì và refresh token nếu có session.
 */
