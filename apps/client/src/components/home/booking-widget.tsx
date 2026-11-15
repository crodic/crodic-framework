"use client";

import React, { useState } from "react";
import Image from "next/image";
import { BadgeCheck, Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HOME_BOOKING_COSPLAYERS } from "./home-data";
import { cn } from "@/lib/utils";

export function BookingWidget() {
  const [contactedIds, setContactedIds] = useState<Record<string, boolean>>({});

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
          <span>Cosplayer đang nhận Booking</span>
          <span role="img" aria-label="Booking">
            💼
          </span>
        </h3>
      </div>

      {/* Cosplayers List */}
      <CardContent className="divide-border/30 divide-y p-0 pt-1">
        {HOME_BOOKING_COSPLAYERS.map((cosplayer) => {
          const isContacted = contactedIds[cosplayer.id];

          return (
            <div
              key={cosplayer.id}
              className="group flex items-center justify-between gap-3 py-2.5 first:pt-2 last:pb-1"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                {/* Avatar */}
                <div className="border-border/80 bg-muted relative size-9 shrink-0 overflow-hidden rounded-full border">
                  <Image
                    src={cosplayer.avatarUrl}
                    alt={cosplayer.name}
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-foreground group-hover:text-primary truncate text-xs font-bold transition-colors">
                      {cosplayer.name}
                    </span>
                    {cosplayer.isVerified && (
                      <BadgeCheck
                        className="size-3 shrink-0 fill-sky-400/20 text-sky-400"
                        aria-label="Đã xác minh"
                      />
                    )}
                  </div>
                  <p className="text-muted-foreground truncate text-[10px]">
                    {cosplayer.role}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <Button
                type="button"
                size="sm"
                onClick={() => handleContact(cosplayer.id)}
                className={cn(
                  "h-6.5 shrink-0 cursor-pointer rounded-lg px-2.5 text-[11px] font-medium transition-all",
                  isContacted
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border border"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 shadow-2xs"
                )}
              >
                {isContacted ? (
                  <span className="flex items-center gap-1">
                    <Check className="size-3" />
                    Đã gửi
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Mail className="size-3" />
                    Liên hệ
                  </span>
                )}
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
