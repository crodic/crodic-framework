import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { fetchActiveClientWhiteLabel } from "@/lib/white-label";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

interface OnboardingPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: OnboardingPageProps): Promise<Metadata> {
  const { locale } = await params;
  const whiteLabel = await fetchActiveClientWhiteLabel();
  const siteName = whiteLabel?.brandName || "Kosume";
  const t = await getTranslations({ locale, namespace: "Onboarding" });

  return {
    title: `${t("pageTitle")} | ${siteName}`,
    description: t("pageDesc"),
  };
}

export default async function OnboardingPage({ params }: OnboardingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <OnboardingWizard />;
}
