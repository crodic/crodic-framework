import { EventFilterTag, EventItem, FeaturedFestival } from "./events-types";

export const FEATURED_FESTIVALS: FeaturedFestival[] = [
  {
    id: "fest-main-2026",
    title: "Vietnam Cosplay Festival 2026",
    city: "TP.HCM",
    date: "15/12/2026",
    description:
      "Đăng ký gian hàng/khách mời hợp tác với các nhãn hàng đón tiếp tiệm cận nhóm cosplayer/thần tượng.",
    bannerImage: "/landing/hero-banner.png",
    registrationCta: "Đăng ký gian hàng / Khách mời",
  },
  {
    id: "fest-winter-hanoi",
    title: "Winter Anime & Cosplay Matsuri",
    city: "Hà Nội",
    date: "20/12/2026",
    description:
      "Đại nhạc hội anime mùa đông, sàn diễn catwalk cosplay hoành tráng và chuyên nghiệp nhất miền Bắc.",
    bannerImage: "/landing/art-acheron.jpg",
    registrationCta: "Đăng ký biểu diễn sân khấu",
  },
  {
    id: "fest-crafting-market",
    title: "CosSpace Crafting & Artist Market",
    city: "TP.HCM",
    date: "28/12/2026",
    description:
      "Không gian giao lưu, mua sắm phụ kiện cosplay, đạo cụ handmade và art print độc quyền từ các creator hàng đầu.",
    bannerImage: "/landing/art-kafka.jpg",
    registrationCta: "Đăng ký gian hàng Artist",
  },
];

export const EVENT_FILTER_TAGS: EventFilterTag[] = [
  { id: "all", label: "#Tất cả" },
  { id: "upcoming", label: "#Sắp diễn ra" },
  { id: "recruiting", label: "#Đang mở tuyển Cosplayer" },
  { id: "hanoi", label: "#Hà Nội" },
  { id: "hcm", label: "#TP.HCM" },
  { id: "danang", label: "#Đà Nẵng" },
];

export const MOCK_EVENTS: EventItem[] = [
  {
    id: "ev-winter-2026",
    title: "Fes Mùa Đông 2026",
    day: "15",
    month: "Th12",
    dateString: "15/12/2026",
    location: "TP.HCM",
    venue: "SECC - Trung tâm Hội chợ & Triển lãm Sài Gòn, Q.7",
    image: "/landing/cosplay-work-1.jpg",
    tags: ["all", "upcoming", "recruiting", "hcm"],
    isRecruiting: true,
    participants: [
      {
        id: "p-1",
        name: "KIRIKO",
        avatarUrl: "/landing/avatar-kiriko.jpg",
        isVerified: true,
      },
      {
        id: "p-2",
        name: "Soriko",
        avatarUrl: "/landing/avatar-soriko.jpg",
        isVerified: true,
      },
      {
        id: "p-3",
        name: "Kafka",
        avatarUrl: "/landing/avatar-kafka.jpg",
        isVerified: true,
      },
    ],
    description:
      "Lễ hội mùa đông quy tụ hơn 500 cosplayer và hơn 50 gian hàng văn hóa phẩm anime/game, sân khấu biểu diễn âm nhạc và catwalk cosplay.",
    ticketPrice: "120.000 VNĐ",
    schedule: [
      { time: "08:30", activity: "Mở cửa đón khách & Check-in gian hàng" },
      {
        time: "10:00",
        activity: "Khai mạc sân khấu chính & Giao lưu Guest Cosplayer",
      },
      { time: "14:00", activity: "Vòng chung kết Cosplay Grand Contest" },
      { time: "17:00", activity: "Trao giải & Bế mạc" },
    ],
    categories: ["Festival", "Catwalk", "Gian hàng"],
  },
  {
    id: "ev-aoi-fest",
    title: "Aoi Cosplay Fest",
    day: "15",
    month: "Th12",
    dateString: "15/12/2026",
    location: "Hà Nội",
    venue: "Cung Điền Kinh Mỹ Đình, Nam Từ Liêm, Hà Nội",
    image: "/landing/cosplay-work-3.jpg",
    tags: ["all", "upcoming", "recruiting", "hanoi"],
    isRecruiting: true,
    participants: [
      {
        id: "p-4",
        name: "Soriko",
        avatarUrl: "/landing/avatar-soriko.jpg",
        isVerified: true,
      },
      {
        id: "p-5",
        name: "Hải Anh",
        avatarUrl: "/landing/avatar-acheron.jpg",
        isVerified: true,
      },
      {
        id: "p-6",
        name: "KIRIKO",
        avatarUrl: "/landing/avatar-kiriko.jpg",
        isVerified: true,
      },
    ],
    description:
      "Sự kiện cosplay chủ đề Aoi Winter với nhiều hoạt động chụp ảnh ngoại cảnh, photobooth ánh sáng studio và gian hàng phụ kiện độc đáo.",
    ticketPrice: "99.000 VNĐ",
    schedule: [
      { time: "09:00", activity: "Khai mạc & Check-in vé" },
      {
        time: "11:00",
        activity: "Mini game giao lưu cùng dàn cosplayer nổi tiếng",
      },
      {
        time: "14:30",
        activity: "Biểu diễn văn nghệ & Sàn diễn Cosplay Runway",
      },
    ],
    categories: ["Anime Fest", "Photobooth", "Giao lưu"],
  },
  {
    id: "ev-crafting-market",
    title: "Chợ Phiên Crafting",
    day: "15",
    month: "Th12",
    dateString: "15/12/2026",
    location: "Hà Nội",
    venue: "Khu Phố Cổ & Phố Đi Bộ Hoàn Kiếm, Hà Nội",
    image: "/landing/cosplay-work-2.jpg",
    tags: ["all", "upcoming", "hanoi"],
    isRecruiting: false,
    participants: [
      {
        id: "p-7",
        name: "Soriko",
        avatarUrl: "/landing/avatar-soriko.jpg",
        isVerified: true,
      },
      {
        id: "p-8",
        name: "Kafka",
        avatarUrl: "/landing/avatar-kafka.jpg",
        isVerified: true,
      },
      {
        id: "p-9",
        name: "KIRIKO",
        avatarUrl: "/landing/avatar-kiriko.jpg",
        isVerified: true,
      },
    ],
    description:
      "Phiên chợ chuyên về đạo cụ, phụ kiện cosplay, tóc giả, armor và vật liệu EVA foam chất lượng cao cho các cosplayer và prop maker.",
    ticketPrice: "Miễn phí vé vào cửa",
    schedule: [
      { time: "08:00", activity: "Mở cửa các gian hàng đạo cụ & handmade" },
      { time: "10:30", activity: "Workshop: Kỹ thuật tạo giáp bằng EVA foam" },
      {
        time: "15:00",
        activity: "Workshop: Phối màu sơn giả kim loại thực tế",
      },
    ],
    categories: ["Crafting", "Workshop", "Phụ kiện"],
  },
  {
    id: "ev-winter-fest-hcm-2",
    title: "Fes Mùa Đông 2026",
    day: "15",
    month: "TM2",
    dateString: "15/02/2027",
    location: "TP.HCM",
    venue: "Nhà Thi Đấu Quân Khu 7, Phú Nhuận, TP.HCM",
    image: "/landing/cosplay-work-5.jpg",
    tags: ["all", "upcoming", "recruiting", "hcm"],
    isRecruiting: true,
    participants: [
      {
        id: "p-10",
        name: "KIRIKO",
        avatarUrl: "/landing/avatar-kiriko.jpg",
        isVerified: true,
      },
      {
        id: "p-11",
        name: "Hải Anh",
        avatarUrl: "/landing/avatar-acheron.jpg",
        isVerified: true,
      },
      {
        id: "p-12",
        name: "Soriko",
        avatarUrl: "/landing/avatar-soriko.jpg",
        isVerified: true,
      },
    ],
    description:
      "Sự kiện mùa xuân đầu năm dành cho cộng đồng yêu thích hóa thân nhân vật và game gacha (Honkai, Genshin, Fate, Frieren).",
    ticketPrice: "150.000 VNĐ",
    schedule: [
      { time: "09:00", activity: "Mở hội đầu xuân & Bốc thăm may mắn" },
      { time: "14:00", activity: "Cuộc thi hóa thân Best Coser 2027" },
    ],
    categories: ["Festival", "Gacha Game", "Cuộc thi"],
  },
  {
    id: "ev-danang-summer",
    title: "Danang Anime Expo",
    day: "22",
    month: "Th06",
    dateString: "22/06/2027",
    location: "Đà Nẵng",
    venue: "Cung Thể Thao Tiên Sơn, Hải Châu, Đà Nẵng",
    image: "/landing/cosplay-work-4.jpg",
    tags: ["all", "upcoming", "danang"],
    isRecruiting: true,
    participants: [
      {
        id: "p-13",
        name: "Kafka",
        avatarUrl: "/landing/avatar-kafka.jpg",
        isVerified: true,
      },
      {
        id: "p-14",
        name: "KIRIKO",
        avatarUrl: "/landing/avatar-kiriko.jpg",
        isVerified: true,
      },
    ],
    description:
      "Lễ hội mùa hè bên bờ biển miền Trung với các sân khấu biểu diễn vũ đạo và cosplay chuyên nghiệp.",
    ticketPrice: "80.000 VNĐ",
    schedule: [
      { time: "09:00", activity: "Khai mạc Expo miền Trung" },
      { time: "15:00", activity: "Chung kết biểu diễn nhóm" },
    ],
    categories: ["Expo", "Biểu diễn", "Đà Nẵng"],
  },
  {
    id: "ev-manga-comic-con",
    title: "Manga Comic Con VN",
    day: "28",
    month: "Th08",
    dateString: "28/08/2027",
    location: "TP.HCM",
    venue: "Trung tâm Hội chợ SECC, Q.7, TP.HCM",
    image: "/landing/cosplay-work-6.jpg",
    tags: ["all", "upcoming", "recruiting", "hcm"],
    isRecruiting: true,
    participants: [
      {
        id: "p-15",
        name: "Soriko",
        avatarUrl: "/landing/avatar-soriko.jpg",
        isVerified: true,
      },
      {
        id: "p-16",
        name: "KIRIKO",
        avatarUrl: "/landing/avatar-kiriko.jpg",
        isVerified: true,
      },
      {
        id: "p-17",
        name: "Hải Anh",
        avatarUrl: "/landing/avatar-acheron.jpg",
        isVerified: true,
      },
    ],
    description:
      "Đại hội văn hóa đại chúng quy mô quốc tế với sự tham gia của dàn khách mời cosplay hàng đầu châu Á và các nhà phát hành game.",
    ticketPrice: "200.000 VNĐ",
    schedule: [
      { time: "08:30", activity: "Đón khách VIP & vé phổ thông" },
      { time: "13:30", activity: "Giao lưu chữ ký cùng Guest Quốc tế" },
      { time: "16:00", activity: "Cosplay World Championship Qualifier" },
    ],
    categories: ["Comic Con", "Quốc tế", "Grand Contest"],
  },
];
