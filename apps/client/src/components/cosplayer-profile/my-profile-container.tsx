"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";
import {
  getMyCosplayerProfile,
  type CosplayerDetailResDto,
} from "@/services/cosplayer";
import { getPosts, type PostSummaryResDto } from "@/services/posts";
import { getUserFollowing, type FollowUserResDto } from "@/services/social";
import {
  getMyCollections,
  type CollectionResDto,
} from "@/services/collections";
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
  const { data: userProfile, isLoading: isUserLoading } = useProfile();

  const { data: cosplayerProfile, isLoading: isCosplayerLoading } =
    useQuery<CosplayerDetailResDto>({
      queryKey: ["my-cosplayer-profile"],
      queryFn: getMyCosplayerProfile,
      staleTime: 1000 * 60 * 2,
      retry: 1,
    });

  const isLoading = isUserLoading || isCosplayerLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="text-primary size-8 animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">
          {t("loading")}
        </p>
      </div>
    );
  }

  // Derive active profile from actual account credentials, zero mock data!
  const effectiveProfile: CosplayerDetailResDto = {
    id: cosplayerProfile?.id || userProfile?.id || "profile",
    userId: userProfile?.id || cosplayerProfile?.userId || "",
    slug: cosplayerProfile?.slug || userProfile?.email?.split("@")[0] || "me",
    displayName:
      cosplayerProfile?.displayName ||
      userProfile?.fullName ||
      (userProfile?.firstName
        ? `${userProfile.firstName} ${userProfile.lastName || ""}`.trim()
        : userProfile?.email?.split("@")[0] || "User"),
    handle:
      cosplayerProfile?.handle ||
      (userProfile?.email ? `@${userProfile.email.split("@")[0]}` : "@user"),
    roleBadge: cosplayerProfile?.roleBadge || "Member",
    avatarUrl: cosplayerProfile?.avatarUrl || userProfile?.avatar || null,
    coverUrl: cosplayerProfile?.coverUrl || null,
    bio: cosplayerProfile?.bio || "",
    artisticBio: cosplayerProfile?.artisticBio || "",
    locationLabel: cosplayerProfile?.locationLabel || "",
    workArea: cosplayerProfile?.workArea || "",
    isVerified: cosplayerProfile?.isVerified || false,
    isCraftingCreator: cosplayerProfile?.isCraftingCreator || false,
    followersCount: cosplayerProfile?.followersCount || 0,
    totalLikesCount: cosplayerProfile?.totalLikesCount || 0,
    albumsCount: cosplayerProfile?.albumsCount || 0,
    charactersCount: cosplayerProfile?.charactersCount || 0,
    rankingScore: cosplayerProfile?.rankingScore || 0,
    specialties: cosplayerProfile?.specialties || [],
    skills: cosplayerProfile?.skills || [],
    awardsBadges: cosplayerProfile?.awardsBadges || [],
    followingCount: cosplayerProfile?.followingCount || 0,
    collectionsCount: cosplayerProfile?.collectionsCount || 0,
    heightLabel: cosplayerProfile?.heightLabel || "",
    experienceLabel: cosplayerProfile?.experienceLabel || "",
    contactEmail: cosplayerProfile?.contactEmail || userProfile?.email || "",
    contactPhone: cosplayerProfile?.contactPhone || "",
    facebookUrl: cosplayerProfile?.facebookUrl || null,
    instagramUrl: cosplayerProfile?.instagramUrl || null,
    tiktokUrl: cosplayerProfile?.tiktokUrl || null,
    twitterUrl: cosplayerProfile?.twitterUrl || null,
    characters: cosplayerProfile?.characters || [],
    createdAt:
      cosplayerProfile?.createdAt ||
      userProfile?.createdAt ||
      new Date().toISOString(),
    updatedAt:
      cosplayerProfile?.updatedAt ||
      userProfile?.updatedAt ||
      new Date().toISOString(),
  };

  const { data: myPostsRes } = useQuery({
    queryKey: ["my-posts", effectiveProfile.userId],
    queryFn: () => getPosts({ authorId: effectiveProfile.userId, limit: 50 }),
    enabled: !!effectiveProfile.userId,
  });

  const { data: myFollowingRes } = useQuery({
    queryKey: ["my-following", effectiveProfile.userId],
    queryFn: () => getUserFollowing(effectiveProfile.userId, { limit: 50 }),
    enabled: !!effectiveProfile.userId,
  });

  const { data: myCollectionsRes } = useQuery({
    queryKey: ["my-collections"],
    queryFn: () => getMyCollections({ limit: 50 }),
  });

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

  const isIncomplete =
    !effectiveProfile.bio &&
    (!effectiveProfile.specialties ||
      effectiveProfile.specialties.length === 0);

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
        initialProfile={effectiveProfile}
        initialAlbums={myPostsRes?.data || []}
        initialCharacters={effectiveProfile.characters || []}
        initialFollowed={myFollowedCosplayers}
        initialLikedWorks={[]}
        initialCollections={mySavedCollections}
        isOwner={true}
      />
    </div>
  );
}
export default MyProfileContainer;
