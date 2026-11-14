"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileHero } from "./profile-hero";
import { ProfileAlbums } from "./profile-albums";
import { ProfileCharacters } from "./profile-characters";
import { ProfileAbout } from "./profile-about";
import {
  KIRIKO_PROFILE,
  KIRIKO_ALBUMS,
  KIRIKO_CHARACTERS,
} from "./profile-data";
import {
  CosplayerProfileData,
  CosplayerAlbum,
  CosplayerCharacter,
} from "./profile-types";

interface CosplayerProfileViewProps {
  initialProfile?: CosplayerProfileData;
  initialAlbums?: CosplayerAlbum[];
  initialCharacters?: CosplayerCharacter[];
}

export function CosplayerProfileView({
  initialProfile = KIRIKO_PROFILE,
  initialAlbums = KIRIKO_ALBUMS,
  initialCharacters = KIRIKO_CHARACTERS,
}: CosplayerProfileViewProps) {
  const [activeTab, setActiveTab] = useState("albums");

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* 1. Hero Section: Panoramic Cover, Circular Avatar, Bio, Follow/Message */}
      <ProfileHero profile={initialProfile} />

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
            <TabsTrigger
              value="albums"
              className="data-[state=active]:text-primary after:bg-primary relative px-1 py-2 text-sm font-bold transition-colors after:bottom-0 after:h-0.5 sm:text-base"
            >
              Tất cả Album ({initialProfile.stats.albumsCount})
            </TabsTrigger>
            <TabsTrigger
              value="characters"
              className="data-[state=active]:text-primary after:bg-primary relative px-1 py-2 text-sm font-bold transition-colors after:bottom-0 after:h-0.5 sm:text-base"
            >
              Nhân vật & Series ({initialProfile.stats.charactersCount})
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="data-[state=active]:text-primary after:bg-primary relative px-1 py-2 text-sm font-bold transition-colors after:bottom-0 after:h-0.5 sm:text-base"
            >
              Giới thiệu
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Albums */}
        <TabsContent value="albums" className="mt-0 focus-visible:outline-none">
          <ProfileAlbums
            albums={initialAlbums}
            cosplayerName={initialProfile.name}
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
        <TabsContent value="about" className="mt-0 focus-visible:outline-none">
          <ProfileAbout profile={initialProfile} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
