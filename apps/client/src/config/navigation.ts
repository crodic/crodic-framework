export interface NavItem {
  labelKey: string;
  defaultLabel: string;
  href: string;
  icon: string;
  requireAuth?: boolean;
}

export interface NavGroup {
  titleKey: string;
  defaultTitle: string;
  items: NavItem[];
}

export const APP_SIDEBAR_NAV: NavGroup[] = [
  {
    titleKey: "exploreGroup",
    defaultTitle: "Khám phá",
    items: [
      {
        labelKey: "home",
        defaultLabel: "Trang chủ",
        href: "/",
        icon: "home",
      },
      {
        labelKey: "feed",
        defaultLabel: "Bảng tin",
        href: "/feed",
        icon: "users",
        requireAuth: true,
      },
      {
        labelKey: "explore",
        defaultLabel: "Khám phá",
        href: "/explore",
        icon: "compass",
      },
      {
        labelKey: "ranking",
        defaultLabel: "Bảng xếp hạng",
        href: "/ranking",
        icon: "trophy",
      },
      {
        labelKey: "events",
        defaultLabel: "Sự kiện & Festival",
        href: "/events",
        icon: "calendar",
      },
      {
        labelKey: "tags",
        defaultLabel: "Từ điển & Tags",
        href: "/tags",
        icon: "book-open",
      },
    ],
  },
  {
    titleKey: "personalGroup",
    defaultTitle: "Cá nhân",
    items: [
      {
        labelKey: "profile",
        defaultLabel: "Hồ sơ của tôi",
        href: "/profile",
        icon: "user-circle",
        requireAuth: true,
      },
      {
        labelKey: "settings",
        defaultLabel: "Cài đặt",
        href: "/settings",
        icon: "settings",
        requireAuth: true,
      },
    ],
  },
];
