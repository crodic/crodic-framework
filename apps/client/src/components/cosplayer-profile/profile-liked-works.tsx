"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Heart } from "lucide-react";
import { LikedWork } from "./profile-types";
import { useTranslations } from "next-intl";
import { toggleLikePost } from "@/services/posts";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ProfileLikedWorksProps {
  initialLikedWorks: LikedWork[];
}

export function ProfileLikedWorks({
  initialLikedWorks,
}: ProfileLikedWorksProps) {
  const t = useTranslations("Profile");
  const queryClient = useQueryClient();
  const [likedList, setLikedList] = useState<LikedWork[]>(initialLikedWorks);

  useEffect(() => {
    if (initialLikedWorks) {
      setLikedList(initialLikedWorks);
    }
  }, [initialLikedWorks]);

  const handleUnlike = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleLikePost(id);
      setLikedList((prev) => prev.filter((item) => item.id !== id));
      await queryClient.invalidateQueries({ queryKey: ["my-liked-posts"] });
      await queryClient.invalidateQueries({
        queryKey: ["public-featured-works"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["following-feed-posts"],
      });
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
      await queryClient.invalidateQueries({ queryKey: ["public-posts"] });
      await queryClient.invalidateQueries({ queryKey: ["public-feed-posts"] });
      await queryClient.invalidateQueries({ queryKey: ["explore-posts"] });
      toast.info(t("unlike"));
    } catch {
      // Keep state if failed
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs sm:text-sm">
          {t("likedCountText", { count: likedList.length })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {likedList.map((work) => {
          const postSlugOrId = encodeURIComponent(
            String(work.slug || work.id).trim()
          );
          return (
            <Link
              key={work.id}
              href={`/posts/${postSlugOrId}`}
              className="group relative flex cursor-pointer flex-col space-y-2 overflow-hidden rounded-2xl"
            >
              {/* Image Thumbnail */}
              <div className="bg-muted/40 border-border/40 group-hover:border-primary/50 relative aspect-[3/4] w-full overflow-hidden rounded-xl border shadow-xs transition-all group-hover:shadow-md sm:rounded-2xl">
                {work.coverImageUrl ? (
                  <Image
                    src={work.coverImageUrl}
                    alt={work.title}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    className="object-cover transition-opacity duration-300 group-hover:opacity-95"
                  />
                ) : (
                  <div className="bg-muted flex size-full items-center justify-center">
                    <Heart className="text-muted-foreground/40 size-8" />
                  </div>
                )}

                {/* Heart Badge (Click to unlike) */}
                <button
                  type="button"
                  onClick={(e) => handleUnlike(work.id, e)}
                  className="absolute top-2.5 right-2.5 z-10 flex size-7 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-black/60 backdrop-blur-md transition-all hover:bg-black/90"
                  aria-label={t("unlike")}
                >
                  <Heart className="size-3.5 fill-rose-500 text-rose-500" />
                </button>

                {/* Bottom Gradient Overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Author & Title over bottom */}
                <div className="absolute inset-x-2.5 bottom-2.5 space-y-0.5 text-white">
                  {work.author?.displayName && (
                    <span className="block truncate text-[10px] text-white/80">
                      {t("byAuthor", { name: work.author.displayName })}
                    </span>
                  )}
                  <h4 className="truncate text-xs font-bold text-white drop-shadow-sm sm:text-sm">
                    {work.title}
                  </h4>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {likedList.length === 0 && (
        <div className="text-muted-foreground py-16 text-center">
          <Heart className="mx-auto mb-2 size-8 opacity-40" />
          <p className="text-sm font-medium">{t("emptyAlbums")}</p>
        </div>
      )}
    </div>
  );
}
