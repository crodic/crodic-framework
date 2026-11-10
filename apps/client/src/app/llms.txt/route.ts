import { fetchActiveClientWhiteLabel } from "@/lib/white-label";
import { fetchPublishedCmsPages } from "@/services/cms-pages";

// Enable ISR: Cache statically and revalidate in background every 1 hour (3600s)
export const revalidate = 3600;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://crodic.click";
  const whiteLabel = await fetchActiveClientWhiteLabel();

  const brandName = whiteLabel?.brandName || "Kosume";
  const title =
    whiteLabel?.metaTitle ||
    whiteLabel?.siteTitle ||
    `${brandName} - Creative Platform for Artists`;

  const description =
    whiteLabel?.metaDescription ||
    whiteLabel?.siteTagline ||
    "Nền tảng chia sẻ portfolio, kết nối và khám phá tác phẩm nghệ thuật số dành cho các artist, họa sĩ minh họa và cộng đồng sáng tạo.";

  const canonicalUrl = whiteLabel?.canonicalUrl || baseUrl;
  const copyright =
    whiteLabel?.copyrightText ||
    `© ${new Date().getFullYear()} ${brandName}. All rights reserved.`;

  // Fetch published CMS pages (terms, privacy, guides, etc.)
  let cmsPages: Awaited<ReturnType<typeof fetchPublishedCmsPages>> = [];
  try {
    cmsPages = await fetchPublishedCmsPages();
  } catch {
    // Graceful fallback if CMS endpoint is temporarily unavailable
    cmsPages = [];
  }

  const lines: string[] = [
    `# ${title}`,
    "",
    `> ${description}`,
    "",
    "## Khám phá Nền tảng (Platform Navigation)",
    `- [Trang chủ](${canonicalUrl}): Khám phá trang chủ và tác phẩm nổi bật của ${brandName}`,
    `- [Khám phá Tags & Bách khoa toàn thư](${baseUrl}/vi/tags): Khám phá bộ sưu tập tranh theo phong cách, nhân vật và thể loại nghệ thuật`,
    `- [Đăng nhập](${baseUrl}/vi/auth/login): Đăng nhập tài khoản artist`,
    `- [Đăng ký](${baseUrl}/vi/auth/sign-up): Tạo tài khoản gia nhập cộng đồng nghệ thuật`,
  ];

  // If there are published CMS pages, add them under Documentation / Policies
  const validCmsPages = cmsPages.filter((page) => {
    return (
      page.translations &&
      page.translations.some(
        (t) =>
          t.slug && (!t.robots || !t.robots.toLowerCase().includes("noindex"))
      )
    );
  });

  if (validCmsPages.length > 0) {
    lines.push("", "## Tài liệu & Chính sách (Documentation & Policies)");
    for (const page of validCmsPages) {
      const primaryTranslation =
        page.translations.find((t) => t.locale === "vi") ||
        page.translations.find((t) => t.locale === "en") ||
        page.translations[0];

      if (primaryTranslation && primaryTranslation.slug) {
        const pageUrl = `${baseUrl}/${primaryTranslation.locale}/pages/${primaryTranslation.slug}`;
        const pageTitle = primaryTranslation.title || primaryTranslation.slug;
        const pageDesc = primaryTranslation.seoDescription
          ? `: ${primaryTranslation.seoDescription}`
          : "";
        lines.push(`- [${pageTitle}](${pageUrl})${pageDesc}`);
      }
    }
  }

  // Brand and Metadata Section
  lines.push(
    "",
    "## Thông tin Thương hiệu & Bản quyền",
    `- Nền tảng: ${brandName}`,
    `- Website chính thức: ${canonicalUrl}`,
    `- Bản quyền: ${copyright}`
  );

  const body = lines.join("\n");

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
