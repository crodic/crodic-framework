"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
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
  MessageCircle,
  MoreVertical,
  Pencil,
  Plus,
  Settings,
  Award,
  Share2,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMessageFormSchema, type MessageFormValues } from "./schema";
import {
  uploadMyCover,
  uploadMyAvatar,
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

  const isOwnerView = isOwner && viewMode === "owner";
  const isSelf =
    isOwner ||
    (!!currentUser?.id &&
      !!profile.userId &&
      String(currentUser.id) === String(profile.userId));

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
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const coverFileRef = useRef<HTMLInputElement>(null);
  const avatarFileRef = useRef<HTMLInputElement>(null);

  const messageForm = useForm<MessageFormValues>({
    resolver: zodResolver(createMessageFormSchema(t)),
    defaultValues: {
      message: "",
    },
  });

  useEffect(() => {
    setFollowersCount(profile.followersCount || 0);
    setLikesCount(profile.totalLikesCount || 0);
  }, [profile.followersCount, profile.totalLikesCount]);

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

  const onSendMessageSubmit = (values: MessageFormValues) => {
    if (profile.contactEmail) {
      window.location.href = `mailto:${profile.contactEmail}?subject=${encodeURIComponent(
        tCos("contactEmailSubject")
      )}&body=${encodeURIComponent(values.message)}`;
      toast.success(t("sentSuccess"));
      messageForm.reset();
      setIsMessageOpen(false);
    } else {
      toast.info(t("sendMessageDesc"));
      setIsMessageOpen(false);
    }
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
      {/* Visitor Preview Banner (Visible when owner switches to visitor mode) */}
      {isOwner && viewMode === "visitor" && (
        <div className="bg-primary/10 border-primary/20 mb-4 flex items-center justify-between rounded-2xl border px-4 py-2 text-xs">
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
            className="bg-background h-7 cursor-pointer rounded-lg px-2.5 text-xs font-semibold"
          >
            {t("viewModeOwner")}
          </Button>
        </div>
      )}

      {/* 1. Panoramic Cover Banner */}
      <div className="group/cover bg-muted/40 border-border/40 relative h-44 w-full overflow-hidden rounded-2xl border shadow-sm sm:h-56 sm:rounded-3xl md:h-72 lg:h-80">
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
          <div className="from-primary/20 via-muted to-muted/60 size-full bg-gradient-to-r" />
        )}
        <div className="from-background/90 to-background/20 absolute inset-0 bg-gradient-to-t via-transparent" />

        {/* Owner Action: Change Cover Photo */}
        {isOwnerView && (
          <div className="absolute top-3 right-3 z-20 sm:top-4 sm:right-4">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={isUploadingCover}
              onClick={() => coverFileRef.current?.click()}
              className="h-8 cursor-pointer gap-1.5 rounded-xl border border-white/10 bg-black/60 px-3 text-xs font-semibold text-white shadow-md backdrop-blur-md hover:bg-black/85"
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
        <div className="-mt-16 mb-4 flex flex-col gap-4 sm:-mt-20 md:-mt-22 md:flex-row md:items-end md:justify-between">
          {/* Left Column: Avatar + Details */}
          <div className="flex flex-col items-center gap-3.5 text-center sm:gap-5 md:flex-row md:items-end md:text-left">
            {/* Avatar with Camera badge for owner */}
            <div className="group/avatar bg-background ring-primary/80 dark:ring-primary shadow-primary/20 relative size-28 shrink-0 rounded-full p-1 shadow-xl ring-4 sm:size-32 md:size-36">
              <div className="relative size-full overflow-hidden rounded-full">
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

            {/* Name, Handle, Badge & Stats */}
            <div className="space-y-1 pt-1 sm:space-y-1.5 md:pt-0">
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {profile.displayName}
                </h1>
                {profile.isVerified && (
                  <BadgeCheck
                    className="size-6 shrink-0 fill-sky-400 text-sky-400"
                    aria-label={tCos("verifiedBadge")}
                  />
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
              <p className="text-muted-foreground flex items-center justify-center gap-1.5 text-xs font-medium sm:text-sm md:justify-start">
                <span>{profile.handle}</span>
                {profile.locationLabel && (
                  <>
                    <span className="text-muted-foreground/60">•</span>
                    <span>{profile.locationLabel}</span>
                  </>
                )}
              </p>

              {/* Short Bio */}
              {profile.bio && (
                <p className="text-foreground/80 line-clamp-2 max-w-xl text-xs sm:text-sm md:line-clamp-none">
                  {profile.bio}
                </p>
              )}

              {/* Stats Bar */}
              <div className="text-foreground/90 flex items-center justify-center gap-2 pt-1 text-xs font-medium sm:text-sm md:justify-start">
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
            </div>
          </div>

          {/* Right Column: Actions */}
          <div className="mt-2 flex w-full flex-wrap items-center justify-end gap-2 sm:gap-2.5 md:mt-0 md:w-auto md:flex-nowrap">
            {isOwnerView ? (
              /* OWNER ACTIONS */
              <>
                <Button
                  type="button"
                  onClick={() => setIsEditDialogOpen(true)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 flex-1 gap-1.5 rounded-xl px-4 font-semibold shadow-sm sm:flex-initial"
                >
                  <Pencil className="size-4" />
                  <span>{t("editProfile")}</span>
                </Button>

                {onToggleViewMode && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onToggleViewMode}
                    className="border-border/80 hover:bg-accent h-10 cursor-pointer gap-1.5 rounded-xl px-3 text-xs font-medium"
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
                  className="border-border/80 size-10 shrink-0 rounded-xl"
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
                    className={`h-10 flex-1 cursor-pointer rounded-xl px-5 font-semibold shadow-sm transition-all sm:flex-initial ${
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

                {!isSelf && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsMessageOpen(true)}
                    className="border-border/80 hover:bg-accent h-10 flex-1 cursor-pointer rounded-xl px-4 font-medium transition-colors sm:flex-initial"
                  >
                    <MessageCircle className="text-primary mr-1.5 size-4" />
                    {t("sendMessage")}
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
                    <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
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

      {/* Send Message Modal (Visitor) */}
      <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="text-primary size-5" />
              {t("sendMessage")}
            </DialogTitle>
            <DialogDescription>{t("sendMessageDesc")}</DialogDescription>
          </DialogHeader>

          <Form {...messageForm}>
            <form
              onSubmit={messageForm.handleSubmit(onSendMessageSubmit)}
              className="space-y-4 pt-2"
            >
              <FormField
                control={messageForm.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder={t("sendMessagePlaceholder")}
                        rows={4}
                        className="resize-none rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsMessageOpen(false)}
                  className="rounded-xl"
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground cursor-pointer rounded-xl font-semibold"
                >
                  {t("send")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
