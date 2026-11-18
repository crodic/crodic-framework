"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";
import {
  getMyCosplayerProfile,
  type CosplayerDetailResDto,
} from "@/services/cosplayer";
import { CosplayerProfileView } from "./cosplayer-profile-view";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export function MyProfileContainer() {
  const t = useTranslations("Common");
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

  return (
    <CosplayerProfileView
      initialProfile={effectiveProfile}
      initialAlbums={[]}
      initialCharacters={effectiveProfile.characters || []}
      initialFollowed={[]}
      initialLikedWorks={[]}
      initialCollections={[]}
      isOwner={true}
    />
  );
}
export default MyProfileContainer;
