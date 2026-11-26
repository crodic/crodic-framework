import { getTranslations } from "next-intl/server";
import RestoreForm from "./restore-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "Auth.restore",
  });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function Page() {
  return <RestoreForm />;
}
