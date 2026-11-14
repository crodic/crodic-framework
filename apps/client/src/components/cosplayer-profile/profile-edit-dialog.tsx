"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Camera, Check, Link as LinkIcon, Sparkles } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CosplayerProfileData } from "./profile-types";

const profileEditSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên hiển thị"),
  handle: z.string().min(1, "Vui lòng nhập tên người dùng (handle)"),
  bio: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  twitter: z.string().optional(),
});

type ProfileEditFormValues = z.infer<typeof profileEditSchema>;

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
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [coverUrl, setCoverUrl] = useState(profile.coverUrl);
  const [isSaved, setIsSaved] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileEditFormValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      name: profile.name,
      handle: profile.handle,
      bio: profile.bio || "",
      facebook: profile.contact.facebook || "",
      instagram: profile.contact.instagram || "",
      tiktok: profile.contact.tiktok || "",
      twitter: profile.contact.twitter || "",
    },
  });

  useEffect(() => {
    form.reset({
      name: profile.name,
      handle: profile.handle,
      bio: profile.bio || "",
      facebook: profile.contact.facebook || "",
      instagram: profile.contact.instagram || "",
      tiktok: profile.contact.tiktok || "",
      twitter: profile.contact.twitter || "",
    });
    setAvatarUrl(profile.avatarUrl);
    setCoverUrl(profile.coverUrl);
  }, [profile, form]);

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

  const onSubmit = (values: ProfileEditFormValues) => {
    onSave({
      name: values.name,
      handle: values.handle,
      bio: values.bio,
      avatarUrl,
      coverUrl,
      contact: {
        ...profile.contact,
        facebook: values.facebook,
        instagram: values.instagram,
        tiktok: values.tiktok,
        twitter: values.twitter,
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

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 pt-2"
          >
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
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-muted-foreground text-xs font-semibold">
                      Tên hiển thị
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ví dụ: Hải Anh"
                        className="h-10 rounded-xl text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="handle"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-muted-foreground text-xs font-semibold">
                      Tên người dùng (Handle)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="@haianh_fan"
                        className="h-10 rounded-xl text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {/* 3. Bio */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-muted-foreground text-xs font-semibold">
                    Tiểu sử / Bio
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Viết một đoạn ngắn giới thiệu về bạn, fandom yêu thích..."
                      rows={3}
                      className="resize-none rounded-xl text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* 4. Social Links */}
            <div className="space-y-2 pt-1">
              <FormLabel className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold">
                <LinkIcon className="text-primary size-3.5" />
                <span>Liên kết mạng xã hội</span>
              </FormLabel>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Link Facebook cá nhân"
                          className="h-9 rounded-xl text-xs"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Link Instagram (@username)"
                          className="h-9 rounded-xl text-xs"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tiktok"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Link TikTok (@username)"
                          className="h-9 rounded-xl text-xs"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Link Twitter / X"
                          className="h-9 rounded-xl text-xs"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
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
                className="bg-primary text-primary-foreground cursor-pointer rounded-xl px-6 font-semibold"
              >
                {isSaved ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
