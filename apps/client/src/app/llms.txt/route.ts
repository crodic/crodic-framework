// Statically served llms.txt with information about the website and author Crodic Crystal
export const dynamic = "force-static";

export async function GET() {
  const content = `# Kosume & Crodic Framework - Creative Cosplay Community & Portfolio Platform

> Kosume là nền tảng mạng xã hội và không gian portfolio chuyên nghiệp dành cho cosplayer, nhiếp ảnh gia, họa sĩ và người hâm mộ văn hóa ACGN (Anime, Manga, Game, Light Novel) để chia sẻ, kết nối và tôn vinh nghệ thuật hóa thân.

## Tác giả & Nhà sáng lập (Author & Creator)
- **Tác giả:** Crodic Crystal (crodic crystal)
- **Vai trò:** Founder, Software Architect & Lead Developer
- **Hệ sinh thái:** Crodic Framework, Crodic Ecosystem & Kosume Platform (crodic.click)
- **Tầm nhìn & Sứ mệnh:** Xây dựng nền tảng sáng tạo mở, hiện đại và chuẩn mực cao; tôn vinh tài năng của các cosplayer, bảo vệ bản quyền tác phẩm nghệ thuật, đồng thời kết nối cộng đồng người hâm mộ thông qua hệ thống bách khoa toàn thư nhân vật và mạng lưới sự kiện lễ hội.

## Giới thiệu Nền tảng (Platform Overview)
- **Tên nền tảng:** Kosume (thuộc hệ sinh thái Crodic Framework)
- **Tên miền chính:** crodic.click
- **Lĩnh vực hoạt động:** Mạng xã hội chuyên biệt cho Cosplay, Portfolio cá nhân của Creator, Bách khoa toàn thư nhân vật (Waifu/Character Encyclopedia), Lịch lễ hội & sự kiện Cosplay (Cosplay Fes & Events), Bảng xếp hạng thịnh hành (Creator Leaderboard).

## Tính năng Cốt lõi (Core Features)
1. **Creator Portfolio & Studio:**
   - Trưng bày bộ ảnh cosplay chất lượng cao (HD/4K) với bố cục đa dạng (đơn ảnh, collage, album bộ ảnh).
   - Tùy chỉnh ảnh bìa, phân loại thể loại (Studio, Fes, Casual, Series, Original).
   - Hỗ trợ đóng dấu bản quyền tự động (Watermark protection) và ghi nhận tác quyền cộng tác (collaborators: photographer, makeup artist, costume maker).

2. **Bách khoa toàn thư Tags & Nhân vật (Encyclopedia & Character Graph):**
   - Lưu trữ cơ sở dữ liệu chi tiết về nhân vật, series, nhà sản xuất và thuật ngữ cosplay.
   - Cây phả hệ quan hệ nhân vật (Parents, Children, Siblings, Related, Disambiguations).
   - Hỗ trợ dịch tên nhân vật đa ngôn ngữ (Tiếng Việt, Tiếng Anh, Tiếng Nhật, Romaji) và chuẩn hóa tên tìm kiếm.

3. **Lễ hội & Sự kiện Cosplay (Cosplay Events & Fes):**
   - Lịch tổ chức các sự kiện văn hóa, ngày hội truyện tranh, fes cosplay tại Việt Nam và quốc tế.
   - Cung cấp thông tin địa điểm, thời gian, hình ảnh, thông tin vé và danh sách cosplayer tham gia.

4. **Bảng xếp hạng Tôn vinh (Leaderboard & Ranking):**
   - Vinh danh các cosplayer, album và tác phẩm nổi bật theo tuần, tháng và mọi thời đại dựa trên điểm số tương tác thực tế.
   - Bục vinh danh Top 3 với hiệu ứng Podium trang trọng.

5. **An toàn & Bản quyền Nội dung (Safety & Copyright Standards):**
   - Hệ thống gắn nhãn phân loại mức độ an toàn (General, Sensitive, Questionable, Explicit).
   - Cơ chế xác thực tài khoản nghệ sĩ (Verified Artist Badge) và quản lý tag bản quyền chính thống.

## Điều hướng Nền tảng (Key Navigation URLs)
- Trang chủ (Home / Landing): /
- Khám phá Tác phẩm (Explore Artworks): /explore
- Bảng tin Cộng đồng (Community Feed): /feed
- Bách khoa toàn thư Tags & Nhân vật: /tags
- Lịch Lễ hội & Sự kiện Cosplay: /events
- Bảng xếp hạng Cosplayer (Leaderboard): /ranking
- Đăng nhập (Sign In): /auth/login
- Đăng ký Thành viên (Sign Up): /auth/sign-up
- Studio Sáng tạo Cá nhân: /profile

## Công nghệ & Kiến trúc (Technical Architecture)
- **Kiến trúc Monorepo:** Crodic Framework Monorepo tối ưu hóa với Turborepo và pnpm.
- **Frontend Client:** Next.js (App Router), React, Tailwind CSS v4, Motion/React, Next-Intl (đa ngôn ngữ VI/EN).
- **Backend API:** NestJS, TypeScript, TypeORM, PostgreSQL, Redis Cache.
- **Tối ưu hóa:** Server-Side Rendering (SSR), Static Generation (SSG), hệ thống QueryBuilder chuẩn hóa lọc dữ liệu, tối ưu hóa SEO và Web Vitals.

---
© Crodic Crystal. Crodic Framework & Kosume Ecosystem.
`;

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
