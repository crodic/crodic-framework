"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { CosplayerApplicationDialog } from "@/components/cosplayer-application/cosplayer-application-dialog";
import {
  Camera,
  Check,
  Clock,
  Link as LinkIcon,
  Loader2,
  Sparkles,
  User,
} from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagChipsInput } from "@/components/ui/tag-chips-input";
import {
  uploadMyAvatar,
  uploadMyCover,
  updateMyCosplayerProfile,
  requestCosplayerRole,
  type CosplayerDetailResDto,
} from "@/services/cosplayer";
import { createProfileEditSchema, type ProfileEditFormValues } from "./schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
  const queryClient = useQueryClient();
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || "");
  const [coverUrl, setCoverUrl] = useState(profile.coverUrl || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const profileEditSchema = useMemo(() => createProfileEditSchema(t), [t]);

  const form = useForm<ProfileEditFormValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      displayName: profile.displayName,
      handle: profile.handle,
      roleBadge: profile.roleBadge || "Cosplayer",
      tagline: profile.tagline || "",
      bio: profile.bio || "",
      artisticBio: profile.artisticBio || "",
      locationLabel: profile.locationLabel || "",
      workArea: profile.workArea || "",
      heightCm: profile.heightCm ?? "",
      experienceYearsNum: profile.experienceYearsNum ?? "",
      skillsText: profile.skills?.join(", ") || "",
      specialtiesText: profile.specialties?.join(", ") || "",
      awardsBadgesText: profile.awardsBadges?.join(", ") || "",
      contactEmail: profile.contactEmail || "",
      contactPhone: profile.contactPhone || "",
      isCraftingCreator: Boolean(profile.isCraftingCreator),
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
      roleBadge: profile.roleBadge || "Cosplayer",
      tagline: profile.tagline || "",
      bio: profile.bio || "",
      artisticBio: profile.artisticBio || "",
      locationLabel: profile.locationLabel || "",
      workArea: profile.workArea || "",
      heightCm: profile.heightCm ?? "",
      experienceYearsNum: profile.experienceYearsNum ?? "",
      skillsText: profile.skills?.join(", ") || "",
      specialtiesText: profile.specialties?.join(", ") || "",
      awardsBadgesText: profile.awardsBadges?.join(", ") || "",
      contactEmail: profile.contactEmail || "",
      contactPhone: profile.contactPhone || "",
      isCraftingCreator: Boolean(profile.isCraftingCreator),
      facebookUrl: profile.facebookUrl || "",
      instagramUrl: profile.instagramUrl || "",
      tiktokUrl: profile.tiktokUrl || "",
      twitterUrl: profile.twitterUrl || "",
    });
    setAvatarUrl(profile.avatarUrl || "");
    setCoverUrl(profile.coverUrl || "");
    setAvatarFile(null);
    setCoverFile(null);
  }, [profile, form]);

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const tempUrl = URL.createObjectURL(file);
      setCoverUrl(tempUrl);
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const tempUrl = URL.createObjectURL(file);
      setAvatarUrl(tempUrl);
    }
  };

  const requestRoleMutation = useMutation({
    mutationFn: requestCosplayerRole,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["my-cosplayer-profile"],
      });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success(t("roleRequestSuccess"));
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t("roleRequestError"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: ProfileEditFormValues) => {
      let finalAvatarUrl = avatarUrl;
      let finalCoverUrl = coverUrl;

      if (avatarFile) {
        const res = await uploadMyAvatar(avatarFile);
        finalAvatarUrl = res.avatarUrl;
      }

      if (coverFile) {
        const res = await uploadMyCover(coverFile);
        finalCoverUrl = res.coverUrl;
      }

      const parseComma = (text?: string) =>
        text
          ? text
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined;

      const updatePayload: Partial<CosplayerDetailResDto> = {
        displayName: values.displayName,
        handle: values.handle,
        roleBadge: values.roleBadge || undefined,
        tagline: values.tagline || undefined,
        bio: values.bio || undefined,
        artisticBio: values.artisticBio || undefined,
        locationLabel: values.locationLabel || undefined,
        workArea: values.workArea || undefined,
        heightCm:
          values.heightCm !== "" && values.heightCm !== undefined
            ? Number(values.heightCm)
            : undefined,
        experienceYearsNum:
          values.experienceYearsNum !== "" &&
          values.experienceYearsNum !== undefined
            ? Number(values.experienceYearsNum)
            : undefined,
        skills: parseComma(values.skillsText),
        specialties: parseComma(values.specialtiesText),
        awardsBadges: parseComma(values.awardsBadgesText),
        contactEmail: values.contactEmail || undefined,
        contactPhone: values.contactPhone || undefined,
        isCraftingCreator: Boolean(values.isCraftingCreator),
        avatarUrl: finalAvatarUrl,
        coverUrl: finalCoverUrl,
        facebookUrl: values.facebookUrl,
        instagramUrl: values.instagramUrl,
        tiktokUrl: values.tiktokUrl,
        twitterUrl: values.twitterUrl,
      };

      return updateMyCosplayerProfile(updatePayload);
    },
    onSuccess: async (updated) => {
      await queryClient.invalidateQueries({
        queryKey: ["my-cosplayer-profile"],
      });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      onSave(updated);
      setIsSaved(true);
      toast.success(t("success"));
      setTimeout(() => {
        setIsSaved(false);
        onOpenChange(false);
      }, 800);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || t("error");
      toast.error(
        typeof msg === "string"
          ? msg
          : Array.isArray(msg)
            ? msg.join(", ")
            : t("error")
      );
    },
  });

  const onSubmit = (values: ProfileEditFormValues) => {
    updateMutation.mutate(values);
  };

  return (
    <>
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

              {/* Role Request Status / CTA Banner */}
              {!profile.isVerified && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs">
                  {profile.cosplayerRequestPending ? (
                    <div className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-300">
                      <Clock className="size-4 shrink-0" />
                      <span>{t("pendingVerification")}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <p className="font-bold text-amber-700 dark:text-amber-300">
                          {t("unverifiedTitle")}
                        </p>
                        <p className="text-muted-foreground mt-0.5">
                          {t("unverifiedDesc")}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setIsApplicationDialogOpen(true)}
                        className="shrink-0 gap-1.5 rounded-xl font-semibold"
                      >
                        <Sparkles className="size-3.5" />
                        <span>{t("applyBtn")}</span>
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* 2. Basic Info Fields */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
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
                    <FormItem>
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

                <FormField
                  control={form.control}
                  name="roleBadge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-xs font-semibold">
                        {t("roleBadge")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("roleBadgePlaceholder")}
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
                  name="tagline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-xs font-semibold">
                        {t("tagline")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("taglinePlaceholder")}
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
                  name="locationLabel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-xs font-semibold">
                        {t("location")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("locationPlaceholder")}
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
                  name="workArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-xs font-semibold">
                        {t("workArea")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("workAreaPlaceholder")}
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
                  name="heightCm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-xs font-semibold">
                        {t("heightCm")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={100}
                          max={250}
                          placeholder={t("heightPlaceholder")}
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
                  name="experienceYearsNum"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-xs font-semibold">
                        {t("experienceYearsNum")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={50}
                          placeholder={t("experienceYearsPlaceholder")}
                          className="h-10 rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* 3. Skills, Specialties, Awards */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="skillsText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-xs font-semibold">
                        {t("skills")}
                      </FormLabel>
                      <FormControl>
                        <TagChipsInput
                          placeholder={t("skillsPlaceholder")}
                          value={
                            field.value
                              ? field.value
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean)
                              : []
                          }
                          onChange={(tags) => field.onChange(tags.join(", "))}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialtiesText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-xs font-semibold">
                        {t("specialties")}
                      </FormLabel>
                      <FormControl>
                        <TagChipsInput
                          placeholder={t("specialtiesPlaceholder")}
                          value={
                            field.value
                              ? field.value
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean)
                              : []
                          }
                          onChange={(tags) => field.onChange(tags.join(", "))}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="awardsBadgesText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-xs font-semibold">
                        {t("awards")}
                      </FormLabel>
                      <FormControl>
                        <TagChipsInput
                          placeholder={t("awardsPlaceholder")}
                          value={
                            field.value
                              ? field.value
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean)
                              : []
                          }
                          onChange={(tags) => field.onChange(tags.join(", "))}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* 4. Contact Info */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-xs font-semibold">
                        {t("contactEmail")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t("contactEmailPlaceholder")}
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
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-xs font-semibold">
                        {t("contactPhone")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("contactPhonePlaceholder")}
                          className="h-10 rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* 5. Bio and Artistic Bio */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
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

                <FormField
                  control={form.control}
                  name="artisticBio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-xs font-semibold">
                        {t("artisticBio")}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("artisticBioPlaceholder")}
                          rows={3}
                          className="resize-none rounded-xl text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isCraftingCreator"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0 pt-1">
                    <FormControl>
                      <Checkbox
                        checked={Boolean(field.value)}
                        onCheckedChange={(checked) =>
                          field.onChange(Boolean(checked))
                        }
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer text-xs font-normal">
                      {t("isCraftingCreator")}
                    </FormLabel>
                  </FormItem>
                )}
              />

              {/* 4. Social Links */}
              <div className="grid gap-2 pt-1">
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
                    name="instagramUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder={t("instagramPlaceholder")}
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
                    name="tiktokUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder={t("tiktokPlaceholder")}
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
                    name="twitterUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder={t("twitterPlaceholder")}
                            className="h-10 rounded-xl text-sm"
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
                  disabled={updateMutation.isPending}
                  onClick={() => onOpenChange(false)}
                  className="rounded-xl"
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={isSaved || updateMutation.isPending}
                  className="bg-primary text-primary-foreground cursor-pointer rounded-xl px-6 font-semibold"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      {t("saving")}
                    </>
                  ) : isSaved ? (
                    t("saving")
                  ) : (
                    t("save")
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <CosplayerApplicationDialog
        open={isApplicationDialogOpen}
        onOpenChange={setIsApplicationDialogOpen}
        initialStageName={profile.displayName}
        userEmail={profile.contactEmail || undefined}
      />
    </>
  );
}
