"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  BadgeCheck,
  Camera,
  Check,
  Copy,
  ExternalLink,
  Eye,
  Flag,
  Heart,
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
import type { CosplayerDetailResDto } from "@/services/cosplayer";
import { ProfileEditDialog } from "./profile-edit-dialog";

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
  const [isFollowing, setIsFollowing] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(profile.totalLikesCount || 0);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const coverFileRef = useRef<HTMLInputElement>(null);
  const avatarFileRef = useRef<HTMLInputElement>(null);

  const isOwnerView = isOwner && viewMode === "owner";

  const handleToggleFollow = () => {
    setIsFollowing((prev) => !prev);
  };

  const handleToggleLike = () => {
    if (hasLiked) {
      setLikesCount((prev) => prev - 1);
      setHasLiked(false);
    } else {
      setLikesCount((prev) => prev + 1);
      setHasLiked(true);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setMessageSent(true);
    setTimeout(() => {
      setMessageSent(false);
      setMessageText("");
      setIsMessageOpen(false);
    }, 1500);
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
    if (file && onProfileUpdate) {
      const tempUrl = URL.createObjectURL(file);
      onProfileUpdate({ coverUrl: tempUrl });
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onProfileUpdate) {
      const tempUrl = URL.createObjectURL(file);
      onProfileUpdate({ avatarUrl: tempUrl });
    }
  };

  const formattedFollowers =
    profile.followersCount >= 1000
      ? `${(profile.followersCount / 1000).toFixed(1)}k`
      : String(profile.followersCount || 0);

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
              Bạn đang xem trang cá nhân dưới dạng khách xem (View as visitor).
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onToggleViewMode}
            className="bg-background h-7 rounded-lg px-2.5 text-xs font-semibold"
          >
            Quay lại chế độ chính chủ
          </Button>
        </div>
      )}

      {/* 1. Panoramic Cover Banner */}
      <div className="group/cover bg-muted/40 border-border/40 relative h-44 w-full overflow-hidden rounded-2xl border shadow-sm sm:h-56 sm:rounded-3xl md:h-72 lg:h-80">
        <Image
          src={profile.coverUrl || "/landing/hero-banner.png"}
          alt={`${profile.displayName} Cover Banner`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1440px) 100vw, 1440px"
          className="object-cover object-center"
        />
        <div className="from-background/90 to-background/20 absolute inset-0 bg-gradient-to-t via-transparent" />

        {/* Owner Action: Change Cover Photo */}
        {isOwnerView && (
          <div className="absolute top-3 right-3 z-20 sm:top-4 sm:right-4">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => coverFileRef.current?.click()}
              className="h-8 cursor-pointer gap-1.5 rounded-xl border border-white/10 bg-black/60 px-3 text-xs font-semibold text-white shadow-md backdrop-blur-md hover:bg-black/85"
            >
              <Camera className="size-3.5" />
              <span className="hidden sm:inline">Chỉnh sửa ảnh bìa</span>
            </Button>
            <input
              ref={coverFileRef}
              type="file"
              accept="image/*"
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
                  onClick={() => avatarFileRef.current?.click()}
                  className="absolute inset-1 flex cursor-pointer items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-xs transition-opacity group-hover/avatar:opacity-100 hover:bg-black/85"
                  aria-label="Thay đổi ảnh đại diện"
                >
                  <Camera className="size-5" />
                </button>
              )}
              <input
                ref={avatarFileRef}
                type="file"
                accept="image/*"
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
                    aria-label="Đã xác minh"
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
                  <span className="text-muted-foreground">Followers</span>
                </span>
                <span className="text-muted-foreground/40">•</span>
                <button
                  type="button"
                  onClick={handleToggleLike}
                  className="inline-flex items-center gap-1 transition-colors hover:text-rose-500"
                >
                  <Heart
                    className={`size-3.5 ${
                      hasLiked
                        ? "fill-rose-500 text-rose-500"
                        : "text-muted-foreground"
                    }`}
                  />
                  <strong className="text-foreground font-bold">
                    {formattedLikes}
                  </strong>{" "}
                  <span className="text-muted-foreground">Likes</span>
                </button>
                <span className="text-muted-foreground/40">•</span>
                <span>
                  <strong className="text-foreground font-bold">
                    {profile.albumsCount}
                  </strong>{" "}
                  <span className="text-muted-foreground">Albums</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Actions */}
          <div className="mt-2 flex w-full items-center justify-center gap-2.5 md:mt-0 md:w-auto md:justify-end">
            {isOwnerView ? (
              /* OWNER ACTIONS */
              <>
                <Button
                  type="button"
                  onClick={() => setIsEditDialogOpen(true)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 flex-1 gap-1.5 rounded-xl px-4 font-semibold shadow-sm md:flex-initial"
                >
                  <Pencil className="size-4" />
                  <span>Chỉnh sửa trang cá nhân</span>
                </Button>

                {onToggleViewMode && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onToggleViewMode}
                    className="border-border/80 hover:bg-accent h-10 gap-1.5 rounded-xl px-3 text-xs font-medium"
                    title="Xem trang với tư cách khách vãng lai"
                  >
                    <Eye className="size-4" />
                    <span className="hidden sm:inline">Xem dạng khách</span>
                  </Button>
                )}

                <Button
                  asChild
                  variant="outline"
                  size="icon"
                  className="border-border/80 size-10 shrink-0 rounded-xl"
                  aria-label="Cài đặt tài khoản"
                >
                  <Link href="/settings">
                    <Settings className="size-4" />
                  </Link>
                </Button>
              </>
            ) : (
              /* VISITOR ACTIONS */
              <>
                <Button
                  type="button"
                  onClick={handleToggleFollow}
                  className={`h-10 flex-1 rounded-xl px-5 font-semibold shadow-sm transition-all md:flex-initial ${
                    isFollowing
                      ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border border"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Check className="mr-1.5 size-4" />
                      Đang theo dõi
                    </>
                  ) : (
                    <>
                      <Plus className="mr-1.5 size-4" />
                      Theo dõi
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsMessageOpen(true)}
                  className="border-border/80 hover:bg-accent h-10 flex-1 rounded-xl px-4 font-medium transition-colors md:flex-initial"
                >
                  <MessageCircle className="text-primary mr-1.5 size-4" />
                  Nhắn tin
                </Button>
              </>
            )}

            {/* Dropdown More Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="border-border/80 size-10 shrink-0 rounded-xl"
                  aria-label="Tùy chọn khác"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-xl">
                <DropdownMenuItem
                  onClick={handleCopyProfileUrl}
                  className="cursor-pointer"
                >
                  <Copy className="mr-2 size-4" />
                  {copiedLink ? "Đã sao chép link!" : "Sao chép liên kết"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `${profile.displayName} - Profile`,
                        url: window.location.href,
                      });
                    } else {
                      handleCopyProfileUrl();
                    }
                  }}
                  className="cursor-pointer"
                >
                  <Share2 className="mr-2 size-4" />
                  Chia sẻ hồ sơ
                </DropdownMenuItem>
                {profile.facebookUrl && (
                  <DropdownMenuItem
                    onClick={() => window.open(profile.facebookUrl!, "_blank")}
                    className="cursor-pointer"
                  >
                    <ExternalLink className="mr-2 size-4" />
                    Trang Facebook ngoài
                  </DropdownMenuItem>
                )}
                {!isOwner && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                      <Flag className="mr-2 size-4" />
                      Báo cáo tài khoản
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
              Gửi tin nhắn đến {profile.displayName}
            </DialogTitle>
            <DialogDescription>
              Liên hệ trao đổi về dự án cosplay, sự kiện hoặc giao lưu nghệ
              thuật.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendMessage} className="space-y-4 pt-2">
            <Textarea
              placeholder="Nhập nội dung tin nhắn hoặc thông tin dự án..."
              rows={4}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="resize-none rounded-xl"
              required
            />

            {messageSent ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-center text-sm font-medium text-emerald-500">
                ✓ Tin nhắn đã được gửi thành công đến {profile.displayName}!
              </div>
            ) : null}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsMessageOpen(false)}
                className="rounded-xl"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={!messageText.trim() || messageSent}
                className="bg-primary text-primary-foreground rounded-xl font-semibold"
              >
                Gửi tin nhắn
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
