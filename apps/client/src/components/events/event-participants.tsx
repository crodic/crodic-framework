"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/common/user-avatar";
import { Link } from "@/i18n/navigation";
import {
  getEventParticipants,
  type EventParticipantResDto,
} from "@/services/events";

interface EventParticipantsProps {
  eventSlug: string;
  layout?: "pills" | "cards";
}

export function EventParticipants({
  eventSlug,
  layout = "pills",
}: EventParticipantsProps) {
  const t = useTranslations("Events.detail");
  const [participants, setParticipants] = useState<EventParticipantResDto[]>(
    []
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;
    setParticipants([]);
    setPage(1);
    setTotalPages(1);
    setIsLoading(true);
    setHasError(false);

    getEventParticipants(eventSlug, 1)
      .then((response) => {
        if (!active) return;
        setParticipants(response.data);
        setPage(response.meta.currentPage);
        setTotalPages(response.meta.totalPages);
      })
      .catch(() => {
        if (active) setHasError(true);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [eventSlug]);

  const loadNextPage = async () => {
    const nextPage = participants.length === 0 ? 1 : page + 1;
    if (isLoading || (!hasError && nextPage > totalPages)) return;
    setIsLoading(true);
    setHasError(false);
    try {
      const response = await getEventParticipants(eventSlug, nextPage);
      setParticipants((current) =>
        nextPage === 1 ? response.data : [...current, ...response.data]
      );
      setPage(response.meta.currentPage);
      setTotalPages(response.meta.totalPages);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoading && participants.length === 0 && !hasError) {
    return (
      <p className="text-muted-foreground text-xs">{t("emptyParticipants")}</p>
    );
  }

  return (
    <div className="space-y-3">
      {layout === "cards" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {participants.map((participant) => (
            <Link
              key={participant.id}
              href={`/cosplayer/${participant.name.toLowerCase()}`}
              className="border-border/70 bg-muted/20 hover:border-primary/50 group flex items-center gap-3 rounded-xl border p-3 transition-colors"
            >
              <div className="border-primary/40 relative size-10 shrink-0 overflow-hidden rounded-full border">
                <UserAvatar
                  avatarUrl={participant.avatarUrl}
                  name={participant.name}
                  sizes="40px"
                  fallbackClassName="text-xs"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-foreground group-hover:text-primary truncate text-xs font-bold">
                    {participant.name}
                  </span>
                  {participant.isVerified && (
                    <Check
                      className="text-primary size-3 shrink-0 stroke-[3]"
                      aria-label={t("verified")}
                    />
                  )}
                </div>
                <p className="text-muted-foreground truncate text-[11px]">
                  {participant.roleLabel || t("specialGuest")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2.5">
          {participants.map((participant) => (
            <Link
              key={participant.id}
              href={`/cosplayer/${participant.name.toLowerCase()}`}
              className="border-border/60 bg-muted/20 hover:border-primary/50 flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 transition-colors"
            >
              <div className="border-primary/40 relative size-6 overflow-hidden rounded-full border">
                <UserAvatar
                  avatarUrl={participant.avatarUrl}
                  name={participant.name}
                  sizes="24px"
                  fallbackClassName="text-[10px]"
                />
              </div>
              <span className="text-foreground text-xs font-semibold">
                {participant.name}
              </span>
              {participant.isVerified && (
                <Check
                  className="text-primary size-3 stroke-[3]"
                  aria-label={t("verified")}
                />
              )}
            </Link>
          ))}
        </div>
      )}

      {hasError && (
        <p className="text-destructive text-xs" role="alert">
          {t("participantsLoadError")}
        </p>
      )}
      {(page < totalPages || hasError) && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={loadNextPage}
          disabled={isLoading}
        >
          {isLoading && <LoaderCircle className="size-3.5 animate-spin" />}
          {isLoading ? t("loadingParticipants") : t("loadMoreParticipants")}
        </Button>
      )}
      {isLoading && participants.length === 0 && (
        <p className="text-muted-foreground text-xs" role="status">
          {t("loadingParticipants")}
        </p>
      )}
    </div>
  );
}
