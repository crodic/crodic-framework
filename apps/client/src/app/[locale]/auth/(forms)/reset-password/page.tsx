import { getTranslations } from "next-intl/server";
import ResetPasswordForm from "./reset-password-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "Auth.resetPassword",
  });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function Page() {
  return <ResetPasswordForm />;
}
