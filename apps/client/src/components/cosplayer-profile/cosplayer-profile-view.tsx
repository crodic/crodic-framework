"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";
import { useAuthStore } from "@/store/use-auth-store";
import { getUserFollowing } from "@/services/social";
import { getMyCollections } from "@/services/collections";
import { getMyLikedPosts, type PostSummaryResDto } from "@/services/posts";
import { ProfileHero } from "./profile-hero";
import { ProfileAlbums } from "./profile-albums";
import { ProfileCharacters } from "./profile-characters";
import { ProfileAbout } from "./profile-about";
import { ProfileFollowed } from "./profile-followed";
import { ProfileLikedWorks } from "./profile-liked-works";
import { ProfileSavedCollections } from "./profile-saved-collections";
import type {
  CosplayerDetailResDto,
  CosplayerCharacterResDto,
  FollowedCosplayer,
  LikedWork,
  SavedCollection,
} from "./profile-types";

interface CosplayerProfileViewProps {
  initialProfile: CosplayerDetailResDto;
  initialAlbums?: PostSummaryResDto[];
  initialCharacters?: CosplayerCharacterResDto[];
  initialFollowed?: FollowedCosplayer[];
  initialLikedWorks?: LikedWork[];
  initialCollections?: SavedCollection[];
  isOwner?: boolean;
}

export function CosplayerProfileView({
  initialProfile,
  initialAlbums = [],
  initialCharacters = [],
  initialFollowed = [],
  initialLikedWorks = [],
  initialCollections = [],
  isOwner = false,
}: CosplayerProfileViewProps) {
  const t = useTranslations("Profile");
  const { data: currentUser } = useProfile();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isHydrating = useAuthStore((state) => state.isHydrating);

  const [profile, setProfile] = useState<CosplayerDetailResDto>(initialProfile);
  const [viewMode, setViewMode] = useState<"owner" | "visitor">("owner");

  // Determine ownership dynamically: either explicitly passed or current user matches profile
  const isCurrentUserOwner =
    Boolean(isOwner) ||
    Boolean(
      !isHydrating &&
      accessToken &&
      currentUser?.id &&
      profile.userId &&
      String(currentUser.id) === String(profile.userId)
    );

  const [activeTab, setActiveTab] = useState(
    isOwner || isCurrentUserOwner ? "following" : "albums"
  );

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
    }
  }, [initialProfile]);

  // Fetch owner data if the user is viewing their own profile
  const { data: myFollowingRes } = useQuery({
    queryKey: ["my-following", profile.userId],
    queryFn: () => getUserFollowing(profile.userId!, { limit: 50 }),
    enabled:
      isCurrentUserOwner && !isHydrating && !!accessToken && !!profile.userId,
  });

  const { data: myCollectionsRes } = useQuery({
    queryKey: ["my-collections", profile.userId],
    queryFn: () => getMyCollections({ limit: 50 }),
    enabled:
      isCurrentUserOwner && !isHydrating && !!accessToken && !!profile.userId,
  });

  const { data: myLikedPostsRes } = useQuery({
    queryKey: ["my-liked-posts", profile.userId],
    queryFn: () => getMyLikedPosts({ limit: 50 }),
    enabled:
      isCurrentUserOwner && !isHydrating && !!accessToken && !!profile.userId,
  });

  const effectiveFollowed = myFollowingRes?.data || initialFollowed;
  const effectiveCollections = myCollectionsRes?.data || initialCollections;
  const effectiveLikedWorks = myLikedPostsRes?.data || initialLikedWorks;
  const effectiveOwnerMode = isCurrentUserOwner && viewMode === "owner";

  useEffect(() => {
    if (effectiveOwnerMode && activeTab === "characters") {
      setActiveTab("albums");
    } else if (
      effectiveOwnerMode &&
      activeTab === "albums" &&
      initialAlbums.length === 0
    ) {
      setActiveTab("following");
    }
  }, [effectiveOwnerMode, activeTab, initialAlbums.length]);

  const handleProfileUpdate = (updated: Partial<CosplayerDetailResDto>) => {
    setProfile((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  const handleToggleViewMode = () => {
    setViewMode((prev) => (prev === "owner" ? "visitor" : "owner"));
    setActiveTab((prev) => {
      if (prev === "following" || prev === "liked" || prev === "collections") {
        return "albums";
      }
      return prev;
    });
  };

  const activeCharacters =
    initialCharacters.length > 0 ? initialCharacters : profile.characters || [];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header Hero Banner, Avatar, Details & Actions */}
      <ProfileHero
        profile={profile}
        isOwner={isCurrentUserOwner}
        onProfileUpdate={handleProfileUpdate}
        onToggleViewMode={isCurrentUserOwner ? handleToggleViewMode : undefined}
        viewMode={viewMode}
      />

      {/* 2. Main Content Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-border/60 no-scrollbar mb-6 [scrollbar-width:none] overflow-x-auto overflow-y-hidden border-b [&::-webkit-scrollbar]:hidden">
          <TabsList className="no-scrollbar flex h-auto w-max min-w-full [scrollbar-width:none] justify-start gap-3 rounded-none bg-transparent p-0 sm:gap-6 md:gap-8 [&::-webkit-scrollbar]:hidden">
            {effectiveOwnerMode ? (
              /* OWNER TABS */
              <>
                <TabsTrigger
                  value="following"
                  className="data-[state=active]:text-primary after:bg-primary relative shrink-0 px-1 py-2 text-xs font-bold whitespace-nowrap transition-colors after:bottom-0 after:h-0.5 sm:text-base"
                >
                  {t("followingTab")}
                </TabsTrigger>
                <TabsTrigger
                  value="liked"
                  className="data-[state=active]:text-primary after:bg-primary relative shrink-0 px-1 py-2 text-xs font-bold whitespace-nowrap transition-colors after:bottom-0 after:h-0.5 sm:text-base"
                >
                  {t("likedTab")}
                </TabsTrigger>
                <TabsTrigger
                  value="collections"
                  className="data-[state=active]:text-primary after:bg-primary relative shrink-0 px-1 py-2 text-xs font-bold whitespace-nowrap transition-colors after:bottom-0 after:h-0.5 sm:text-base"
                >
                  {t("collectionsTab")}
                </TabsTrigger>
                {initialAlbums.length > 0 && (
                  <TabsTrigger
                    value="albums"
                    className="data-[state=active]:text-primary after:bg-primary relative shrink-0 px-1 py-2 text-xs font-bold whitespace-nowrap transition-colors after:bottom-0 after:h-0.5 sm:text-base"
                  >
                    {t("myWorksTab")}
                  </TabsTrigger>
                )}
                <TabsTrigger
                  value="about"
                  className="data-[state=active]:text-primary after:bg-primary relative shrink-0 px-1 py-2 text-xs font-bold whitespace-nowrap transition-colors after:bottom-0 after:h-0.5 sm:text-base"
                >
                  {t("aboutTab")}
                </TabsTrigger>
              </>
            ) : (
              /* VISITOR TABS */
              <>
                <TabsTrigger
                  value="albums"
                  className="data-[state=active]:text-primary after:bg-primary relative shrink-0 px-1 py-2 text-xs font-bold whitespace-nowrap transition-colors after:bottom-0 after:h-0.5 sm:text-base"
                >
                  {t("allAlbumsTab")}
                </TabsTrigger>
                <TabsTrigger
                  value="characters"
                  className="data-[state=active]:text-primary after:bg-primary relative shrink-0 px-1 py-2 text-xs font-bold whitespace-nowrap transition-colors after:bottom-0 after:h-0.5 sm:text-base"
                >
                  {t("charactersTab")}
                </TabsTrigger>
                <TabsTrigger
                  value="about"
                  className="data-[state=active]:text-primary after:bg-primary relative shrink-0 px-1 py-2 text-xs font-bold whitespace-nowrap transition-colors after:bottom-0 after:h-0.5 sm:text-base"
                >
                  {t("aboutTab")}
                </TabsTrigger>
              </>
            )}
          </TabsList>
        </div>

        {/* OWNER VIEW */}
        {effectiveOwnerMode ? (
          <div className="space-y-6">
            <TabsContent
              value="following"
              className="mt-0 focus-visible:outline-none"
            >
              <ProfileFollowed initialFollowed={effectiveFollowed} />
            </TabsContent>

            <TabsContent
              value="liked"
              className="mt-0 focus-visible:outline-none"
            >
              <ProfileLikedWorks initialLikedWorks={effectiveLikedWorks} />
            </TabsContent>

            <TabsContent
              value="collections"
              className="mt-0 focus-visible:outline-none"
            >
              <ProfileSavedCollections
                initialCollections={effectiveCollections}
              />
            </TabsContent>

            <TabsContent
              value="albums"
              className="mt-0 focus-visible:outline-none"
            >
              <ProfileAlbums
                albums={initialAlbums}
                cosplayerName={profile.displayName}
              />
            </TabsContent>

            <TabsContent
              value="about"
              className="mt-0 focus-visible:outline-none"
            >
              <ProfileAbout profile={profile} />
            </TabsContent>
          </div>
        ) : (
          /* VISITOR VIEW */
          <>
            <TabsContent
              value="albums"
              className="mt-0 focus-visible:outline-none"
            >
              <ProfileAlbums
                albums={initialAlbums}
                cosplayerName={profile.displayName}
              />
            </TabsContent>

            <TabsContent
              value="characters"
              className="mt-0 focus-visible:outline-none"
            >
              <ProfileCharacters characters={activeCharacters} />
            </TabsContent>

            <TabsContent
              value="about"
              className="mt-0 focus-visible:outline-none"
            >
              <ProfileAbout profile={profile} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
