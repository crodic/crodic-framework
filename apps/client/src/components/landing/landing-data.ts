import {
  AlbumItem,
  FeaturedCosplayer,
  FeatureHighlightItem,
  FooterLinkItem,
  NavLinkItem,
  StatItem,
} from "./landing-types";

export const LANDING_NAV_LINKS: NavLinkItem[] = [
  { label: "Khám phá", href: "#albums" },
  { label: "Cộng đồng", href: "#cosplayers" },
  { label: "Sự kiện", href: "#events" },
  { label: "Bảng xếp hạng", href: "#ranking" },
];

export const HERO_STATS: StatItem[] = [
  { value: "12K+", label: "Cosplayers" },
  { value: "85K+", label: "Tác phẩm" },
  { value: "500K+", label: "Lượt tương tác" },
];

export const HIGHLIGHT_FEATURES: FeatureHighlightItem[] = [
  {
    id: "portfolio",
    title: "Portfolio Chuyên Nghiệp",
    description:
      "Đăng album chất lượng cao, chọn ảnh bìa tự do, tối đa 20 ảnh.",
    iconName: "folder",
  },
  {
    id: "smart-search",
    title: "Tìm Kiếm Thông Minh (Pixiv-style)",
    description: "Bộ lọc tags cực mạnh theo fandom, waifu, phong cách.",
    iconName: "search",
  },
  {
    id: "community",
    title: "Kết Nối Cộng Đồng",
    description:
      "Thả tim, bookmark, tương tác cùng IDOL và tham gia các sự kiện.",
    iconName: "users",
  },
];

export const FEATURED_COSPLAYERS: FeaturedCosplayer[] = [
  {
    id: "kiriko-1",
    name: "KIRIKO",
    avatarUrl: "/landing/avatar-kiriko.jpg",
    isVerified: true,
    followerCount: "50 followers",
    works: [
      {
        id: "k1-w1",
        imageUrl: "/landing/cosplay-work-1.jpg",
        title: "Kiriko Matsuri",
      },
      {
        id: "k1-w2",
        imageUrl: "/landing/cosplay-work-2.jpg",
        title: "Kiriko Cyber",
      },
      {
        id: "k1-w3",
        imageUrl: "/landing/cosplay-work-6.jpg",
        title: "Kiriko Blade",
      },
    ],
  },
  {
    id: "soriko-1",
    name: "Soriko",
    avatarUrl: "/landing/avatar-soriko.jpg",
    isVerified: true,
    followerCount: "50 followers",
    works: [
      {
        id: "s1-w1",
        imageUrl: "/landing/cosplay-work-3.jpg",
        title: "Soriko Garden",
      },
      {
        id: "s1-w2",
        imageUrl: "/landing/cosplay-work-4.jpg",
        title: "Soriko Knight",
      },
      {
        id: "s1-w3",
        imageUrl: "/landing/cosplay-work-5.jpg",
        title: "Soriko Kimono",
      },
    ],
  },
  {
    id: "kiriko-2",
    name: "KIRIKO",
    avatarUrl: "/landing/avatar-kiriko.jpg",
    isVerified: true,
    followerCount: "50 followers",
    works: [
      {
        id: "k2-w1",
        imageUrl: "/landing/cosplay-work-2.jpg",
        title: "Kiriko Cyber",
      },
      {
        id: "k2-w2",
        imageUrl: "/landing/cosplay-work-7.jpg",
        title: "Kiriko Street",
      },
      {
        id: "k2-w3",
        imageUrl: "/landing/cosplay-work-1.jpg",
        title: "Kiriko Matsuri",
      },
    ],
  },
  {
    id: "soriko-2",
    name: "Soriko",
    avatarUrl: "/landing/avatar-soriko.jpg",
    isVerified: true,
    followerCount: "50 followers",
    works: [
      {
        id: "s2-w1",
        imageUrl: "/landing/cosplay-work-5.jpg",
        title: "Soriko Kimono",
      },
      {
        id: "s2-w2",
        imageUrl: "/landing/cosplay-work-3.jpg",
        title: "Soriko Garden",
      },
      {
        id: "s2-w3",
        imageUrl: "/landing/cosplay-work-4.jpg",
        title: "Soriko Knight",
      },
    ],
  },
];

export const ALBUM_SHOWCASE: AlbumItem[] = [
  {
    id: "album-acheron",
    characterName: "Acheron",
    seriesName: "Honkai: Star Rail",
    avatarUrl: "/landing/avatar-acheron.jpg",
    coverUrl: "/landing/art-acheron.jpg",
    likesCount: "2.4K",
  },
  {
    id: "album-kafka",
    characterName: "Kafka",
    seriesName: "Honkai: Star Rail",
    avatarUrl: "/landing/avatar-kafka.jpg",
    coverUrl: "/landing/art-kafka.jpg",
    likesCount: "2.4K",
  },
  {
    id: "album-raiden-1",
    characterName: "Raiden Shogun",
    seriesName: "Genshin Impact",
    avatarUrl: "/landing/avatar-raiden.jpg",
    coverUrl: "/landing/art-raiden-1.jpg",
    likesCount: "2.4K",
  },
  {
    id: "album-raiden-2",
    characterName: "Raiden Shogun",
    seriesName: "Genshin Impact",
    avatarUrl: "/landing/avatar-raiden.jpg",
    coverUrl: "/landing/art-raiden-2.jpg",
    likesCount: "2.4K",
  },
];

export const FOOTER_LINKS_COL_1: FooterLinkItem[] = [
  { label: "Về chúng tôi", href: "/pages/about" },
  { label: "Tính năng", href: "#features" },
  { label: "Sự kiện", href: "#events" },
];

export const FOOTER_LINKS_COL_2: FooterLinkItem[] = [
  { label: "Quy định & Bảo mật", href: "/pages/privacy" },
  { label: "Liên hệ", href: "/pages/contact" },
  { label: "Bảng xếp hạng", href: "#ranking" },
];
