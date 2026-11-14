"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Camera, Check, Link as LinkIcon, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CosplayerProfileData } from "./profile-types";

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: CosplayerProfileData;
  onSave: (updatedData: Partial<CosplayerProfileData>) => void;
}

export function ProfileEditDialog({
  open,
  onOpenChange,
  profile,
  onSave,
}: ProfileEditDialogProps) {
  const [name, setName] = useState(profile.name);
  const [handle, setHandle] = useState(profile.handle);
  const [bio, setBio] = useState(profile.bio);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [coverUrl, setCoverUrl] = useState(profile.coverUrl);
  const [facebook, setFacebook] = useState(profile.contact.facebook || "");
  const [instagram, setInstagram] = useState(profile.contact.instagram || "");
  const [tiktok, setTiktok] = useState(profile.contact.tiktok || "");
  const [twitter, setTwitter] = useState(profile.contact.twitter || "");
  const [isSaved, setIsSaved] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const tempUrl = URL.createObjectURL(file);
      setCoverUrl(tempUrl);
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const tempUrl = URL.createObjectURL(file);
      setAvatarUrl(tempUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      handle,
      bio,
      avatarUrl,
      coverUrl,
      contact: {
        ...profile.contact,
        facebook,
        instagram,
        tiktok,
        twitter,
      },
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-[calc(100%-1rem)] overflow-y-auto rounded-2xl p-4 sm:max-w-2xl sm:rounded-3xl sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Sparkles className="text-primary size-5" />
            Chỉnh sửa trang cá nhân
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* 1. Cover & Avatar Upload Preview Area */}
          <div className="relative">
            {/* Cover photo preview */}
            <div
              onClick={() => coverInputRef.current?.click()}
              className="group bg-muted/60 border-border/80 relative h-36 w-full cursor-pointer overflow-hidden rounded-2xl border sm:h-44"
            >
              <Image
                src={coverUrl}
                alt="Cover photo preview"
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover transition-all group-hover:brightness-75"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 text-xs font-semibold text-white opacity-0 backdrop-blur-xs transition-opacity group-hover:opacity-100">
                <Camera className="size-4" />
                <span>Thay đổi ảnh bìa (Cover photo)</span>
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverFileChange}
                className="hidden"
              />
            </div>

            {/* Avatar preview overlapping cover */}
            <div className="border-background bg-background ring-primary/40 group relative -mt-12 ml-4 size-24 cursor-pointer overflow-hidden rounded-full border-4 shadow-xl ring-4 sm:ml-6 sm:size-28">
              <Image
                src={avatarUrl}
                alt="Avatar preview"
                fill
                sizes="112px"
                className="object-cover transition-all group-hover:brightness-75"
              />
              <div
                onClick={() => avatarInputRef.current?.click()}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Camera className="mb-0.5 size-4" />
                <span>Đổi ảnh</span>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* 2. Display Name & Username */}
          <div className="grid grid-cols-1 gap-3.5 pt-1 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-muted-foreground text-xs font-semibold">
                Tên hiển thị
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Hải Anh"
                className="h-10 rounded-xl text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-muted-foreground text-xs font-semibold">
                Tên người dùng (Handle)
              </label>
              <Input
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@haianh_fan"
                className="h-10 rounded-xl text-sm"
                required
              />
            </div>
          </div>

          {/* 3. Bio */}
          <div className="space-y-1.5">
            <label className="text-muted-foreground text-xs font-semibold">
              Tiểu sử / Bio
            </label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Viết một đoạn ngắn giới thiệu về bạn, fandom yêu thích..."
              rows={3}
              className="resize-none rounded-xl text-sm"
            />
          </div>

          {/* 4. Social Links */}
          <div className="space-y-2 pt-1">
            <label className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold">
              <LinkIcon className="text-primary size-3.5" />
              <span>Liên kết mạng xã hội</span>
            </label>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <Input
                placeholder="Link Facebook cá nhân"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                className="h-9 rounded-xl text-xs"
              />
              <Input
                placeholder="Link Instagram (@username)"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="h-9 rounded-xl text-xs"
              />
              <Input
                placeholder="Link TikTok (@username)"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                className="h-9 rounded-xl text-xs"
              />
              <Input
                placeholder="Link Twitter / X"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                className="h-9 rounded-xl text-xs"
              />
            </div>
          </div>

          {isSaved && (
            <div className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-center text-xs font-semibold text-emerald-500">
              <Check className="size-4" />
              <span>Đã lưu thay đổi hồ sơ thành công!</span>
            </div>
          )}

          {/* 5. Footer Actions */}
          <DialogFooter className="gap-2 pt-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSaved}
              className="bg-primary text-primary-foreground rounded-xl px-6 font-semibold"
            >
              {isSaved ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
