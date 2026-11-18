"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getMyCosplayerProfile,
  type CosplayerDetailResDto,
} from "@/services/cosplayer";
import { getPosts } from "@/services/posts";
import { getUserFollowing } from "@/services/social";
import { getMyCollections } from "@/services/collections";
import type { FollowedCosplayer, SavedCollection } from "./profile-types";
import { CosplayerProfileView } from "./cosplayer-profile-view";
import { Compass, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function MyProfileContainer() {
  const t = useTranslations("Common");
  const tOnboarding = useTranslations("Onboarding");
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  // 1. Fetch current user cosplayer profile from real backend API
  const { data: cosplayerProfile, isLoading: isCosplayerLoading } =
    useQuery<CosplayerDetailResDto>({
      queryKey: ["my-cosplayer-profile"],
      queryFn: getMyCosplayerProfile,
      staleTime: 1000 * 60 * 2,
    });

  const userId = cosplayerProfile?.userId;

  // 2. Fetch associated posts, following, collections using real userId
  const { data: myPostsRes } = useQuery({
    queryKey: ["my-posts", userId],
    queryFn: () => getPosts({ authorId: userId!, limit: 50 }),
    enabled: !!userId,
  });

  const { data: myFollowingRes } = useQuery({
    queryKey: ["my-following", userId],
    queryFn: () => getUserFollowing(userId!, { limit: 50 }),
    enabled: !!userId,
  });

  const { data: myCollectionsRes } = useQuery({
    queryKey: ["my-collections"],
    queryFn: () => getMyCollections({ limit: 50 }),
  });

  // 3. Transform lists
  const myFollowedCosplayers: FollowedCosplayer[] = useMemo(() => {
    return (myFollowingRes?.data || []).map((user) => ({
      id: user.id,
      name: user.displayName,
      handle: user.handle
        ? `@${user.handle.replace(/^@/, "")}`
        : `@user-${user.id}`,
      avatarUrl: user.avatarUrl || "/landing/hero-banner.png",
      isVerified: false,
      previewPhoto: user.avatarUrl || "/landing/hero-banner.png",
      isFollowing: true,
    }));
  }, [myFollowingRes]);

  const mySavedCollections: SavedCollection[] = useMemo(() => {
    return (myCollectionsRes?.data || []).map((col) => ({
      id: col.id,
      title: col.title,
      count: col.itemsCount,
      thumbnails: col.previewThumbnails || [],
      updatedAt: col.updatedAt,
    }));
  }, [myCollectionsRes]);

  // 4. Loading state AFTER all hooks
  if (isCosplayerLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="text-primary size-8 animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">
          {t("loading")}
        </p>
      </div>
    );
  }

  if (!cosplayerProfile) {
    return null;
  }

  const isIncomplete =
    !cosplayerProfile.bio &&
    (!cosplayerProfile.specialties ||
      cosplayerProfile.specialties.length === 0);

  return (
    <div className="space-y-6">
      {isIncomplete && !isBannerDismissed && (
        <div className="border-border/70 bg-card/80 flex flex-col items-start justify-between gap-4 rounded-2xl border p-4 shadow-sm backdrop-blur-md sm:flex-row sm:items-center sm:p-5">
          <div className="flex items-center gap-3">
            <div className="bg-primary/15 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
              <Compass className="size-5" />
            </div>
            <div>
              <h4 className="text-foreground text-sm font-bold">
                {tOnboarding("banner.title")}
              </h4>
              <p className="text-muted-foreground text-xs">
                {tOnboarding("banner.desc")}
              </p>
            </div>
          </div>
          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsBannerDismissed(true)}
              className="text-muted-foreground text-xs"
            >
              {tOnboarding("banner.dismiss")}
            </Button>
            <Button
              asChild
              size="sm"
              className="rounded-xl text-xs font-semibold"
            >
              <Link href="/onboarding">{tOnboarding("banner.cta")}</Link>
            </Button>
          </div>
        </div>
      )}

      <CosplayerProfileView
        initialProfile={cosplayerProfile}
        initialAlbums={myPostsRes?.data || []}
        initialCharacters={cosplayerProfile.characters || []}
        initialFollowed={myFollowedCosplayers}
        initialLikedWorks={[]}
        initialCollections={mySavedCollections}
        isOwner={true}
      />
    </div>
  );
}

export default MyProfileContainer;
