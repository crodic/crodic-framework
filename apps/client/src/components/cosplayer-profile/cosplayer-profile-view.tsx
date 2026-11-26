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
import { getMyCharacters } from "@/services/cosplayer";
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
  const [isMounted, setIsMounted] = useState(false);
  const [hasSwitchedToOwnerTab, setHasSwitchedToOwnerTab] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Determine ownership dynamically: either explicitly passed or current user matches profile
  const isCurrentUserOwner =
    Boolean(isOwner) ||
    Boolean(
      isMounted &&
      !isHydrating &&
      accessToken &&
      currentUser?.id &&
      profile.userId &&
      String(currentUser.id) === String(profile.userId)
    );

  const [activeTab, setActiveTab] = useState(isOwner ? "following" : "albums");

  useEffect(() => {
    if (isMounted && isCurrentUserOwner && !hasSwitchedToOwnerTab) {
      setHasSwitchedToOwnerTab(true);
      setActiveTab("following");
    }
  }, [isMounted, isCurrentUserOwner, hasSwitchedToOwnerTab]);

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

  const { data: myCharactersRes, refetch: refetchCharacters } = useQuery({
    queryKey: ["my-cosplayer-characters"],
    queryFn: () => getMyCharacters(),
    enabled: isCurrentUserOwner && !isHydrating && !!accessToken,
  });

  const effectiveFollowed = myFollowingRes?.data || initialFollowed;
  const effectiveCollections = myCollectionsRes?.data || initialCollections;
  const effectiveLikedWorks = myLikedPostsRes?.data || initialLikedWorks;
  const effectiveOwnerMode = isCurrentUserOwner && viewMode === "owner";

  useEffect(() => {
    if (
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
    isCurrentUserOwner && myCharactersRes
      ? myCharactersRes
      : initialCharacters.length > 0
        ? initialCharacters
        : profile.characters || [];

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
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full min-w-0"
      >
        <div className="border-border mb-4 max-w-full min-w-0 touch-pan-x scrollbar-none overflow-x-auto overscroll-x-contain border-b">
          <TabsList
            variant="line"
            className="flex h-auto w-max min-w-full justify-start gap-1 p-1"
          >
            {effectiveOwnerMode ? (
              /* OWNER TABS */
              <>
                <TabsTrigger
                  value="following"
                  className="data-[state=active]:text-primary after:bg-primary min-h-10 shrink-0 px-3 text-sm after:bottom-0"
                >
                  {t("followingTab")}
                </TabsTrigger>
                <TabsTrigger
                  value="liked"
                  className="data-[state=active]:text-primary after:bg-primary min-h-10 shrink-0 px-3 text-sm after:bottom-0"
                >
                  {t("likedTab")}
                </TabsTrigger>
                <TabsTrigger
                  value="collections"
                  className="data-[state=active]:text-primary after:bg-primary min-h-10 shrink-0 px-3 text-sm after:bottom-0"
                >
                  {t("collectionsTab")}
                </TabsTrigger>
                {initialAlbums.length > 0 && (
                  <TabsTrigger
                    value="albums"
                    className="data-[state=active]:text-primary after:bg-primary min-h-10 shrink-0 px-3 text-sm after:bottom-0"
                  >
                    {t("myWorksTab")}
                  </TabsTrigger>
                )}
                <TabsTrigger
                  value="characters"
                  className="data-[state=active]:text-primary after:bg-primary min-h-10 shrink-0 px-3 text-sm after:bottom-0"
                >
                  {t("charactersTab")}
                </TabsTrigger>
                <TabsTrigger
                  value="about"
                  className="data-[state=active]:text-primary after:bg-primary min-h-10 shrink-0 px-3 text-sm after:bottom-0"
                >
                  {t("aboutTab")}
                </TabsTrigger>
              </>
            ) : (
              /* VISITOR TABS */
              <>
                <TabsTrigger
                  value="albums"
                  className="data-[state=active]:text-primary after:bg-primary min-h-10 shrink-0 px-3 text-sm after:bottom-0"
                >
                  {t("allAlbumsTab")}
                </TabsTrigger>
                <TabsTrigger
                  value="characters"
                  className="data-[state=active]:text-primary after:bg-primary min-h-10 shrink-0 px-3 text-sm after:bottom-0"
                >
                  {t("charactersTab")}
                </TabsTrigger>
                <TabsTrigger
                  value="about"
                  className="data-[state=active]:text-primary after:bg-primary min-h-10 shrink-0 px-3 text-sm after:bottom-0"
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
              value="characters"
              className="mt-0 focus-visible:outline-none"
            >
              <ProfileCharacters
                characters={activeCharacters}
                isOwner={isCurrentUserOwner}
                onCharactersChange={() => {
                  refetchCharacters();
                }}
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
              <ProfileCharacters
                characters={activeCharacters}
                isOwner={isCurrentUserOwner}
                onCharactersChange={() => {
                  refetchCharacters();
                }}
              />
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
