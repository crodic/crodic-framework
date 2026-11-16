"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { BadgeCheck, Check, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  getCosplayers,
  type CosplayerSummaryResDto,
} from "@/services/cosplayer";
import { cn } from "@/lib/utils";

export function BookingWidget() {
  const t = useTranslations("Home.bookingWidget");
  const [contactedIds, setContactedIds] = useState<Record<string, boolean>>({});

  const { data: cosplayerRes, isLoading } = useQuery({
    queryKey: ["public-booking-cosplayers"],
    queryFn: () => getCosplayers({ limit: 5 }),
    staleTime: 60 * 1000,
  });

  const cosplayers = cosplayerRes?.data || [];

  const handleContact = (id: string) => {
    setContactedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <Card className="border-border/70 bg-card/60 gap-0 rounded-2xl p-4 shadow-xs backdrop-blur-sm">
      {/* Header */}
      <div className="border-border/40 flex items-center justify-between border-b pb-2.5">
        <h3 className="text-foreground flex items-center gap-1.5 text-sm font-bold">
          <span>{t("title")}</span>
          <span role="img" aria-label="Booking">
            💼
          </span>
        </h3>
      </div>

      {/* Cosplayers List */}
      <CardContent className="divide-border/30 divide-y p-0 pt-1">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Sparkles className="text-muted-foreground size-4 animate-spin" />
          </div>
        ) : cosplayers.length > 0 ? (
          cosplayers.map((cosplayer: CosplayerSummaryResDto) => {
            const isContacted = contactedIds[cosplayer.id];

            return (
              <div
                key={cosplayer.id}
                className="group flex items-center justify-between gap-3 py-2.5 first:pt-2 last:pb-1"
              >
                <Link
                  href={`/cosplayer/${cosplayer.slug || cosplayer.handle}`}
                  className="flex min-w-0 items-center gap-2.5"
                >
                  {/* Avatar */}
                  <div className="border-border/80 bg-muted relative size-9 shrink-0 overflow-hidden rounded-full border">
                    {cosplayer.avatarUrl ? (
                      <Image
                        src={cosplayer.avatarUrl}
                        alt={cosplayer.displayName}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="bg-primary/20 text-primary flex size-full items-center justify-center text-xs font-bold">
                        {cosplayer.displayName.slice(0, 1)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-foreground group-hover:text-primary truncate text-xs font-bold transition-colors">
                        {cosplayer.displayName}
                      </span>
                      {cosplayer.isVerified && (
                        <BadgeCheck
                          className="size-3 shrink-0 fill-sky-400/20 text-sky-400"
                          aria-label="Verified"
                        />
                      )}
                    </div>
                    <p className="text-muted-foreground truncate text-[10px]">
                      {cosplayer.roleBadge ||
                        cosplayer.specialties?.join(", ") ||
                        "Cosplayer"}
                    </p>
                  </div>
                </Link>

                {/* Action Button */}
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleContact(cosplayer.id)}
                  className={cn(
                    "h-6.5 shrink-0 cursor-pointer rounded-lg px-2.5 text-[11px] font-medium transition-all",
                    isContacted
                      ? "border-primary/40 bg-primary/10 text-primary border"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 shadow-xs hover:scale-105"
                  )}
                >
                  {isContacted ? (
                    <>
                      <Check className="mr-1 size-3" />
                      <span>{t("saved")}</span>
                    </>
                  ) : (
                    <>
                      <Mail className="mr-1 size-3" />
                      <span>{t("booking")}</span>
                    </>
                  )}
                </Button>
              </div>
            );
          })
        ) : (
          <div className="text-muted-foreground py-6 text-center text-xs">
            {t("noCosplayers")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
