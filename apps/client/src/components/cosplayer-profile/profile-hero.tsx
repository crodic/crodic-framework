"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import { CosplayerApplicationDialog } from "@/components/cosplayer-application/cosplayer-application-dialog";
import { ReportDialog } from "@/components/common/report-dialog";
import {
  BadgeCheck,
  Camera,
  Check,
  Copy,
  ExternalLink,
  Eye,
  Flag,
  Heart,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Settings,
  Award,
  Share2,
  Hammer,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  uploadMyCover,
  uploadMyAvatar,
  requestCosplayerRole,
  type CosplayerDetailResDto,
} from "@/services/cosplayer";
import { toggleFollow, checkIsFollowing } from "@/services/social";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ProfileEditDialog } from "./profile-edit-dialog";
import { useTranslations } from "next-intl";
import { useProfile } from "@/hooks/use-profile";
import { useAuthStore } from "@/store/use-auth-store";

interface ProfileHeroProps {
  profile: CosplayerDetailResDto;
  isOwner?: boolean;
  onProfileUpdate?: (data: Partial<CosplayerDetailResDto>) => void;
  onToggleViewMode?: () => void;
  viewMode?: "owner" | "visitor";
}

export function ProfileHero({
  profile,
  isOwner = false,
  onProfileUpdate,
  onToggleViewMode,
  viewMode = "owner",
}: ProfileHeroProps) {
  const t = useTranslations("Profile");
  const tCos = useTranslations("CosplayerProfile");
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: currentUser } = useProfile();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const isAuthenticated = !isHydrating && !!accessToken;

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isOwnerView = Boolean(isOwner) && viewMode === "owner";
  const isSelf =
    Boolean(isOwner) ||
    Boolean(
      isMounted &&
      currentUser?.id &&
      profile.userId &&
      String(currentUser.id) === String(profile.userId)
    );

  // Check follow status with TanStack Query (no useEffect)
  const { data: followStatus = false, isLoading: isCheckingFollow } = useQuery({
    queryKey: ["is-following", profile.userId],
    queryFn: () => checkIsFollowing(profile.userId!),
    enabled: Boolean(isAuthenticated && !isSelf && profile.userId),
    staleTime: 1000 * 60 * 2,
  });

  const isFollowing = Boolean(followStatus);
  const [followersCount, setFollowersCount] = useState(
    profile.followersCount || 0
  );
  const [likesCount, setLikesCount] = useState(profile.totalLikesCount || 0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const coverFileRef = useRef<HTMLInputElement>(null);
  const avatarFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFollowersCount(profile.followersCount || 0);
    setLikesCount(profile.totalLikesCount || 0);
  }, [profile.followersCount, profile.totalLikesCount]);

  const requestRoleMutation = useMutation({
    mutationFn: requestCosplayerRole,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["my-cosplayer-profile"],
      });
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success(tCos("roleRequestSuccess"));
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || tCos("roleRequestError"));
    },
  });

  const followMutation = useMutation({
    mutationFn: (targetUserId: string) => toggleFollow(targetUserId),
    onSuccess: (res) => {
      setFollowersCount(res.followersCount);
      queryClient.setQueryData(["is-following", profile.userId], res.following);
      queryClient.invalidateQueries({
        queryKey: ["is-following", profile.userId],
      });
      queryClient.invalidateQueries({ queryKey: ["my-following"] });
      queryClient.invalidateQueries({ queryKey: ["my-cosplayer-profile"] });
      toast.success(
        res.following
          ? tCos("followedSuccess", { name: profile.displayName })
          : tCos("unfollowedSuccess", { name: profile.displayName })
      );
    },
    onError: () => {
      toast.error(tCos("followError"));
    },
  });

  const coverMutation = useMutation({
    mutationFn: uploadMyCover,
    onSuccess: async (res) => {
      if (onProfileUpdate) {
        onProfileUpdate({ coverUrl: res.coverUrl });
      }
      await queryClient.invalidateQueries({
        queryKey: ["my-cosplayer-profile"],
      });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success(tCos("editDialog.success"));
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message || err?.message || tCos("followError");
      toast.error(msg);
    },
  });

  const avatarMutation = useMutation({
    mutationFn: uploadMyAvatar,
    onSuccess: async (res) => {
      if (onProfileUpdate) {
        onProfileUpdate({ avatarUrl: res.avatarUrl });
      }
      await queryClient.invalidateQueries({
        queryKey: ["my-cosplayer-profile"],
      });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success(tCos("editDialog.success"));
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message || err?.message || tCos("followError");
      toast.error(msg);
    },
  });

  const isUploadingCover = coverMutation.isPending;
  const isUploadingAvatar = avatarMutation.isPending;
  const isFollowLoading = followMutation.isPending || isCheckingFollow;

  const handleToggleFollow = () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (!profile.userId || followMutation.isPending) return;
    followMutation.mutate(profile.userId);
  };

  const handleCopyProfileUrl = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    coverMutation.mutate(file);
    if (e.target) e.target.value = "";
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    avatarMutation.mutate(file);
    if (e.target) e.target.value = "";
  };

  const formattedFollowers =
    followersCount >= 1000
      ? `${(followersCount / 1000).toFixed(1)}k`
      : String(followersCount || 0);

  const formattedLikes =
    likesCount >= 1000
      ? `${(likesCount / 1000).toFixed(1)}k`
      : String(likesCount);

  return (
    <div className="relative">
      {/* Ambient Glow Backdrop for Cinematic Stage Effect */}
      {profile.coverUrl && (
        <div
          className="pointer-events-none absolute -inset-x-6 -top-8 -z-10 h-64 overflow-hidden opacity-25 blur-3xl transition-all duration-700 select-none sm:h-80 md:h-96 dark:opacity-35"
          style={{
            backgroundImage: `url(${profile.coverUrl})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
      )}

      {/* Visitor Preview Banner (Visible when owner switches to visitor mode) */}
      {isOwner && viewMode === "visitor" && (
        <div className="bg-primary/10 border-primary/20 mb-4 flex items-center justify-between rounded-xl border px-4 py-2 text-xs backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <Eye className="text-primary size-4" />
            <span className="text-foreground font-medium">
              {t("viewModeVisitor")}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onToggleViewMode}
            className="bg-background h-7 cursor-pointer px-2.5 text-xs font-semibold"
          >
            {t("viewModeOwner")}
          </Button>
        </div>
      )}

      {/* 1. Panoramic Cover Banner */}
      <div className="group/cover bg-muted/60 border-border/40 relative h-48 w-full overflow-hidden rounded-xl border shadow-sm sm:h-60 md:h-72 lg:h-80">
        {profile.coverUrl ? (
          <Image
            src={profile.coverUrl}
            alt={`${profile.displayName} Cover Banner`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1440px) 100vw, 1440px"
            className="object-cover object-center"
          />
        ) : (
          <div className="from-primary/10 via-muted to-primary/5 size-full bg-gradient-to-r" />
        )}
        {/* Cinematic Vignette Overlays */}
        <div className="from-background via-background/30 absolute inset-0 bg-gradient-to-t to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent opacity-60" />

        {/* Owner Action: Change Cover Photo */}
        {isOwnerView && (
          <div className="absolute top-3 right-3 z-20 sm:top-4 sm:right-4">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={isUploadingCover}
              onClick={() => coverFileRef.current?.click()}
              className="h-8 cursor-pointer gap-1.5 border border-white/10 bg-black/60 px-3 text-xs font-semibold text-white shadow-md backdrop-blur-md transition-all hover:bg-black/85"
            >
              {isUploadingCover ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Camera className="size-3.5" />
              )}
              <span className="hidden sm:inline">
                {isUploadingCover
                  ? tCos("editDialog.saving")
                  : tCos("editDialog.changeCover")}
              </span>
            </Button>
            <input
              ref={coverFileRef}
              type="file"
              accept="image/*"
              disabled={isUploadingCover}
              onChange={handleCoverUpload}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* 2. Profile Details & Overlapping Avatar */}
      <div className="relative px-2 sm:px-6 md:px-8">
        <div className="-mt-14 mb-4 flex flex-col gap-4 sm:-mt-16 md:-mt-20 lg:flex-row lg:items-end lg:justify-between">
          {/* Left Column: Avatar + Details */}
          <div className="flex min-w-0 flex-1 flex-col items-center gap-3.5 text-center sm:flex-row sm:items-end sm:gap-5 sm:text-left">
            {/* Avatar with Glow and Camera badge for owner */}
            <div className="group/avatar bg-background ring-background ring-offset-primary/20 relative size-24 shrink-0 rounded-full p-1 shadow-2xl ring-4 ring-offset-2 transition-all duration-300 sm:size-28 md:size-32">
              <div className="bg-muted relative size-full overflow-hidden rounded-full">
                {profile.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    fill
                    sizes="144px"
                    className="object-cover"
                  />
                ) : (
                  <div className="bg-primary/20 text-primary flex size-full items-center justify-center text-3xl font-bold">
                    {profile.displayName.slice(0, 1)}
                  </div>
                )}
              </div>

              {isOwnerView && (
                <button
                  type="button"
                  disabled={isUploadingAvatar}
                  onClick={() => avatarFileRef.current?.click()}
                  className={`absolute inset-1 flex cursor-pointer items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs transition-opacity hover:bg-black/85 ${
                    isUploadingAvatar
                      ? "opacity-100"
                      : "opacity-0 group-hover/avatar:opacity-100"
                  }`}
                  aria-label={tCos("editDialog.changeAvatar")}
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <Camera className="size-5" />
                  )}
                </button>
              )}
              <input
                ref={avatarFileRef}
                type="file"
                accept="image/*"
                disabled={isUploadingAvatar}
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            {/* Name, Handle, Badges & Stats */}
            <div className="min-w-0 flex-1 space-y-1.5 pt-1 sm:space-y-2 md:pt-0">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-foreground text-xl font-extrabold tracking-tight wrap-anywhere sm:text-2xl md:text-3xl">
                  {profile.displayName}
                </h1>
                {profile.isVerified && (
                  <div title={tCos("verifiedBadge")} className="inline-flex">
                    <BadgeCheck
                      className="size-5 shrink-0 fill-sky-400 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)] sm:size-6"
                      aria-label={tCos("verifiedBadge")}
                    />
                  </div>
                )}
                {profile.isCraftingCreator && (
                  <Badge
                    variant="outline"
                    className="rounded-lg border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-purple-500/15 px-2 py-0.5 text-xs font-semibold text-amber-600 shadow-xs dark:text-amber-300"
                  >
                    <Hammer className="mr-1 size-3 text-amber-500" />
                    Pro Crafter
                  </Badge>
                )}
                {profile.roleBadge && (
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/25 rounded-lg px-2 py-0.5 text-xs font-semibold"
                  >
                    <Award className="mr-1 size-3" />
                    {profile.roleBadge}
                  </Badge>
                )}
              </div>

              {/* Handle & Location */}
              <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-1.5 text-xs font-medium sm:justify-start sm:text-sm">
                <button
                  type="button"
                  onClick={handleCopyProfileUrl}
                  className="hover:text-foreground inline-flex cursor-pointer items-center gap-1 rounded-md px-1 py-0.5 transition-colors"
                  title={t("copyLink")}
                >
                  <span>{profile.handle}</span>
                  {copiedLink ? (
                    <Check className="size-3 text-emerald-500" />
                  ) : (
                    <Copy className="size-3 opacity-60 hover:opacity-100" />
                  )}
                </button>
                {profile.locationLabel && (
                  <>
                    <span className="text-muted-foreground/60">•</span>
                    <span>{profile.locationLabel}</span>
                  </>
                )}
              </div>

              {/* Short Bio */}
              {profile.bio && (
                <p className="text-foreground/85 line-clamp-2 max-w-2xl text-xs leading-relaxed sm:text-sm md:line-clamp-none">
                  {profile.bio}
                </p>
              )}

              {/* Stats Bar + Social Quick Links */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-xs sm:justify-start sm:text-sm">
                <div className="text-foreground/90 flex items-center gap-2 font-medium">
                  <span>
                    <strong className="text-foreground font-bold">
                      {formattedFollowers}
                    </strong>{" "}
                    <span className="text-muted-foreground">
                      {t("followers")}
                    </span>
                  </span>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="inline-flex items-center gap-1">
                    <Heart className="size-3.5 fill-rose-500 text-rose-500" />
                    <strong className="text-foreground font-bold">
                      {formattedLikes}
                    </strong>{" "}
                    <span className="text-muted-foreground">{t("likes")}</span>
                  </span>
                  <span className="text-muted-foreground/40">•</span>
                  <span>
                    <strong className="text-foreground font-bold">
                      {profile.albumsCount}
                    </strong>{" "}
                    <span className="text-muted-foreground">{t("albums")}</span>
                  </span>
                </div>

                {/* Social Quick Icons */}
                {(profile.facebookUrl ||
                  profile.instagramUrl ||
                  profile.tiktokUrl ||
                  profile.twitterUrl) && (
                  <div className="border-border/60 hidden items-center gap-1.5 border-l pl-2 sm:flex">
                    {profile.facebookUrl && (
                      <a
                        href={profile.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground p-1 transition-colors hover:text-blue-500"
                        title="Facebook"
                      >
                        <Facebook className="size-3.5" />
                      </a>
                    )}
                    {profile.instagramUrl && (
                      <a
                        href={profile.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground p-1 transition-colors hover:text-pink-500"
                        title="Instagram"
                      >
                        <Instagram className="size-3.5" />
                      </a>
                    )}
                    {profile.tiktokUrl && (
                      <a
                        href={profile.tiktokUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                        title="TikTok"
                      >
                        <svg
                          className="size-3.5 fill-current"
                          viewBox="0 0 24 24"
                        >
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
                        </svg>
                      </a>
                    )}
                    {profile.twitterUrl && (
                      <a
                        href={profile.twitterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                        title="X / Twitter"
                      >
                        <Twitter className="size-3.5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Actions */}
          <div className="mt-2 flex w-full items-center justify-center gap-2 sm:justify-start sm:gap-2.5 lg:mt-0 lg:w-auto lg:justify-end">
            {isOwnerView ? (
              /* OWNER ACTIONS */
              <>
                {!profile.isVerified && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsApplicationDialogOpen(true)}
                    className="border-primary/40 text-primary hover:bg-primary/10 h-10 min-w-0 gap-1.5 rounded-xl px-2.5 text-xs font-semibold sm:px-3.5 sm:text-sm"
                  >
                    <BadgeCheck className="size-4 shrink-0" />
                    <span className="truncate">{tCos("applyCosplayer")}</span>
                  </Button>
                )}

                <Button
                  type="button"
                  onClick={() => setIsEditDialogOpen(true)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 min-w-0 flex-initial gap-1.5 rounded-xl px-2.5 text-xs font-semibold shadow-sm sm:px-4 sm:text-sm"
                >
                  <Pencil className="size-4 shrink-0" />
                  <span className="truncate">{t("editProfile")}</span>
                </Button>

                {onToggleViewMode && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onToggleViewMode}
                    className="border-border/80 hover:bg-accent hidden h-10 cursor-pointer gap-1.5 rounded-xl px-3 text-xs font-medium sm:inline-flex"
                    title={t("viewModeVisitor")}
                  >
                    <Eye className="size-4" />
                    <span className="hidden sm:inline">
                      {t("viewModeVisitor")}
                    </span>
                  </Button>
                )}

                <Button
                  asChild
                  variant="outline"
                  size="icon"
                  className="border-border/80 hidden size-10 shrink-0 rounded-xl sm:inline-flex"
                  aria-label={t("settingsAria")}
                >
                  <Link href="/settings">
                    <Settings className="size-4" />
                  </Link>
                </Button>
              </>
            ) : (
              /* VISITOR ACTIONS */
              <>
                {!isSelf && (
                  <Button
                    type="button"
                    disabled={isFollowLoading}
                    onClick={handleToggleFollow}
                    className={`h-10 flex-initial cursor-pointer rounded-xl px-5 font-semibold shadow-sm transition-all ${
                      isFollowing
                        ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border border"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {isFollowLoading ? (
                      <Loader2 className="mr-1.5 size-4 animate-spin" />
                    ) : isFollowing ? (
                      <>
                        <Check className="mr-1.5 size-4" />
                        {tCos("followingBtn")}
                      </>
                    ) : (
                      <>
                        <Plus className="mr-1.5 size-4" />
                        {tCos("followBtn")}
                      </>
                    )}
                  </Button>
                )}

                {onToggleViewMode && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onToggleViewMode}
                    className="border-border/80 hover:bg-accent h-10 cursor-pointer gap-1.5 rounded-xl px-3 text-xs font-medium"
                    title={t("viewModeOwner")}
                  >
                    <Eye className="size-4" />
                    <span className="hidden sm:inline">
                      {t("viewModeOwner")}
                    </span>
                  </Button>
                )}
              </>
            )}

            {/* Dropdown More Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="border-border/80 size-10 shrink-0 cursor-pointer rounded-xl"
                  aria-label={t("optionsAria")}
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-xl">
                <DropdownMenuItem
                  onClick={handleCopyProfileUrl}
                  className="cursor-pointer"
                >
                  {copiedLink ? (
                    <Check className="mr-2 size-4 text-emerald-500" />
                  ) : (
                    <Copy className="mr-2 size-4" />
                  )}
                  {copiedLink ? t("copied") : t("copyLink")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (typeof navigator !== "undefined" && navigator.share) {
                      navigator
                        .share({
                          title: `${profile.displayName} - Kosume`,
                          url: window.location.href,
                        })
                        .catch(() => {});
                    } else {
                      handleCopyProfileUrl();
                    }
                  }}
                  className="cursor-pointer"
                >
                  <Share2 className="mr-2 size-4" />
                  {t("shareProfile")}
                </DropdownMenuItem>
                {isOwnerView && (
                  <>
                    <DropdownMenuSeparator className="sm:hidden" />
                    {onToggleViewMode && (
                      <DropdownMenuItem
                        onClick={onToggleViewMode}
                        className="cursor-pointer sm:hidden"
                      >
                        <Eye className="mr-2 size-4" />
                        {t("viewModeVisitor")}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => router.push("/settings")}
                      className="cursor-pointer sm:hidden"
                    >
                      <Settings className="mr-2 size-4" />
                      {t("settingsAria")}
                    </DropdownMenuItem>
                  </>
                )}
                {profile.facebookUrl && (
                  <DropdownMenuItem
                    onClick={() => window.open(profile.facebookUrl!, "_blank")}
                    className="cursor-pointer"
                  >
                    <ExternalLink className="mr-2 size-4" />
                    Facebook
                  </DropdownMenuItem>
                )}
                {!isOwner && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setIsReportDialogOpen(true)}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <Flag className="mr-2 size-4" />
                      {t("reportCosplayer")}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog Modal */}
      <ProfileEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        profile={profile}
        onSave={(data) => {
          if (onProfileUpdate) {
            onProfileUpdate(data);
          }
        }}
      />

      {/* Cosplayer Application Dialog */}
      <CosplayerApplicationDialog
        open={isApplicationDialogOpen}
        onOpenChange={setIsApplicationDialogOpen}
        initialStageName={profile.displayName}
        userEmail={profile.contactEmail || undefined}
      />

      {/* Report Profile Dialog */}
      <ReportDialog
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        targetType="user"
        targetId={String(profile.userId || profile.id)}
        targetTitle={profile.displayName}
      />
    </div>
  );
}
