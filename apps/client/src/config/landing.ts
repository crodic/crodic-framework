export interface LandingNavLink {
  key: string;
  defaultLabel: string;
  href: string;
}

export const LANDING_NAV_LINKS: LandingNavLink[] = [
  { key: "explore", defaultLabel: "Khám phá", href: "#albums" },
  { key: "tags", defaultLabel: "Bách khoa Tags", href: "/tags" },
  { key: "community", defaultLabel: "Cosplayers", href: "#cosplayers" },
  { key: "events", defaultLabel: "Sự kiện", href: "/events" },
  { key: "ranking", defaultLabel: "Bảng xếp hạng", href: "/ranking" },
  { key: "about", defaultLabel: "Về Kosume", href: "#about" },
  { key: "faq", defaultLabel: "Hỏi đáp", href: "#faq" },
];

export const HERO_STATS = [
  { value: "12K+", key: "cosplayers", defaultLabel: "Cosplayers" },
  { value: "85K+", key: "artworks", defaultLabel: "Tác phẩm" },
  { value: "500K+", key: "engagements", defaultLabel: "Lượt tương tác" },
];

export interface HighlightFeatureItem {
  id:
    | "portfolio"
    | "encyclopedia"
    | "events"
    | "ranking"
    | "community"
    | "protection";
  defaultTitle: string;
  defaultDesc: string;
  iconName: "folder" | "book" | "calendar" | "trophy" | "users" | "shield";
  href: string;
  badge: string;
}

export const HIGHLIGHT_FEATURES: HighlightFeatureItem[] = [
  {
    id: "portfolio",
    defaultTitle: "Portfolio Chuyên Nghiệp",
    defaultDesc:
      "Đăng tải bộ sưu tập ảnh cosplay chất lượng cao, tự do chọn ảnh bìa, lưu trữ tối đa 20 ảnh độ nét cao mỗi album.",
    iconName: "folder",
    href: "/studio",
    badge: "Creator Studio",
  },
  {
    id: "encyclopedia",
    defaultTitle: "Từ Điển & Phả Hệ Nhân Vật",
    defaultDesc:
      "Tra cứu nguồn gốc nhân vật, series anime & game, cây quan hệ phả hệ và bách khoa toàn thư thẻ do cộng đồng biên soạn.",
    iconName: "book",
    href: "/tags",
    badge: "Encyclopedia",
  },
  {
    id: "events",
    defaultTitle: "Lễ Hội & Sự Kiện Fes",
    defaultDesc:
      "Cập nhật lịch các lễ hội cosplay, anime fes, đăng ký tham gia và hẹn gặp gỡ giao lưu cùng bạn bè cùng fandom.",
    iconName: "calendar",
    href: "/events",
    badge: "Cosplay Fes",
  },
  {
    id: "ranking",
    defaultTitle: "Bảng Xếp Hạng & Vinh Danh",
    defaultDesc:
      "Vinh danh những cosplayer tài năng và tác phẩm nghệ thuật thịnh hành nhất trong tuần và tháng.",
    iconName: "trophy",
    href: "/ranking",
    badge: "Leaderboard",
  },
  {
    id: "community",
    defaultTitle: "Kết Nối Fan & Idol",
    defaultDesc:
      "Theo dõi idol yêu thích, thả tim, bookmark, tương tác bình luận và chia sẻ đam mê trong không gian thân thiện.",
    iconName: "users",
    href: "/feed",
    badge: "Social Feed",
  },
  {
    id: "protection",
    defaultTitle: "Bảo Vệ Bản Quyền Tác Giả",
    defaultDesc:
      "Bảo vệ thẻ tác giả (*), khóa bản quyền tác phẩm và hệ thống phân loại mức độ an toàn (Safety Ratings) nghiêm ngặt.",
    iconName: "shield",
    href: "/pages/privacy",
    badge: "Trust & Safety",
  },
];

export const FOOTER_LINKS_COL_1 = [
  { key: "features", defaultLabel: "Tính năng nổi bật", href: "#features" },
  { key: "explore", defaultLabel: "Khám phá tác phẩm", href: "/explore" },
  { key: "tags", defaultLabel: "Bách khoa toàn thư Tags", href: "/tags" },
  { key: "events", defaultLabel: "Lễ hội & Sự kiện", href: "/events" },
  { key: "ranking", defaultLabel: "Bảng xếp hạng", href: "/ranking" },
];

export const FOOTER_DEFAULT_CMS_LINKS = [
  {
    key: "terms",
    defaultLabel: "Điều khoản dịch vụ",
    href: "/pages/terms-of-service",
  },
  {
    key: "privacy",
    defaultLabel: "Chính sách bảo mật",
    href: "/pages/privacy-policy",
  },
  { key: "about", defaultLabel: "Về chúng tôi", href: "/pages/about" },
  { key: "contact", defaultLabel: "Liên hệ & Hỗ trợ", href: "/pages/contact" },
];
