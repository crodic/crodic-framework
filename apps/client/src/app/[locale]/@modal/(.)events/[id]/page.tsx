import { notFound } from "next/navigation";
import { EventDetailModal } from "@/components/events/event-detail-modal";
import { serverFetch } from "@/lib/server-fetch";
import type { EventDetailResDto } from "@/services/events";

interface InterceptedEventPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function InterceptedEventPage({
  params,
}: InterceptedEventPageProps) {
  const { id } = await params;

  try {
    const cleanId = encodeURIComponent(decodeURIComponent(id));
    const event = await serverFetch<EventDetailResDto>(
      `/api/v1/public/events/${cleanId}`
    );
    return <EventDetailModal event={event} />;
  } catch {
    notFound();
  }
}
