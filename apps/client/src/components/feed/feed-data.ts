import {
  FeedAuthor,
  FeedPost,
  SuggestedCosplayer,
  UpcomingEvent,
  TrendingTag,
} from "./feed-types";

export const CURRENT_USER: FeedAuthor = {
  id: "current-user",
  name: "Hải Anh",
  handle: "@haianh_fan",
  avatarUrl: "/landing/avatar-acheron.jpg",
  isVerified: false,
  roleBadge: "Thành viên (Fan)",
};

export const MOCK_FEED_POSTS: FeedPost[] = [
  {
    id: "post-acheron-1",
    author: {
      id: "kiriko",
      name: "KIRIKO",
      handle: "@kiriko_cos",
      avatarUrl: "/landing/avatar-kiriko.jpg",
      isVerified: true,
      roleBadge: "Cosplayer Tiêu Điểm",
    },
    createdAt: "2 giờ trước",
    caption:
      "Bộ ảnh Acheron đã hoàn thiện rồi mọi người ơi... 💜 Cảm ơn toàn bộ ekip photo và studio đã tạo nên những shoot hình cyberpunk ánh tím huyền ảo này!\n\nDự án này bọn mình đã lên kế hoạch và chuẩn bị phục trang ròng rã suốt 2 tháng trời, từ việc đặt may trang phục katana Lôi kiếm tỉ mỉ đến từng chi tiết hoa văn cổ áo, cho tới việc setup hệ thống đèn led khói neon trong studio đêm. Hy vọng mọi người sẽ yêu thích bộ ảnh này và để lại feedback nha! Sắp tới mình sẽ tiếp tục ra mắt thêm bộ ảnh Kafka và Black Swan nữa, đón chờ nhé!",
    images: [
      "/landing/art-acheron.jpg",
      "/landing/cosplay-work-1.jpg",
      "/landing/cosplay-work-3.jpg",
      "/landing/art-raiden-1.jpg",
      "/landing/art-raiden-2.jpg",
    ],
    tags: [
      "Acheron",
      "HonkaiStarRail",
      "GenshinImpact",
      "Cosplay",
      "Cyberpunk",
    ],
    likesCount: 342,
    isLiked: false,
    commentsCount: 38,
    isBookmarked: false,
    sharesCount: 19,
    recentComments: [
      {
        id: "c-1",
        author: {
          id: "fan-1",
          name: "Hải Anh",
          handle: "@haianh_fan",
          avatarUrl: "/landing/avatar-acheron.jpg",
          isVerified: false,
        },
        content:
          "Một tấm ảnh cosplay quá xuất sắc luôn bạn ơi! Thần thái Acheron đỉnh cao thực sự 💖",
        createdAt: "1 giờ trước",
        likesCount: 5,
      },
      {
        id: "c-2",
        author: {
          id: "soriko",
          name: "Soriko",
          handle: "@sorikocos",
          avatarUrl: "/landing/avatar-soriko.jpg",
          isVerified: true,
        },
        content:
          "Ánh sáng tím cyberpunk tôn visual cực kỳ, cho xin profile studio nha chị! 🔥",
        createdAt: "30 phút trước",
        likesCount: 2,
      },
      {
        id: "c-3",
        author: {
          id: "kafka",
          name: "Kafka Hunter",
          handle: "@kafka_cos",
          avatarUrl: "/landing/avatar-kafka.jpg",
          isVerified: true,
        },
        content: "Kiếm hoa văn đẹp xuất sắc luôn Kiriko ơiii!",
        createdAt: "15 phút trước",
        likesCount: 3,
      },
    ],
  },
  {
    id: "post-soriko-wip",
    author: {
      id: "soriko",
      name: "Soriko",
      handle: "@sorikocos",
      avatarUrl: "/landing/avatar-soriko.jpg",
      isVerified: true,
      roleBadge: "Prop Maker & Model",
    },
    createdAt: "5 giờ trước",
    caption:
      "Cập nhật WIP (Work in progress) chế tạo đạo cụ kiếm Lôi Thần và găng tay giáp. Mài dũa EVA foam và sơn bóng ánh kim loại 3 lớp. Hẹn gặp mọi người tại fes tuần này!",
    images: ["/landing/cosplay-work-2.jpg", "/landing/cosplay-work-6.jpg"],
    tags: ["WIP", "Crafting", "CosplayProp", "FestivalPrep"],
    likesCount: 189,
    isLiked: true,
    commentsCount: 15,
    isBookmarked: true,
    sharesCount: 7,
    recentComments: [
      {
        id: "c-3",
        author: {
          id: "kiriko",
          name: "KIRIKO",
          handle: "@kiriko_cos",
          avatarUrl: "/landing/avatar-kiriko.jpg",
          isVerified: true,
        },
        content: "Kiếm làm tỉ mỉ ghê, nhìn chất kim loại siêu thật luôn em ơi!",
        createdAt: "4 giờ trước",
        likesCount: 8,
      },
    ],
  },
  {
    id: "post-kafka-hunter",
    author: {
      id: "kafka",
      name: "Kafka Hunter",
      handle: "@kafka_cos",
      avatarUrl: "/landing/avatar-kafka.jpg",
      isVerified: true,
      roleBadge: "Thợ săn Stellaron",
    },
    createdAt: "1 ngày trước",
    caption:
      "Boom! 🕸️ Sát thủ thợ săn Stellaron đã có mặt tại phố đêm. Concept mưa nhân tạo kết hợp đèn neon tím hồng huyền bí.",
    images: [
      "/landing/art-kafka.jpg",
      "/landing/cosplay-work-4.jpg",
      "/landing/cosplay-work-7.jpg",
    ],
    tags: ["Kafka", "HonkaiStarRail", "StellaronHunter", "NightPhotoshoot"],
    likesCount: 520,
    isLiked: false,
    commentsCount: 47,
    isBookmarked: false,
    sharesCount: 28,
    recentComments: [
      {
        id: "c-4",
        author: {
          id: "fan-2",
          name: "Minh Thư",
          handle: "@minhthu_anime",
          avatarUrl: "/landing/avatar-raiden.jpg",
          isVerified: false,
        },
        content:
          "Mẹ Kafka quyến rũ chết người! Trang phục ôm dáng chuẩn không cần chỉnh.",
        createdAt: "18 giờ trước",
        likesCount: 12,
      },
    ],
  },
];

export const MOCK_SUGGESTED_COSPLAYERS: SuggestedCosplayer[] = [
  {
    id: "sug-1",
    name: "Những cosplayer",
    handle: "@cosplayer",
    avatarUrl: "/landing/avatar-kiriko.jpg",
    isVerified: true,
    followerCount: "28.4K",
    isFollowing: false,
  },
  {
    id: "sug-2",
    name: "Những cosplayer",
    handle: "@cosplayer",
    avatarUrl: "/landing/avatar-soriko.jpg",
    isVerified: true,
    followerCount: "19.5K",
    isFollowing: false,
  },
  {
    id: "sug-3",
    name: "Naroimotot",
    handle: "@cocoplayer",
    avatarUrl: "/landing/cosplay-work-6.jpg",
    isVerified: true,
    followerCount: "42.1K",
    isFollowing: false,
  },
  {
    id: "sug-4",
    name: "Hải Anh",
    handle: "@cocsspace",
    avatarUrl: "/landing/avatar-acheron.jpg",
    isVerified: true,
    badge: "Thành viên",
    followerCount: "2.4K",
    isFollowing: false,
  },
];

export const MOCK_UPCOMING_EVENTS: UpcomingEvent[] = [
  {
    id: "ev-1",
    title: "Festival",
    badge: "FESTIVAL",
    badgeColor: "from-purple-600 to-indigo-600",
    dateTime: "Ngày giờ – 19:00",
    location: "Trọn gói, Địa điểm",
    thumbnailUrl: "/landing/cosplay-work-1.jpg",
    isInterested: false,
  },
  {
    id: "ev-2",
    title: "Cosplay Contest",
    badge: "COSPLAY CONTEST",
    badgeColor: "from-pink-600 to-rose-600",
    dateTime: "Ngày – 20:00",
    location: "Trọn gói, Địa điểm",
    thumbnailUrl: "/landing/cosplay-work-5.jpg",
    isInterested: false,
  },
];

export const MOCK_TRENDING_TAGS: TrendingTag[] = [
  { name: "Acheron", count: "12.4K", isHot: true },
  { name: "Genshinimpact", count: "28.7K", isHot: true },
  { name: "Sự kiện Cosplay", count: "8.6K", isHot: false },
  { name: "HonkaiStarRail", count: "19.2K", isHot: true },
  { name: "Festival", count: "14.1K", isHot: false },
  { name: "WIP Crafting", count: "5.3K", isHot: false },
];
