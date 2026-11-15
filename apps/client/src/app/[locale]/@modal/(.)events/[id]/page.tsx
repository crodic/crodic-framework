import { EventDetailModal } from "@/components/events/event-detail-modal";
import { getEventById } from "@/components/events/events-data";

interface InterceptedEventPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function InterceptedEventPage({
  params,
}: InterceptedEventPageProps) {
  const { id } = await params;
  const event = getEventById(id);

  return <EventDetailModal event={event} />;
}
