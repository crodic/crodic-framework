import {
  BookingCosplayer,
  RecruitmentProject,
  ShowcaseWork,
  SidebarNavGroup,
  SpotlightCosplayer,
} from "./home-types";

export const HOME_SPOTLIGHT: SpotlightCosplayer = {
  name: "KIRIKO",
  isVerified: true,
  badge: "Cosplayer Tiêu Điểm Tuần Này",
  tagline: "Vinh danh thành thương hiệu chuyên nghiệp",
  bannerImage: "/landing/hero-banner.png",
  portfolioHref: "/cosplayer/kiriko",
  bookingHref: "#booking",
};

export const HOME_SPOTLIGHT_SLIDES: SpotlightCosplayer[] = [
  HOME_SPOTLIGHT,
  {
    name: "ACHERON",
    isVerified: true,
    badge: "Cosplayer Nổi Bật Tháng Này",
    tagline: "Khởi nguyên lôi thần - Thần thái và phục trang đỉnh cao",
    bannerImage: "/landing/art-acheron.jpg",
    portfolioHref: "/cosplayer/kiriko",
    bookingHref: "#booking-acheron",
  },
  {
    name: "KAFKA",
    isVerified: true,
    badge: "Siêu Phẩm Hóa Thân 2026",
    tagline: "Sát thủ thợ săn Stellaron - Quyến rũ và bí ẩn",
    bannerImage: "/landing/art-kafka.jpg",
    portfolioHref: "/cosplayer/kiriko",
    bookingHref: "#booking-kafka",
  },
];

export const HOME_FEATURED_WORKS: ShowcaseWork[] = [
  {
    id: "work-acheron",
    title: "Acheron - Lôi Thần Khởi Nguyên",
    categoryBadge: "Photoset",
    coverImage: "/landing/art-acheron.jpg",
    likesCount: "3.4K",
    author: {
      name: "KIRIKO",
      avatarUrl: "/landing/avatar-kiriko.jpg",
      isVerified: true,
      role: "Model, Crafting",
    },
    projectHref: "#work-acheron",
    bookingHref: "#booking-kiriko",
  },
  {
    id: "work-kafka",
    title: "Kafka - Hunter",
    coverImage: "/landing/art-kafka.jpg",
    likesCount: "2.4K",
    author: {
      name: "Soriko",
      avatarUrl: "/landing/avatar-soriko.jpg",
      isVerified: true,
      role: "Model, Costume",
    },
    projectHref: "#work-kafka",
    bookingHref: "#booking-soriko",
  },
  {
    id: "work-raiden",
    title: "Raiden Shogun",
    coverImage: "/landing/art-raiden-1.jpg",
    likesCount: "2.6K",
    author: {
      name: "KIRIKO",
      avatarUrl: "/landing/avatar-kiriko.jpg",
      isVerified: true,
      role: "Model, Crafting",
    },
    projectHref: "#work-raiden",
    bookingHref: "#booking-kiriko",
  },
];

export const HOME_BOOKING_COSPLAYERS: BookingCosplayer[] = [
  {
    id: "b-kiriko",
    name: "KIRIKO",
    role: "Model",
    avatarUrl: "/landing/avatar-kiriko.jpg",
    isVerified: true,
  },
  {
    id: "b-namema",
    name: "Namema",
    role: "Model, Crafting",
    avatarUrl: "/landing/avatar-soriko.jpg",
    isVerified: true,
  },
  {
    id: "b-nguyenstam",
    name: "Nguyen Stam",
    role: "Model, Craft",
    avatarUrl: "/landing/cosplay-work-3.jpg",
  },
  {
    id: "b-haiweni",
    name: "Hai Weni",
    role: "Model, Crafting",
    avatarUrl: "/landing/cosplay-work-5.jpg",
  },
  {
    id: "b-haianh",
    name: "Hải Anh",
    role: "Model",
    avatarUrl: "/landing/avatar-acheron.jpg",
  },
];

export const HOME_RECRUITMENT_PROJECTS: RecruitmentProject[] = [
  {
    id: "rec-1",
    title: "Dự án đang chờ WIP",
    organization: "CosSpace",
    description: "Portfolio mới hoàn thiện with h...",
    thumbnail: "/landing/cosplay-work-1.jpg",
  },
  {
    id: "rec-2",
    title: "Dự án đang tuyển mẫu/craft 🛠️",
    organization: "CosSpace",
    description: "Invitation hoành tráng dành ch...",
    thumbnail: "/landing/cosplay-work-2.jpg",
  },
  {
    id: "rec-3",
    title: "Cosplayer/xniirhao",
    organization: "CosSpace",
    description: "Frontlink giao hưởng chân...",
    thumbnail: "/landing/cosplay-work-6.jpg",
  },
  {
    id: "rec-4",
    title: "Dự án đang tuyển mẫu/craft 🛠️",
    organization: "CosSpace",
    description: "Invitation cosplay hoành tráng...",
    thumbnail: "/landing/cosplay-work-7.jpg",
  },
  {
    id: "rec-5",
    title: "Chờ đang tuyển mẫu/craft",
    organization: "CosSpace",
    description: "Tuyển chọn cosplayer biểu diễn...",
    thumbnail: "/landing/cosplay-work-4.jpg",
  },
];

export const APP_SIDEBAR_NAV: SidebarNavGroup[] = [
  {
    title: "Khám phá",
    items: [
      { label: "Trang chủ", href: "/", icon: "home" },
      {
        label: "Bản tin Booking / Tuyển dụng",
        href: "/jobs",
        icon: "newspaper",
      },
      { label: "Bảng tin", href: "/feed", icon: "users" },
      { label: "Khám phá", href: "/explore", icon: "compass" },
      { label: "Bảng xếp hạng", href: "/ranking", icon: "trophy" },
      { label: "Sự kiện & Festival", href: "/events", icon: "calendar" },
    ],
  },
  {
    title: "Cá nhân",
    items: [
      { label: "Hồ sơ của tôi", href: "/profile", icon: "user-circle" },
      { label: "Cài đặt & Studio", href: "/settings", icon: "settings" },
    ],
  },
];
