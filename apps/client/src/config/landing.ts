export interface LandingNavLink {
  key: string;
  defaultLabel: string;
  href: string;
}

export const LANDING_NAV_LINKS: LandingNavLink[] = [
  { key: "explore", defaultLabel: "Khám phá", href: "#albums" },
  { key: "community", defaultLabel: "Cộng đồng", href: "#cosplayers" },
  { key: "events", defaultLabel: "Sự kiện", href: "#events" },
  { key: "ranking", defaultLabel: "Bảng xếp hạng", href: "#ranking" },
];

export const HERO_STATS = [
  { value: "12K+", key: "cosplayers", defaultLabel: "Cosplayers" },
  { value: "85K+", key: "artworks", defaultLabel: "Tác phẩm" },
  { value: "500K+", key: "engagements", defaultLabel: "Lượt tương tác" },
];

export const HIGHLIGHT_FEATURES = [
  {
    id: "portfolio",
    defaultTitle: "Portfolio Chuyên Nghiệp",
    defaultDesc:
      "Đăng album chất lượng cao, chọn ảnh bìa tự do, tối đa 20 ảnh.",
    iconName: "folder" as const,
  },
  {
    id: "smart-search",
    defaultTitle: "Tìm Kiếm Thông Minh (Pixiv-style)",
    defaultDesc: "Bộ lọc tags cực mạnh theo fandom, waifu, phong cách.",
    iconName: "search" as const,
  },
  {
    id: "community",
    defaultTitle: "Kết Nối Cộng Đồng",
    defaultDesc:
      "Thả tim, bookmark, tương tác cùng IDOL và tham gia các sự kiện.",
    iconName: "users" as const,
  },
];

export const FOOTER_LINKS_COL_1 = [
  { key: "about", defaultLabel: "Về chúng tôi", href: "/pages/about" },
  { key: "features", defaultLabel: "Tính năng", href: "#features" },
  { key: "events", defaultLabel: "Sự kiện", href: "#events" },
];

export const FOOTER_LINKS_COL_2 = [
  {
    key: "privacy",
    defaultLabel: "Quy định & Bảo mật",
    href: "/pages/privacy",
  },
  { key: "contact", defaultLabel: "Liên hệ", href: "/pages/contact" },
  { key: "ranking", defaultLabel: "Bảng xếp hạng", href: "#ranking" },
];
