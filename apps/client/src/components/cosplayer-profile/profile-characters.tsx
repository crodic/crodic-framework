"use client";

import React from "react";
import Image from "next/image";
import { Images, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CosplayerCharacter } from "./profile-types";

interface ProfileCharactersProps {
  characters: CosplayerCharacter[];
}

export function ProfileCharacters({ characters }: ProfileCharactersProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs sm:text-sm">
          Tổng cộng{" "}
          <strong className="text-foreground">
            {characters.length} nhân vật
          </strong>{" "}
          & series đã hoàn thành
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {characters.map((char) => (
          <div
            key={char.id}
            className="group relative flex cursor-pointer flex-col space-y-2 overflow-hidden rounded-2xl"
          >
            {/* Character Thumbnail Container */}
            <div className="bg-muted/40 border-border/40 group-hover:border-primary/50 relative aspect-[3/4] w-full overflow-hidden rounded-xl border shadow-xs transition-all group-hover:shadow-md sm:rounded-2xl">
              <Image
                src={char.coverImage}
                alt={char.characterName}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Gradient Bottom Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Photos count */}
              <div className="absolute top-2.5 right-2.5 z-10">
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 rounded-md border-white/10 bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-md sm:text-xs"
                >
                  <Images className="size-3" />
                  <span>{char.photosCount} photos</span>
                </Badge>
              </div>

              {/* Character & Series Info over bottom of image */}
              <div className="absolute inset-x-3 bottom-3 space-y-0.5 text-white">
                <span className="text-primary-foreground/90 bg-primary/70 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold backdrop-blur-xs sm:text-xs">
                  <Star className="size-2.5" />
                  {char.series}
                </span>
                <h3 className="truncate text-sm font-bold text-white drop-shadow-sm sm:text-base">
                  {char.characterName}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
