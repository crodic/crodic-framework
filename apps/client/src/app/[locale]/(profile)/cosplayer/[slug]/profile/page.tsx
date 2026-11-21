import { redirect } from "@/i18n/navigation";

interface CosplayerProfileAliasProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function CosplayerProfileAliasPage({
  params,
}: CosplayerProfileAliasProps) {
  const { slug } = await params;
  // Seamless redirect to canonical SEO route /cosplayer/[slug]
  redirect({ href: `/cosplayer/${slug}`, locale: (await params).locale });
}
