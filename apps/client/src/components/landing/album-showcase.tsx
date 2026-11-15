import React from "react";
import { ALBUM_SHOWCASE } from "./landing-data";
import { AlbumCard } from "./album-card";

export function AlbumShowcase() {
  return (
    <section id="albums" className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-6 flex items-center justify-between sm:mb-8">
          <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            Khám Phá Album
          </h2>
        </div>

        {/* 4 Album Cards Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {ALBUM_SHOWCASE.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      </div>
    </section>
  );
}
