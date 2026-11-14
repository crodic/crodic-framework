import { PostDetail } from "./post-types";

export const DEFAULT_POST: PostDetail = {
  id: "acheron",
  slug: "acheron",
  title: "Acheron - Lôi Thần Khởi Nguyên",
  caption: "Một chút ảnh cosplay Acheron từ chuyến đi vừa rồi...",
  author: {
    name: "KIRIKO",
    handle: "@kiriko_cos",
    avatarUrl: "/landing/avatar-kiriko.jpg",
    isVerified: true,
  },
  photos: [
    "/landing/art-acheron.jpg",
    "/landing/art-raiden-1.jpg",
    "/landing/art-kafka.jpg",
    "/landing/cosplay-work-1.jpg",
    "/landing/cosplay-work-2.jpg",
    "/landing/cosplay-work-5.jpg",
  ],
  tags: ["Acheron", "HonkaiStarRail", "Cosplay"],
  likesCount: "3.4K",
  savesCount: "1.2K",
  sharesCount: "428",
  commentsCount: 37,
  comments: [
    {
      id: "c-1",
      authorName: "Comments",
      authorAvatar: "/landing/avatar-raiden.jpg",
      content: "Một tấm ảnh cosplay quá xuất sắc luôn bạn ơi!",
      createdAt: "2 giờ trước",
      likesCount: 37,
    },
    {
      id: "c-2",
      authorName: "Kiriko Anh",
      authorAvatar: "/landing/avatar-soriko.jpg",
      content:
        "Thần thái Acheron đỉnh cao thực sự, kiếm Lôi Thần làm tỉ mỉ ghê!",
      createdAt: "1 giờ trước",
      likesCount: 12,
    },
    {
      id: "c-3",
      authorName: "Minh Thu",
      authorAvatar: "/landing/avatar-kafka.jpg",
      content:
        "Ánh sáng tím cyberpunk tôn visual cực kỳ, cho xin profile studio nha!",
      createdAt: "30 phút trước",
      likesCount: 8,
    },
  ],
  createdAt: "2 ngày trước",
};

export const POST_ITEMS: Record<string, PostDetail> = {
  acheron: DEFAULT_POST,
  "work-acheron": DEFAULT_POST,
  "work-kafka": {
    id: "work-kafka",
    slug: "kafka",
    title: "Kafka - Hunter",
    caption:
      "Quyến rũ và bí ẩn trong từng góc máy. Photoset thợ săn Stellaron chuẩn bị công phu.",
    author: {
      name: "Soriko",
      handle: "@soriko_cos",
      avatarUrl: "/landing/avatar-soriko.jpg",
      isVerified: true,
    },
    photos: [
      "/landing/art-kafka.jpg",
      "/landing/art-acheron.jpg",
      "/landing/cosplay-work-3.jpg",
      "/landing/cosplay-work-7.jpg",
    ],
    tags: ["Kafka", "HonkaiStarRail", "Cosplay"],
    likesCount: "2.4K",
    savesCount: "890",
    sharesCount: "215",
    commentsCount: 19,
    comments: [
      {
        id: "c-k1",
        authorName: "Hoàng Long",
        authorAvatar: "/landing/avatar-kiriko.jpg",
        content: "Kính râm và áo măng tô chuẩn vibe Kafka mê hoặc!",
        createdAt: "3 giờ trước",
        likesCount: 15,
      },
    ],
    createdAt: "3 ngày trước",
  },
  "work-raiden": {
    id: "work-raiden",
    slug: "raiden-shogun",
    title: "Raiden Shogun",
    caption:
      "Ánh chớp vĩnh hằng giữa không gian Inazuma. Đạo cụ kiếm Lôi Thần tự tay chế tác.",
    author: {
      name: "KIRIKO",
      handle: "@kiriko_cos",
      avatarUrl: "/landing/avatar-kiriko.jpg",
      isVerified: true,
    },
    photos: [
      "/landing/art-raiden-1.jpg",
      "/landing/art-raiden-2.jpg",
      "/landing/cosplay-work-4.jpg",
      "/landing/cosplay-work-5.jpg",
    ],
    tags: ["RaidenShogun", "GenshinImpact", "Cosplay"],
    likesCount: "2.6K",
    savesCount: "950",
    sharesCount: "310",
    commentsCount: 24,
    comments: [
      {
        id: "c-r1",
        authorName: "An Nhiên",
        authorAvatar: "/landing/avatar-kafka.jpg",
        content: "Hiệu ứng lôi điện và thần thái quá giống trong game!",
        createdAt: "5 giờ trước",
        likesCount: 20,
      },
    ],
    createdAt: "4 ngày trước",
  },
};

export function getPostById(id: string): PostDetail {
  const normalizedId = id.toLowerCase();

  if (POST_ITEMS[normalizedId]) {
    return POST_ITEMS[normalizedId];
  }

  // Check by partial match or slug
  const found = Object.values(POST_ITEMS).find(
    (p) => p.slug === normalizedId || normalizedId.includes(p.slug)
  );

  if (found) {
    return found;
  }

  // Fallback default: Acheron post
  return DEFAULT_POST;
}
