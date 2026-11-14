"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  BadgeCheck,
  Check,
  Heart,
  MessageCircle,
  MoreVertical,
  Plus,
  Share2,
  Flag,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { CosplayerProfileData } from "./profile-types";

interface ProfileHeroProps {
  profile: CosplayerProfileData;
}

export function ProfileHero({ profile }: ProfileHeroProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [likesCount, setLikesCount] = useState(85.2);
  const [hasLiked, setHasLiked] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleToggleFollow = () => {
    setIsFollowing((prev) => !prev);
  };

  const handleToggleLike = () => {
    if (hasLiked) {
      setLikesCount((prev) => Number((prev - 0.1).toFixed(1)));
      setHasLiked(false);
    } else {
      setLikesCount((prev) => Number((prev + 0.1).toFixed(1)));
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

  return (
    <section className="relative w-full">
      {/* 1. Panoramic Cover Banner */}
      <div className="bg-muted/40 border-border/40 relative h-44 w-full overflow-hidden rounded-2xl border shadow-sm sm:h-56 sm:rounded-3xl md:h-72 lg:h-80">
        <Image
          src={profile.coverUrl}
          alt={`${profile.name} Cover Banner`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1440px) 100vw, 1440px"
          className="object-cover object-center"
        />
        {/* Subtle dark gradient overlay at top/bottom for contrast */}
        <div className="from-background/90 to-background/20 absolute inset-0 bg-gradient-to-t via-transparent" />
      </div>

      {/* 2. Profile Details & Overlapping Avatar */}
      <div className="relative px-2 sm:px-6 md:px-8">
        <div className="-mt-16 mb-4 flex flex-col gap-4 sm:-mt-20 md:-mt-22 md:flex-row md:items-end md:justify-between">
          {/* Left Column: Avatar + Cosplayer Details */}
          <div className="flex flex-col items-center gap-3.5 text-center sm:gap-5 md:flex-row md:items-end md:text-left">
            {/* Glowing Ring Avatar */}
            <div className="bg-background ring-primary/80 dark:ring-primary shadow-primary/20 relative size-28 shrink-0 rounded-full p-1 shadow-xl ring-4 sm:size-32 md:size-36">
              <div className="relative size-full overflow-hidden rounded-full">
                <Image
                  src={profile.avatarUrl}
                  alt={profile.name}
                  fill
                  sizes="144px"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Name, Handle, Location & Bio */}
            <div className="space-y-1 pt-1 sm:space-y-1.5 md:pt-0">
              <div className="flex items-center justify-center gap-2 md:justify-start">
                <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {profile.name}
                </h1>
                {profile.isVerified && (
                  <BadgeCheck
                    className="size-6 shrink-0 fill-sky-400 text-sky-400"
                    aria-label="Verified Cosplayer"
                  />
                )}
              </div>

              {/* Handle & Location */}
              <p className="text-muted-foreground flex items-center justify-center gap-1.5 text-xs font-medium sm:text-sm md:justify-start">
                <span>{profile.handle}</span>
                <span className="text-muted-foreground/60">•</span>
                <span>{profile.location}</span>
              </p>

              {/* Short Bio */}
              <p className="text-foreground/80 line-clamp-2 max-w-xl text-xs sm:text-sm md:line-clamp-none">
                {profile.bio}
              </p>

              {/* Stats Bar */}
              <div className="text-foreground/90 flex items-center justify-center gap-2 pt-1 text-xs font-medium sm:text-sm md:justify-start">
                <span>
                  <strong className="text-foreground font-bold">
                    {profile.stats.followersCount}
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
                    {likesCount}K
                  </strong>{" "}
                  <span className="text-muted-foreground">Likes</span>
                </button>
                <span className="text-muted-foreground/40">•</span>
                <span>
                  <strong className="text-foreground font-bold">
                    {profile.stats.albumsCount}
                  </strong>{" "}
                  <span className="text-muted-foreground">Albums</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Action Buttons */}
          <div className="mt-2 flex w-full items-center justify-center gap-2.5 md:mt-0 md:w-auto md:justify-end">
            {/* Follow / Unfollow Button */}
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

            {/* Message Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsMessageOpen(true)}
              className="border-border/80 hover:bg-accent h-10 flex-1 rounded-xl px-4 font-medium transition-colors md:flex-initial"
            >
              <MessageCircle className="text-primary mr-1.5 size-4" />
              Nhắn tin
            </Button>

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
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
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
                        title: `${profile.name} - Cosplayer Profile`,
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
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    window.open(profile.contact.facebook, "_blank")
                  }
                  className="cursor-pointer"
                >
                  <ExternalLink className="mr-2 size-4" />
                  Trang cá nhân ngoài
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                  <Flag className="mr-2 size-4" />
                  Báo cáo tài khoản
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="text-primary size-5" />
              Gửi tin nhắn đến {profile.name}
            </DialogTitle>
            <DialogDescription>
              Liên hệ trao đổi về dự án cosplay, booking sự kiện hoặc giao lưu
              nghệ thuật.
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
                ✓ Tin nhắn đã được gửi thành công đến {profile.name}!
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
    </section>
  );
}
