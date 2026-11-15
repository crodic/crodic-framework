"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Check, Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MOCK_SUGGESTED_COSPLAYERS } from "./feed-data";

export function SuggestedCosplayersWidget() {
  const [cosplayers, setCosplayers] = useState(MOCK_SUGGESTED_COSPLAYERS);

  const handleToggleFollow = (id: string, name: string) => {
    setCosplayers((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextState = !c.isFollowing;
          if (nextState) {
            toast.success(`Đã theo dõi ${name}`);
          } else {
            toast.info(`Đã hủy theo dõi ${name}`);
          }
          return { ...c, isFollowing: nextState };
        }
        return c;
      })
    );
  };

  return (
    <div className="border-border/70 bg-card/70 rounded-2xl border p-4 shadow-xs backdrop-blur-xs">
      <div className="mb-3.5 flex items-center justify-between">
        <h3 className="text-foreground text-sm font-bold sm:text-base">
          Gợi ý theo dõi
        </h3>
        <Link
          href="/explore"
          className="text-primary text-xs font-medium hover:underline"
        >
          Xem tất cả
        </Link>
      </div>

      <div className="space-y-3">
        {cosplayers.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-2.5"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="border-border/70 relative size-9 shrink-0 overflow-hidden rounded-full border">
                <Image
                  src={item.avatarUrl}
                  alt={item.name}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </div>

              <div className="truncate">
                <div className="flex items-center gap-1">
                  <span className="text-foreground truncate text-xs font-bold">
                    {item.name}
                  </span>
                  {item.isVerified && (
                    <span className="bg-primary/20 text-primary flex size-3.5 shrink-0 items-center justify-center rounded-full">
                      <Check className="size-2 stroke-[3]" />
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground truncate text-[11px]">
                  {item.handle}
                </p>
              </div>
            </div>

            {/* Follow Toggle Button */}
            <Button
              size="sm"
              variant={item.isFollowing ? "outline" : "default"}
              onClick={() => handleToggleFollow(item.id, item.name)}
              className={`h-7.5 shrink-0 cursor-pointer rounded-lg px-3 text-xs font-semibold ${
                item.isFollowing
                  ? "border-border/80 text-muted-foreground hover:text-foreground"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
              }`}
            >
              {item.isFollowing ? (
                <>
                  <Check className="mr-1 size-3" />
                  <span>Đang theo dõi</span>
                </>
              ) : (
                <>
                  <Plus className="mr-1 size-3" />
                  <span>Theo dõi</span>
                </>
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
