import { notFound } from "next/navigation";
import { EventDetailModal } from "@/components/events/event-detail-modal";
import { getEventBySlug } from "@/services/events";

interface InterceptedEventPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function InterceptedEventPage({
  params,
}: InterceptedEventPageProps) {
  const { id } = await params;

  try {
    const event = await getEventBySlug(id);
    return <EventDetailModal event={event} />;
  } catch {
    notFound();
  }
}
