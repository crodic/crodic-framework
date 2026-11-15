import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { fetchActiveClientWhiteLabel } from "@/lib/white-label";
import Layout from "@/components/layouts/layout";
import { CosplayerProfileView } from "@/components/cosplayer-profile/cosplayer-profile-view";
import {
  CURRENT_USER_PROFILE,
  KIRIKO_ALBUMS,
  KIRIKO_CHARACTERS,
  MOCK_FOLLOWED_COSPLAYERS,
  MOCK_LIKED_WORKS,
  MOCK_SAVED_COLLECTIONS,
} from "@/components/cosplayer-profile/profile-data";

interface ProfilePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const whiteLabel = await fetchActiveClientWhiteLabel();
  const siteName = whiteLabel?.brandName || "Kosume";

  const title = `Hồ sơ của tôi (${CURRENT_USER_PROFILE.name}) | ${siteName}`;
  const description =
    "Quản lý hồ sơ cá nhân, các cosplayer đang theo dõi và bộ sưu tập ảnh đã lưu trên Kosume.";

  return {
    title: {
      absolute: title,
    },
    description,
  };
}

export default async function MyProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Layout>
      <div className="mx-auto max-w-[1440px] p-3.5 sm:p-6 lg:p-8">
        <CosplayerProfileView
          initialProfile={CURRENT_USER_PROFILE}
          initialAlbums={KIRIKO_ALBUMS}
          initialCharacters={KIRIKO_CHARACTERS}
          initialFollowed={MOCK_FOLLOWED_COSPLAYERS}
          initialLikedWorks={MOCK_LIKED_WORKS}
          initialCollections={MOCK_SAVED_COLLECTIONS}
          isOwner={true}
        />
      </div>
    </Layout>
  );
}
