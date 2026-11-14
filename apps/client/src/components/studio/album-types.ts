import { ExistingImage } from "@/components/form/types";

export interface CreateAlbumFormState {
  title: string;
  character: string;
  fandom: string;
  tags: string[];
  description: string;
  isPublic: boolean;
  enableWatermark: boolean;
  coverIndex: number;
}

export const INITIAL_MOCK_ALBUM_IMAGES: ExistingImage[] = [
  {
    id: "img-1",
    src: "/landing/art-acheron.jpg",
    alt: "Acheron Main Portrait",
  },
  { id: "img-2", src: "/landing/avatar-acheron.jpg", alt: "Acheron Close-up" },
  {
    id: "img-3",
    src: "/landing/cosplay-work-1.jpg",
    alt: "Acheron Combat Pose",
  },
  {
    id: "img-4",
    src: "/landing/cosplay-work-2.jpg",
    alt: "Acheron Cyberpunk Rain",
  },
  {
    id: "img-5",
    src: "/landing/cosplay-work-3.jpg",
    alt: "Acheron Neon Light",
  },
  {
    id: "img-6",
    src: "/landing/cosplay-work-4.jpg",
    alt: "Acheron Katana Stance",
  },
  {
    id: "img-7",
    src: "/landing/cosplay-work-5.jpg",
    alt: "Acheron Crimson Blade",
  },
  {
    id: "img-8",
    src: "/landing/cosplay-work-6.jpg",
    alt: "Acheron Full Outfit",
  },
  {
    id: "img-9",
    src: "/landing/cosplay-work-7.jpg",
    alt: "Acheron Outdoor Shot",
  },
  {
    id: "img-10",
    src: "/landing/art-raiden-1.jpg",
    alt: "Acheron Thunder Burst",
  },
  {
    id: "img-11",
    src: "/landing/art-raiden-2.jpg",
    alt: "Acheron Nihility Realm",
  },
  { id: "img-12", src: "/landing/art-kafka.jpg", alt: "Acheron & Kafka Duet" },
];

export const INITIAL_ALBUM_FORM_STATE: CreateAlbumFormState = {
  title: "Acheron - Lôi Thần Khởi Nguyên",
  character: "Acheron",
  fandom: "Honkai: Star Rail",
  tags: ["Acheron", "HonkaiStarRail", "Cosplay"],
  description:
    "Một chút ảnh cosplay Acheron từ chuyến đi vừa rồi... Bộ ảnh được thực hiện với sự hỗ trợ của team ánh sáng cyberpunk.",
  isPublic: true,
  enableWatermark: false,
  coverIndex: 0,
};
