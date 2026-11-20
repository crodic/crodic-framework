import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { fetchActiveClientWhiteLabel } from "@/lib/white-label";
import Layout from "@/components/layouts/layout";
import { EventStandaloneView } from "@/components/events/event-standalone-view";
import { getEventBySlug } from "@/services/events";

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
  const t = await getTranslations({ locale, namespace: "Events" });

  try {
    const event = await getEventBySlug(id);
    const title = `${event.title} - ${t("eventMetaSuffix")} | ${siteName}`;
    const description = t("eventMetaDesc", {
      desc: event.description || event.title,
      date: event.dateString,
      venue: event.venue,
      location: event.locationLabel,
    });

    const canonicalUrl = `${baseUrl}/${locale}/events/${id}`;
    const languages = Object.fromEntries(
      routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/events/${id}`])
    );

    const imageUrl = event.bannerImageUrl || event.imageUrl;

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
        images: imageUrl
          ? [
              {
                url: imageUrl,
                width: 1200,
                height: 630,
                alt: event.title,
              },
            ]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch {
    return {
      title: `Sự kiện Cosplay | ${siteName}`,
    };
  }
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  try {
    const event = await getEventBySlug(id);
    return (
      <Layout>
        <EventStandaloneView event={event} />
      </Layout>
    );
  } catch {
    notFound();
  }
}
