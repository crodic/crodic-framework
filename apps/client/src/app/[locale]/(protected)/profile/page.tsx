import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { fetchActiveClientWhiteLabel } from "@/lib/white-label";
import Layout from "@/components/layouts/layout";
import { MyProfileContainer } from "@/components/cosplayer-profile/my-profile-container";

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
      absolute: `Profile | ${siteName}`,
    },
    description:
      "Manage personal profile, collections, and followed cosplayers on Kosume.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function MyProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Layout>
      <div className="mx-auto max-w-[1440px] p-3.5 sm:p-6 lg:p-8">
        <MyProfileContainer />
      </div>
    </Layout>
  );
}
