"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getSuggestedCosplayers } from "@/services/cosplayer";
import { toggleFollow } from "@/services/social";
import { useAuthStore } from "@/store/use-auth-store";
import { useRouter } from "@/i18n/navigation";
import { useProfile } from "@/hooks/use-profile";

export function SuggestedCosplayersWidget() {
  const t = useTranslations("Feed");
  const tCos = useTranslations("CosplayerProfile");
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: currentUser } = useProfile();
  const router = useRouter();
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  const { data: cosplayers = [] } = useQuery({
    queryKey: ["suggested-cosplayers", currentUser?.id],
    queryFn: () => getSuggestedCosplayers({ limit: 4 }),
  });

  const handleToggleFollow = async (userId: string, name: string) => {
    if (!isAuthenticated) {
      toast.info(tCos("loginRequiredToFollow"));
      router.push("/auth/login?from=/feed");
      return;
    }

    try {
      const res = await toggleFollow(userId);
      setFollowingMap((prev) => ({ ...prev, [userId]: res.following }));
      queryClient.invalidateQueries({ queryKey: ["suggested-cosplayers"] });
      queryClient.invalidateQueries({ queryKey: ["my-following"] });
      queryClient.invalidateQueries({ queryKey: ["following-feed-posts"] });
      if (res.following) {
        toast.success(tCos("followedSuccess", { name }));
      } else {
        toast.info(tCos("unfollowedSuccess", { name }));
      }
    } catch {
      toast.error(tCos("followError"));
    }
  };

  if (!cosplayers || cosplayers.length === 0) return null;

  return (
    <div className="border-border/70 bg-card/70 rounded-2xl border p-4 shadow-xs backdrop-blur-xs">
      <div className="mb-3.5 flex items-center justify-between">
        <h3 className="text-foreground text-sm font-bold sm:text-base">
          {t("suggestedCosplayers")}
        </h3>
        <Link
          href="/explore"
          className="text-primary text-xs font-medium hover:underline"
        >
          {t("viewAll")}
        </Link>
      </div>

      <div className="space-y-3">
        {cosplayers.map((item) => {
          const isFollowing = followingMap[item.userId] ?? false;

          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2.5"
            >
              <Link
                href={`/cosplayer/${item.slug || item.id}`}
                className="group flex items-center gap-2.5 overflow-hidden"
              >
                <div className="border-border/70 relative size-9 shrink-0 overflow-hidden rounded-full border">
                  {item.avatarUrl ? (
                    <Image
                      src={item.avatarUrl}
                      alt={item.displayName}
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="bg-primary/10 text-primary flex size-full items-center justify-center text-xs font-bold">
                      {item.displayName.slice(0, 1)}
                    </div>
                  )}
                </div>

                <div className="truncate">
                  <div className="flex items-center gap-1">
                    <span className="text-foreground group-hover:text-primary truncate text-xs font-bold transition-colors">
                      {item.displayName}
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
              </Link>

              {/* Follow Toggle Button - Only show when authenticated and not self */}
              {isAuthenticated && currentUser?.id !== item.userId && (
                <Button
                  size="sm"
                  variant={isFollowing ? "outline" : "default"}
                  onClick={() =>
                    handleToggleFollow(item.userId, item.displayName)
                  }
                  className={`h-7.5 shrink-0 cursor-pointer rounded-lg px-3 text-xs font-semibold ${
                    isFollowing
                      ? "border-border/80 text-muted-foreground hover:text-foreground"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Check className="mr-1 size-3" />
                      <span>{t("following")}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="mr-1 size-3" />
                      <span>{t("follow")}</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
