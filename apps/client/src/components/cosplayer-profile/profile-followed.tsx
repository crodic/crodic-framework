"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FollowUserResDto } from "@/services/social";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { toggleFollow as toggleFollowApi } from "@/services/social";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ProfileFollowedProps {
  initialFollowed: FollowUserResDto[];
}

export function ProfileFollowed({ initialFollowed }: ProfileFollowedProps) {
  const t = useTranslations("Profile");
  const tCos = useTranslations("CosplayerProfile");
  const queryClient = useQueryClient();
  const [followedList, setFollowedList] =
    useState<FollowUserResDto[]>(initialFollowed);
  const [unfollowedIds, setUnfollowedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (initialFollowed) {
      setFollowedList(initialFollowed);
      setUnfollowedIds(new Set());
    }
  }, [initialFollowed]);

  const handleToggleFollow = async (id: string, name: string) => {
    try {
      const res = await toggleFollowApi(id);
      setUnfollowedIds((prev) => {
        const next = new Set(prev);
        if (res.following) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
      await queryClient.invalidateQueries({ queryKey: ["my-following"] });
      await queryClient.invalidateQueries({
        queryKey: ["my-cosplayer-profile"],
      });
      if (res.following) {
        toast.success(tCos("followedSuccess", { name }));
      } else {
        toast.info(tCos("unfollowedSuccess", { name }));
      }
    } catch {
      toast.error(tCos("followError"));
    }
  };

  const activeCount = followedList.filter(
    (f) => !unfollowedIds.has(f.id)
  ).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs sm:text-sm">
          {t("followingCountText", { count: activeCount })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {followedList.map((user) => {
          const isFollowing = !unfollowedIds.has(user.id);
          const slug = user.handle?.replace(/^@/, "").trim() || user.id;

          return (
            <div
              key={user.id}
              className="group border-border/70 bg-card hover:border-border relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 shadow-xs transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <Link
                  href={`/cosplayer/${slug}`}
                  className="relative block shrink-0"
                >
                  <div className="border-background bg-muted ring-primary/40 group-hover:ring-primary relative size-14 shrink-0 overflow-hidden rounded-full border-2 shadow-md ring-2 transition-all">
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt={user.displayName}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="bg-primary/20 text-primary flex size-full items-center justify-center font-bold">
                        {user.displayName.slice(0, 1)}
                      </div>
                    )}
                  </div>
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/cosplayer/${slug}`}
                    className="group/name block space-y-0.5 truncate"
                  >
                    <h4 className="text-foreground group-hover/name:text-primary truncate text-sm font-bold tracking-tight transition-colors">
                      {user.displayName}
                    </h4>
                    {user.handle && (
                      <p className="text-muted-foreground truncate text-xs font-medium">
                        @{user.handle.replace(/^@/, "")}
                      </p>
                    )}
                  </Link>
                </div>
              </div>

              {/* Follow Button */}
              <div className="pt-4">
                <Button
                  type="button"
                  variant={isFollowing ? "outline" : "default"}
                  onClick={() => handleToggleFollow(user.id, user.displayName)}
                  className={cn(
                    "h-8.5 w-full cursor-pointer rounded-xl text-xs font-semibold transition-all",
                    isFollowing
                      ? "border-border/80 text-muted-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                  )}
                >
                  {isFollowing ? (
                    <>
                      <Check className="text-primary mr-1.5 size-3.5" />
                      <span>{tCos("followingBtn")}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="mr-1.5 size-3.5" />
                      <span>{tCos("followBtn")}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
