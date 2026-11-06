import { Footer } from "@/components/layouts/footer";
import { Header } from "@/components/layouts/header";
import { Skeleton } from "@/components/ui/skeleton";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { ProfileHeader } from "./components/profile-header";
import { ProfileView } from "./components/profile-view";

interface ProfilePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Profile" });

  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

function ProfileLoadingFallback() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      <ProfileHeader profile={undefined} isLoading={true} />
      <div className="space-y-4">
        <Skeleton className="h-10 w-72 rounded-lg" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="bg-muted/20 flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1 py-6 sm:py-10">
        <Suspense fallback={<ProfileLoadingFallback />}>
          <ProfileView />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
