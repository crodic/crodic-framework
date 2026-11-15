export interface SpotlightCosplayer {
  name: string;
  isVerified: boolean;
  tagline: string;
  badge: string;
  bannerImage: string;
  portfolioHref: string;
  bookingHref: string;
}

export interface ShowcaseWork {
  id: string;
  title: string;
  categoryBadge?: string;
  coverImage: string;
  likesCount: string;
  author: {
    name: string;
    avatarUrl: string;
    isVerified: boolean;
    role: string;
  };
  projectHref: string;
  bookingHref: string;
}

export interface BookingCosplayer {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  isVerified?: boolean;
}

export interface RecruitmentProject {
  id: string;
  title: string;
  organization: string;
  description: string;
  thumbnail: string;
}

export interface SidebarNavGroup {
  title: string;
  items: {
    label: string;
    href: string;
    icon: string;
    badge?: string;
    isActive?: boolean;
    requireAuth?: boolean;
  }[];
}
