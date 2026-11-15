import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { fetchActiveClientWhiteLabel } from "@/lib/white-label";
import Layout from "@/components/layouts/layout";
import { EventStandaloneView } from "@/components/events/event-standalone-view";
import { getEventById } from "@/components/events/events-data";

interface EventPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const whiteLabel = await fetchActiveClientWhiteLabel();
  const siteName = whiteLabel?.brandName || "Kosume";

  const event = getEventById(id);
  const title = `${event.title} - Sự kiện Cosplay | ${siteName}`;
  const description = `${event.description} Diễn ra ngày ${event.dateString} tại ${event.venue}, ${event.location}.`;

  const canonicalUrl = `${baseUrl}/${locale}/events/${id}`;
  const languages = Object.fromEntries(
    routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/events/${id}`])
  );

  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName,
      type: "article",
      images: [
        {
          url: event.image || "/landing/hero-banner.png",
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [event.image || "/landing/hero-banner.png"],
    },
  };
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const event = getEventById(id);

  return (
    <Layout>
      <EventStandaloneView event={event} />
    </Layout>
  );
}
