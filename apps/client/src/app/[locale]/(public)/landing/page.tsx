import React from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroBanner } from "@/components/landing/hero-banner";
import { FeaturesHighlight } from "@/components/landing/features-highlight";
import { CosplayerShowcase } from "@/components/landing/cosplayer-showcase";
import { AlbumShowcase } from "@/components/landing/album-showcase";
import { CtaBanner } from "@/components/landing/cta-banner";
import { LandingFooter } from "@/components/landing/landing-footer";

interface LandingPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: LandingPageProps): Promise<Metadata> {
  const { locale: _locale } = await params;

  return {
    title: "CosSpace - Nơi Đam Mê Cosplay Tỏa Sáng",
    description:
      "Nền tảng mạng xã hội và Portfolio chất lượng cao, nơi các cosplayer chuyên nghiệp phô diễn tác phẩm và fan dễ dàng tìm kiếm waifu/fandom yêu thích.",
    openGraph: {
      title: "CosSpace - Nơi Đam Mê Cosplay Tỏa Sáng",
      description:
        "Nền tảng mạng xã hội và Portfolio chất lượng cao dành cho cộng đồng Cosplayer và Fandom.",
      type: "website",
      images: [
        {
          url: "/landing/hero-banner.png",
          width: 1200,
          height: 630,
          alt: "CosSpace Cosplay Showcase",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "CosSpace - Nơi Đam Mê Cosplay Tỏa Sáng",
      description:
        "Nền tảng mạng xã hội và Portfolio chất lượng cao, nơi các cosplayer chuyên nghiệp phô diễn tác phẩm.",
      images: ["/landing/hero-banner.png"],
    },
  };
}

export default async function LandingPage({ params }: LandingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground flex min-h-screen flex-col">
      <LandingNavbar />
      <main className="flex-1">
        <HeroBanner />
        <FeaturesHighlight />
        <CosplayerShowcase />
        <AlbumShowcase />
        <CtaBanner />
      </main>
      <LandingFooter />
    </div>
  );
}
