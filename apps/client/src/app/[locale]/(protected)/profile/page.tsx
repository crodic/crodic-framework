import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { fetchActiveClientWhiteLabel } from "@/lib/white-label";
import Layout from "@/components/layouts/layout";
import { CosplayerProfileView } from "@/components/cosplayer-profile/cosplayer-profile-view";
import type { CosplayerDetailResDto } from "@/services/cosplayer";

interface ProfilePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { locale } = await params;
  const whiteLabel = await fetchActiveClientWhiteLabel();
  const siteName = whiteLabel?.brandName || "Kosume";

  return {
    title: {
      absolute: `Hồ sơ của tôi | ${siteName}`,
    },
    description:
      "Quản lý hồ sơ cá nhân, các cosplayer đang theo dõi và bộ sưu tập ảnh đã lưu trên Kosume.",
  };
}

const DEFAULT_MY_PROFILE: CosplayerDetailResDto = {
  id: "my-profile",
  userId: "user-me",
  slug: "me",
  displayName: "Cá nhân",
  handle: "@me",
  locationLabel: "TP. Hồ Chí Minh",
  isVerified: true,
  roleBadge: "Creator",
  avatarUrl: "/landing/avatar-kiriko.jpg",
  coverUrl: "/landing/hero-banner.png",
  bio: "Cosplayer & Content Creator trên Kosume Platform.",
  isCraftingCreator: false,
  followersCount: 0,
  totalLikesCount: 0,
  albumsCount: 0,
  charactersCount: 0,
  rankingScore: 0,
  specialties: ["Anime", "Game"],
  skills: ["Cosplay", "Chế tác props"],
  awardsBadges: [],
  followingCount: 0,
  collectionsCount: 0,
  heightLabel: "165cm",
  experienceLabel: "2 năm kinh nghiệm",
  contactEmail: "me@kosume.com",
  characters: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default async function MyProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Layout>
      <div className="mx-auto max-w-[1440px] p-3.5 sm:p-6 lg:p-8">
        <CosplayerProfileView
          initialProfile={DEFAULT_MY_PROFILE}
          initialAlbums={[]}
          initialCharacters={[]}
          initialFollowed={[]}
          initialLikedWorks={[]}
          initialCollections={[]}
          isOwner={true}
        />
      </div>
    </Layout>
  );
}
