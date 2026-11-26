"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getSuggestedCosplayers } from "@/services/cosplayer";
import { toggleFollow } from "@/services/social";
import { useProfile } from "@/hooks/use-profile";
import { useAuthStore } from "@/store/use-auth-store";

export function SuggestedCosplayersWidget() {
  const t = useTranslations("Feed");
  const tCos = useTranslations("CosplayerProfile");
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const { data: currentUser, isLoading: isProfileLoading } = useProfile();
  const router = useRouter();
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  const { data: cosplayers = [], isLoading } = useQuery({
    queryKey: [
      "suggested-cosplayers",
      isAuthenticated,
      currentUser?.id ?? null,
    ],
    queryFn: () => getSuggestedCosplayers({ limit: 4 }),
    enabled: !isHydrating && (!isAuthenticated || !isProfileLoading),
  });

  const visibleCosplayers = useMemo(() => {
    const currentId = currentUser?.id ? String(currentUser.id) : null;
    const currentUsername = currentUser?.username?.trim().toLowerCase() || null;

    return cosplayers.filter((item) => {
      if (currentId && String(item.userId) === currentId) {
        return false;
      }
      if (currentUsername) {
        const handleNorm = item.handle?.replace(/^@/, "").trim().toLowerCase();
        if (
          handleNorm === currentUsername ||
          item.slug?.toLowerCase() === currentUsername
        ) {
          return false;
        }
      }
      return true;
    });
  }, [cosplayers, currentUser?.id, currentUser?.username]);

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

  if (isHydrating || isLoading) {
    return (
      <div className="border-border bg-card rounded-xl border p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="bg-muted h-4 w-36 animate-pulse rounded-md" />
          <div className="bg-muted h-3 w-12 animate-pulse rounded-md" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2.5"
            >
              <div className="flex items-center gap-2.5">
                <div className="bg-muted size-9 shrink-0 animate-pulse rounded-full" />
                <div className="space-y-1.5">
                  <div className="bg-muted h-3 w-24 animate-pulse rounded-sm" />
                  <div className="bg-muted/70 h-2.5 w-16 animate-pulse rounded-sm" />
                </div>
              </div>
              <div className="bg-muted h-7.5 w-18 shrink-0 animate-pulse rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!visibleCosplayers || visibleCosplayers.length === 0) {
    return (
      <div className="border-border bg-card rounded-xl border p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-foreground text-base font-semibold">
            {t("suggestedCosplayers")}
          </h3>
          <Link
            href="/explore"
            className="text-primary shrink-0 text-sm font-medium underline-offset-4 hover:underline"
          >
            {t("viewAll")}
          </Link>
        </div>

        <div className="border-border/50 bg-muted/20 flex flex-col items-center justify-center rounded-xl border border-dashed px-3 py-6 text-center">
          <div className="bg-primary/10 text-primary mb-2 flex size-9 items-center justify-center rounded-full">
            <Check className="size-4 stroke-[2.5]" />
          </div>
          <p className="text-foreground text-xs font-semibold">
            {t("noSuggestedCosplayersTitle")}
          </p>
          <p className="text-muted-foreground mt-0.5 max-w-[210px] text-[11px] leading-relaxed">
            {t("noSuggestedCosplayersDesc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-border bg-card rounded-xl border p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-foreground text-base font-semibold">
          {t("suggestedCosplayers")}
        </h3>
        <Link
          href="/explore"
          className="text-primary shrink-0 text-sm font-medium underline-offset-4 hover:underline"
        >
          {t("viewAll")}
        </Link>
      </div>

      <div className="space-y-3">
        {visibleCosplayers.map((item) => {
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
                  <p className="text-muted-foreground truncate text-xs">
                    {item.handle}
                  </p>
                </div>
              </Link>

              {/* Follow Toggle Button - Server excludes current user when hydrated */}
              {isAuthenticated && (
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
