import React from "react";
import { HIGHLIGHT_FEATURES } from "./landing-data";
import { FolderHeart, Search, Users } from "lucide-react";

export function FeaturesHighlight() {
  const getFeatureIcon = (iconName?: string) => {
    switch (iconName) {
      case "folder":
        return <FolderHeart className="text-primary size-5" />;
      case "search":
        return <Search className="text-primary size-5" />;
      case "users":
        return <Users className="text-primary size-5" />;
      default:
        return <FolderHeart className="text-primary size-5" />;
    }
  };

  return (
    <section id="features" className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <h2 className="text-foreground mb-6 text-2xl font-bold tracking-tight sm:mb-8 sm:text-3xl">
          Tính năng nổi bật
        </h2>

        {/* 3 Highlight Cards Grid */}
        <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-3">
          {HIGHLIGHT_FEATURES.map((feature) => (
            <div
              key={feature.id}
              className="group border-primary/35 bg-card/40 hover:border-primary/80 hover:bg-card/70 hover:shadow-primary/10 relative flex flex-col justify-between rounded-2xl border p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-lg sm:p-7"
            >
              {/* Subtle top ambient glow inside card */}
              <div
                className="from-primary/10 pointer-events-none absolute inset-x-0 top-0 h-24 rounded-t-2xl bg-gradient-to-b to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden="true"
              />

              <div className="relative">
                {/* Optional mini icon badge */}
                <div className="border-primary/25 bg-primary/10 mb-4 inline-flex size-10 items-center justify-center rounded-xl border shadow-2xs">
                  {getFeatureIcon(feature.iconName)}
                </div>

                <h3 className="text-foreground group-hover:text-primary text-lg font-bold tracking-tight transition-colors">
                  {feature.title}
                </h3>

                <p className="text-muted-foreground mt-2.5 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Bottom decorative accent line */}
              <div
                className="bg-primary/30 group-hover:bg-primary mt-6 h-0.5 w-8 rounded-full transition-all duration-300 group-hover:w-16"
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
