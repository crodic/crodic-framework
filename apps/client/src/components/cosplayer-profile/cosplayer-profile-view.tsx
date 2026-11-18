"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
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
import type { PostSummaryResDto } from "@/services/posts";

const DEFAULT_EMPTY_PROFILE: CosplayerDetailResDto = {
  id: "",
  userId: "",
  slug: "",
  displayName: "",
  handle: "",
  roleBadge: "",
  locationLabel: "",
  isVerified: false,
  isCraftingCreator: false,
  followersCount: 0,
  totalLikesCount: 0,
  albumsCount: 0,
  charactersCount: 0,
  rankingScore: 0,
  specialties: [],
  skills: [],
  awardsBadges: [],
  followingCount: 0,
  collectionsCount: 0,
  characters: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

interface CosplayerProfileViewProps {
  initialProfile?: CosplayerDetailResDto;
  initialAlbums?: PostSummaryResDto[];
  initialCharacters?: CosplayerCharacterResDto[];
  initialFollowed?: FollowedCosplayer[];
  initialLikedWorks?: LikedWork[];
  initialCollections?: SavedCollection[];
  isOwner?: boolean;
}

export function CosplayerProfileView({
  initialProfile = DEFAULT_EMPTY_PROFILE,
  initialAlbums = [],
  initialCharacters = [],
  initialFollowed = [],
  initialLikedWorks = [],
  initialCollections = [],
  isOwner = false,
}: CosplayerProfileViewProps) {
  const t = useTranslations("Profile");
  const [profile, setProfile] = useState<CosplayerDetailResDto>(initialProfile);
  const [viewMode, setViewMode] = useState<"owner" | "visitor">("owner");
  const [activeTab, setActiveTab] = useState(isOwner ? "following" : "albums");

  useEffect(() => {
    if (initialProfile && initialProfile.id) {
      setProfile(initialProfile);
    }
  }, [initialProfile]);

  const effectiveOwnerMode = isOwner && viewMode === "owner";

  const handleProfileUpdate = (updated: Partial<CosplayerDetailResDto>) => {
    setProfile((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  const handleToggleViewMode = () => {
    setViewMode((prev) => (prev === "owner" ? "visitor" : "owner"));
    setActiveTab((prev) =>
      prev === "following" || prev === "liked" || prev === "collections"
        ? "albums"
        : prev
    );
  };

  const activeCharacters =
    initialCharacters.length > 0 ? initialCharacters : profile.characters || [];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header Hero Banner, Avatar, Details & Actions */}
      <ProfileHero
        profile={profile}
        isOwner={isOwner}
        onProfileUpdate={handleProfileUpdate}
        onToggleViewMode={isOwner ? handleToggleViewMode : undefined}
        viewMode={viewMode}
      />

      {/* 2. Main Content Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-border/60 mb-6 border-b">
          <TabsList className="no-scrollbar h-auto w-full justify-start gap-4 rounded-none bg-transparent p-0 sm:gap-8">
            {effectiveOwnerMode ? (
              /* OWNER TABS */
              <>
                <TabsTrigger
                  value="following"
                  className="data-[state=active]:text-primary after:bg-primary relative px-1 py-2 text-sm font-bold transition-colors after:bottom-0 after:h-0.5 sm:text-base"
                >
                  {t("followingTab", { count: initialFollowed.length })}
                </TabsTrigger>
                <TabsTrigger
                  value="liked"
                  className="data-[state=active]:text-primary after:bg-primary relative px-1 py-2 text-sm font-bold transition-colors after:bottom-0 after:h-0.5 sm:text-base"
                >
                  {t("likedTab", { count: initialLikedWorks.length })}
                </TabsTrigger>
                <TabsTrigger
                  value="collections"
                  className="data-[state=active]:text-primary after:bg-primary relative px-1 py-2 text-sm font-bold transition-colors after:bottom-0 after:h-0.5 sm:text-base"
                >
                  {t("collectionsTab", { count: initialCollections.length })}
                </TabsTrigger>
                {initialAlbums.length > 0 && (
                  <TabsTrigger
                    value="albums"
                    className="data-[state=active]:text-primary after:bg-primary relative px-1 py-2 text-sm font-bold transition-colors after:bottom-0 after:h-0.5 sm:text-base"
                  >
                    {t("myWorksTab", { count: initialAlbums.length })}
                  </TabsTrigger>
                )}
                <TabsTrigger
                  value="about"
                  className="data-[state=active]:text-primary after:bg-primary relative px-1 py-2 text-sm font-bold transition-colors after:bottom-0 after:h-0.5 sm:text-base"
                >
                  {t("aboutTab")}
                </TabsTrigger>
              </>
            ) : (
              /* VISITOR TABS */
              <>
                <TabsTrigger
                  value="albums"
                  className="data-[state=active]:text-primary after:bg-primary relative px-1 py-2 text-sm font-bold transition-colors after:bottom-0 after:h-0.5 sm:text-base"
                >
                  {t("allAlbumsTab", {
                    count: profile.albumsCount || initialAlbums.length,
                  })}
                </TabsTrigger>
                <TabsTrigger
                  value="characters"
                  className="data-[state=active]:text-primary after:bg-primary relative px-1 py-2 text-sm font-bold transition-colors after:bottom-0 after:h-0.5 sm:text-base"
                >
                  {t("charactersTab", { count: activeCharacters.length })}
                </TabsTrigger>
                <TabsTrigger
                  value="about"
                  className="data-[state=active]:text-primary after:bg-primary relative px-1 py-2 text-sm font-bold transition-colors after:bottom-0 after:h-0.5 sm:text-base"
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
              <ProfileFollowed initialFollowed={initialFollowed} />
            </TabsContent>

            <TabsContent
              value="liked"
              className="mt-0 focus-visible:outline-none"
            >
              <ProfileLikedWorks initialLikedWorks={initialLikedWorks} />
            </TabsContent>

            <TabsContent
              value="collections"
              className="mt-0 focus-visible:outline-none"
            >
              <ProfileSavedCollections
                initialCollections={initialCollections}
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
