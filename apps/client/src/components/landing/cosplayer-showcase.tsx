import React from "react";
import { FEATURED_COSPLAYERS } from "./landing-data";
import { CosplayerCard } from "./cosplayer-card";

export function CosplayerShowcase() {
  return (
    <section id="cosplayers" className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-6 flex items-center justify-between sm:mb-8">
          <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            Cosplayer Nổi Bật Tuần Này
          </h2>
        </div>

        {/* Cosplayer Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {FEATURED_COSPLAYERS.map((cosplayer) => (
            <CosplayerCard key={cosplayer.id} cosplayer={cosplayer} />
          ))}
        </div>
      </div>
    </section>
  );
}
