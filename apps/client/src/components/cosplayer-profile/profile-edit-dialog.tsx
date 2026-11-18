"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { Camera, Check, Link as LinkIcon, User } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
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
import type { CosplayerDetailResDto } from "@/services/cosplayer";

const createProfileEditSchema = (t: (key: any) => string) =>
  z.object({
    displayName: z.string().min(1, t("valDisplayName")),
    handle: z.string().min(1, t("valHandle")),
    bio: z.string().optional(),
    facebookUrl: z.string().optional(),
    instagramUrl: z.string().optional(),
    tiktokUrl: z.string().optional(),
    twitterUrl: z.string().optional(),
  });

type ProfileEditFormValues = {
  displayName: string;
  handle: string;
  bio?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  twitterUrl?: string;
};

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: CosplayerDetailResDto;
  onSave: (updatedData: Partial<CosplayerDetailResDto>) => void;
}

export function ProfileEditDialog({
  open,
  onOpenChange,
  profile,
  onSave,
}: ProfileEditDialogProps) {
  const t = useTranslations("CosplayerProfile.editDialog");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || "");
  const [coverUrl, setCoverUrl] = useState(profile.coverUrl || "");
  const [isSaved, setIsSaved] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const profileEditSchema = useMemo(() => createProfileEditSchema(t), [t]);

  const form = useForm<ProfileEditFormValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      displayName: profile.displayName,
      handle: profile.handle,
      bio: profile.bio || "",
      facebookUrl: profile.facebookUrl || "",
      instagramUrl: profile.instagramUrl || "",
      tiktokUrl: profile.tiktokUrl || "",
      twitterUrl: profile.twitterUrl || "",
    },
  });

  useEffect(() => {
    form.reset({
      displayName: profile.displayName,
      handle: profile.handle,
      bio: profile.bio || "",
      facebookUrl: profile.facebookUrl || "",
      instagramUrl: profile.instagramUrl || "",
      tiktokUrl: profile.tiktokUrl || "",
      twitterUrl: profile.twitterUrl || "",
    });
    setAvatarUrl(profile.avatarUrl || "");
    setCoverUrl(profile.coverUrl || "");
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
      displayName: values.displayName,
      handle: values.handle,
      bio: values.bio,
      avatarUrl,
      coverUrl,
      facebookUrl: values.facebookUrl,
      instagramUrl: values.instagramUrl,
      tiktokUrl: values.tiktokUrl,
      twitterUrl: values.twitterUrl,
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
            <User className="text-primary size-5" />
            {t("title")}
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
                {coverUrl ? (
                  <Image
                    src={coverUrl}
                    alt="Cover photo preview"
                    fill
                    sizes="(max-width: 768px) 100vw, 600px"
                    className="object-cover transition-opacity group-hover:opacity-85"
                  />
                ) : (
                  <div className="bg-muted text-muted-foreground flex size-full items-center justify-center text-xs">
                    {t("chooseCover")}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="flex items-center gap-1.5 rounded-xl bg-black/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                    <Camera className="size-4" />
                    {t("changeCover")}
                  </span>
                </div>
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverFileChange}
                className="hidden"
              />

              {/* Avatar preview */}
              <div className="absolute -bottom-8 left-6">
                <div
                  onClick={() => avatarInputRef.current?.click()}
                  className="group/avatar bg-background ring-background relative size-20 cursor-pointer overflow-hidden rounded-full border-2 border-white/20 p-0.5 shadow-xl ring-4 sm:size-24"
                >
                  <div className="relative size-full overflow-hidden rounded-full">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt="Avatar preview"
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="bg-primary/20 text-primary flex size-full items-center justify-center font-bold">
                        {form.getValues("displayName")?.slice(0, 1) || "C"}
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover/avatar:opacity-100">
                    <Camera className="size-5 text-white" />
                  </div>
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

            <div className="h-6" />

            {/* 2. Basic Info Fields */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-muted-foreground text-xs font-semibold">
                      {t("displayName")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("displayNamePlaceholder")}
                        className="h-10 rounded-xl"
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
                      {t("handle")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("handlePlaceholder")}
                        className="h-10 rounded-xl"
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
                    {t("bio")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("bioPlaceholder")}
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
                <span>{t("socialLinks")}</span>
              </FormLabel>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="facebookUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder={t("facebookPlaceholder")}
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
                  name="instagramUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder={t("instagramPlaceholder")}
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
                  name="tiktokUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder={t("tiktokPlaceholder")}
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
                  name="twitterUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder={t("twitterPlaceholder")}
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
                <span>{t("success")}</span>
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
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isSaved}
                className="bg-primary text-primary-foreground cursor-pointer rounded-xl px-6 font-semibold"
              >
                {isSaved ? t("saving") : t("save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
