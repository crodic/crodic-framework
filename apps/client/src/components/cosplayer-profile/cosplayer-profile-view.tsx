"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileHero } from "./profile-hero";
import { ProfileAlbums } from "./profile-albums";
import { ProfileCharacters } from "./profile-characters";
import { ProfileAbout } from "./profile-about";
import { ProfileFollowed } from "./profile-followed";
import { ProfileLikedWorks } from "./profile-liked-works";
import { ProfileSavedCollections } from "./profile-saved-collections";
import {
  KIRIKO_PROFILE,
  KIRIKO_ALBUMS,
  KIRIKO_CHARACTERS,
  MOCK_FOLLOWED_COSPLAYERS,
  MOCK_LIKED_WORKS,
  MOCK_SAVED_COLLECTIONS,
} from "./profile-data";
import {
  CosplayerProfileData,
  CosplayerAlbum,
  CosplayerCharacter,
  FollowedCosplayer,
  LikedWork,
  SavedCollection,
} from "./profile-types";

interface CosplayerProfileViewProps {
  initialProfile?: CosplayerProfileData;
  initialAlbums?: CosplayerAlbum[];
  initialCharacters?: CosplayerCharacter[];
  initialFollowed?: FollowedCosplayer[];
  initialLikedWorks?: LikedWork[];
  initialCollections?: SavedCollection[];
  isOwner?: boolean;
}

export function CosplayerProfileView({
  initialProfile = KIRIKO_PROFILE,
  initialAlbums = KIRIKO_ALBUMS,
  initialCharacters = KIRIKO_CHARACTERS,
  initialFollowed = MOCK_FOLLOWED_COSPLAYERS,
  initialLikedWorks = MOCK_LIKED_WORKS,
  initialCollections = MOCK_SAVED_COLLECTIONS,
  isOwner = false,
}: CosplayerProfileViewProps) {
  const [profile, setProfile] = useState<CosplayerProfileData>(initialProfile);
  const [viewMode, setViewMode] = useState<"owner" | "visitor">("owner");
  const [activeTab, setActiveTab] = useState(isOwner ? "following" : "albums");

  const effectiveOwnerMode = isOwner && viewMode === "owner";

  const handleProfileUpdate = (updated: Partial<CosplayerProfileData>) => {
    setProfile((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  const handleToggleViewMode = () => {
    setViewMode((prev) => (prev === "owner" ? "visitor" : "owner"));
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* 1. Hero Section: Panoramic Cover, Circular Avatar, Bio, Follow/Message or Owner Actions */}
      <ProfileHero
        profile={profile}
        isOwner={isOwner}
        viewMode={viewMode}
        onProfileUpdate={handleProfileUpdate}
        onToggleViewMode={handleToggleViewMode}
      />

      {/* 2. Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full space-y-6"
      >
        <div className="border-border/60 border-b pb-px">
          <TabsList
            variant="line"
            className="h-11 w-full scrollbar-none justify-start gap-4 overflow-x-auto p-0 sm:gap-8"
          >
            {effectiveOwnerMode ? (
              /* OWNER TABS (Matching Mockup 2) */
              <>
                <TabsTrigger
                  value="following"
                  className="data-[state=active]:text-primary after:bg-primary relative px-1 py-2 text-sm font-bold transition-colors after:bottom-0 after:h-0.5 sm:text-base"
                >
                  Đang theo dõi ({initialFollowed.length})
                </TabsTrigger>
                <TabsTrigger
                  value="liked"
                  className="data-[state=active]:text-primary after:bg-primary relative px-1 py-2 text-sm font-bold transition-colors after:bottom-0 after:h-0.5 sm:text-base"
                >
                  Đã yêu thích ({initialLikedWorks.length})
                </TabsTrigger>
                <TabsTrigger
                  value="collections"
                  className="data-[state=active]:text-primary after:bg-primary relative px-1 py-2 text-sm font-bold transition-colors after:bottom-0 after:h-0.5 sm:text-base"
                >
                  Bộ sưu tập ({initialCollections.length})
                </TabsTrigger>
                {initialAlbums.length > 0 && (
                  <TabsTrigger
                    value="albums"
                    className="data-[state=active]:text-primary after:bg-primary relative px-1 py-2 text-sm font-bold transition-colors after:bottom-0 after:h-0.5 sm:text-base"
                  >
                    Tác phẩm của tôi ({initialAlbums.length})
                  </TabsTrigger>
                )}
                <TabsTrigger
                  value="about"
                  className="data-[state=active]:text-primary after:bg-primary relative px-1 py-2 text-sm font-bold transition-colors after:bottom-0 after:h-0.5 sm:text-base"
                >
                  Giới thiệu
                </TabsTrigger>
              </>
            ) : (
              /* VISITOR TABS (Matching Mockup 1) */
              <>
                <TabsTrigger
                  value="albums"
                  className="data-[state=active]:text-primary after:bg-primary relative px-1 py-2 text-sm font-bold transition-colors after:bottom-0 after:h-0.5 sm:text-base"
                >
                  Tất cả Album ({profile.stats.albumsCount})
                </TabsTrigger>
                <TabsTrigger
                  value="characters"
                  className="data-[state=active]:text-primary after:bg-primary relative px-1 py-2 text-sm font-bold transition-colors after:bottom-0 after:h-0.5 sm:text-base"
                >
                  Nhân vật & Series ({profile.stats.charactersCount})
                </TabsTrigger>
                <TabsTrigger
                  value="about"
                  className="data-[state=active]:text-primary after:bg-primary relative px-1 py-2 text-sm font-bold transition-colors after:bottom-0 after:h-0.5 sm:text-base"
                >
                  Giới thiệu
                </TabsTrigger>
              </>
            )}
          </TabsList>
        </div>

        {/* OWNER VIEW: Clean full-width tabs layout without redundant sidebar widget */}
        {effectiveOwnerMode ? (
          <div className="space-y-6">
            {/* Tab: Following */}
            <TabsContent
              value="following"
              className="mt-0 focus-visible:outline-none"
            >
              <ProfileFollowed initialFollowed={initialFollowed} />
            </TabsContent>

            {/* Tab: Liked Works */}
            <TabsContent
              value="liked"
              className="mt-0 focus-visible:outline-none"
            >
              <ProfileLikedWorks initialLikedWorks={initialLikedWorks} />
            </TabsContent>

            {/* Tab: Collections */}
            <TabsContent
              value="collections"
              className="mt-0 focus-visible:outline-none"
            >
              <ProfileSavedCollections
                initialCollections={initialCollections}
              />
            </TabsContent>

            {/* Tab: Albums */}
            <TabsContent
              value="albums"
              className="mt-0 focus-visible:outline-none"
            >
              <ProfileAlbums
                albums={initialAlbums}
                cosplayerName={profile.name}
              />
            </TabsContent>

            {/* Tab: About */}
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
            {/* Tab 1: Albums */}
            <TabsContent
              value="albums"
              className="mt-0 focus-visible:outline-none"
            >
              <ProfileAlbums
                albums={initialAlbums}
                cosplayerName={profile.name}
              />
            </TabsContent>

            {/* Tab 2: Characters & Series */}
            <TabsContent
              value="characters"
              className="mt-0 focus-visible:outline-none"
            >
              <ProfileCharacters characters={initialCharacters} />
            </TabsContent>

            {/* Tab 3: About */}
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
