import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { fetchActiveClientWhiteLabel } from "@/lib/white-label";
import Layout from "@/components/layouts/layout";
import { SettingsView } from "@/components/settings/settings-view";

interface SettingsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: SettingsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const whiteLabel = await fetchActiveClientWhiteLabel();
  const siteName = whiteLabel?.brandName || "CosSpace";

  const title = `Cài đặt & Thiết lập tài khoản | ${siteName}`;
  const description =
    "Quản lý bảo mật tài khoản, thông báo, giao diện sáng tối và quyền riêng tư trên CosSpace.";

  return {
    title: {
      absolute: title,
    },
    description,
  };
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Layout>
      <div className="mx-auto max-w-[1440px] p-3.5 sm:p-6 lg:p-8">
        <SettingsView />
      </div>
    </Layout>
  );
}
