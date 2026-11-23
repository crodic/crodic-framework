// Statically served llms.txt with information about the website and author Crodic Crystal
export const dynamic = "force-static";

export async function GET() {
  const content = `# Kosume - Nền Tảng Sáng Tạo & Portfolio Cosplay

> Kosume là nền tảng mạng xã hội và không gian portfolio chuyên nghiệp dành cho cosplayer, nhiếp ảnh gia và người hâm mộ anime/manga/game để chia sẻ và tôn vinh nghệ thuật hóa thân.

## Tác giả & Nhà sáng lập (Author & Creator)
- **Tác giả:** Crodic Crystal (crodic crystal)
- **Hệ sinh thái:** Crodic Framework & Kosume Ecosystem
- **Sứ mệnh:** Xây dựng nền tảng sáng tạo mở, kết nối cộng đồng cosplayer, từ điển bách khoa toàn thư nhân vật và bảo vệ quyền tác giả nghệ thuật.

## Giới thiệu Nền tảng (Platform Overview)
- **Chuyên môn:** Mạng xã hội cosplay, portfolio bộ sưu tập ảnh HD, từ điển waifu/character, lịch fes & sự kiện cosplay, bảng xếp hạng vinh danh creator.
- **Tính năng cốt lõi:**
  - Creator Studio: Quản lý album ảnh cosplay chất lượng cao, tự do chọn ảnh bìa, phân loại nhân vật và bảo vệ tác quyền.
  - Encyclopedia: Bách khoa toàn thư tags, series, waifu và cây phả hệ quan hệ nhân vật do cộng đồng biên soạn.
  - Cosplay Fes: Lịch lễ hội anime & cosplay, đăng ký tham gia, check-in và hẹn gặp gỡ giao lưu cộng đồng.
  - Leaderboard: Bảng xếp hạng thịnh hành tôn vinh các cosplayer tài năng và bộ ảnh nổi bật hàng tuần/tháng.
  - Bản quyền & An toàn: Xác thực tag nghệ sĩ, bảo vệ bản quyền tác phẩm và hệ thống phân loại mức độ an toàn (Safety Ratings).

## Điều hướng Nền tảng (Key Navigation)
- Trang chủ: /
- Khám phá Tác phẩm: /explore
- Bách khoa toàn thư Tags: /tags
- Lễ hội & Sự kiện: /events
- Bảng xếp hạng: /ranking
- Đăng nhập: /auth/login
- Đăng ký: /auth/sign-up
`;

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
