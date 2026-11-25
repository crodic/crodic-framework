"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { XiorError } from "xior";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/use-auth-store";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Camera,
  Check,
  CheckCircle2,
  Compass,
  Flame,
  Hash,
  Heart,
  Loader2,
  MapPin,
  Palette,
  Plus,
  Search,
  Sparkles,
  User,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WhiteLabelLogo } from "@/lib/white-label";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useProfile, PROFILE_QUERY_KEY } from "@/hooks/use-profile";
import {
  getMyCosplayerProfile,
  requestCosplayerRole,
  updateMyCosplayerProfile,
  type CosplayerDetailResDto,
} from "@/services/cosplayer";
import {
  autocompleteTags,
  getTrendingTags,
  type TagAutocompleteItemDto,
  type TagSummaryResDto,
} from "@/services/tags";
import { cn } from "@/lib/utils";

type OnboardingRole = "cosplayer" | "photographer" | "fan";

const CITY_KEYS = [
  "hcm",
  "hanoi",
  "danang",
  "cantho",
  "haiphong",
  "other",
] as const;

const SPECIALTY_OPTIONS: Record<
  OnboardingRole,
  { key: string; i18nKey: string }[]
> = {
  cosplayer: [
    { key: "Anime / Manga", i18nKey: "animeManga" },
    { key: "Game / Hoyoverse", i18nKey: "gameHoyoverse" },
    { key: "Armor & Mecha", i18nKey: "armorMecha" },
    { key: "Wig Styling", i18nKey: "wigStyling" },
    { key: "Prop Making", i18nKey: "propMaking" },
    { key: "VTuber", i18nKey: "vtuber" },
    { key: "Fantasy / RPG", i18nKey: "fantasyRpg" },
    { key: "Gothic / Lolita", i18nKey: "gothicLolita" },
    { key: "Horror / FX", i18nKey: "horrorFx" },
  ],
  photographer: [
    { key: "Studio Shoot", i18nKey: "studioShoot" },
    { key: "Outdoor & Convention", i18nKey: "outdoorEvent" },
    { key: "Retouch & Color Grading", i18nKey: "retouchColor" },
    { key: "Cinematic Video", i18nKey: "cinematicVideo" },
    { key: "Cosplay Makeup", i18nKey: "makeupCosplay" },
    { key: "Armor & Props", i18nKey: "propMaking" },
  ],
  fan: [
    { key: "Genshin Impact", i18nKey: "fandomGenshin" },
    { key: "Honkai: Star Rail", i18nKey: "fandomHsr" },
    { key: "Zenless Zone Zero", i18nKey: "fandomZzz" },
    { key: "Frieren", i18nKey: "fandomFrieren" },
    { key: "Demon Slayer", i18nKey: "fandomKimetsu" },
    { key: "Jujutsu Kaisen", i18nKey: "fandomJjk" },
    { key: "League of Legends", i18nKey: "fandomLol" },
    { key: "One Piece", i18nKey: "fandomOnePiece" },
    { key: "VTuber / Hololive", i18nKey: "fandomHololive" },
    { key: "Fate / Grand Order", i18nKey: "fandomFate" },
  ],
};

const createOnboardingSchema = (t: any) =>
  z.object({
    displayName: z
      .string()
      .min(1, t("step2.validation.displayNameRequired"))
      .max(80),
    handle: z
      .string()
      .min(1, t("step2.validation.handleRequired"))
      .regex(/^[a-z0-9_-]{3,30}$/, t("step2.validation.handleInvalid")),
    locationKey: z.string().min(1, t("step2.validation.locationRequired")),
    specialties: z.array(z.string()),
    bio: z.string().max(300).optional(),
  });

type OnboardingFormData = z.infer<ReturnType<typeof createOnboardingSchema>>;

export function OnboardingWizard() {
  const t = useTranslations("Onboarding");
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRole, setSelectedRole] = useState<OnboardingRole>("cosplayer");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tag Search & Suggestions
  const [tagSearchInput, setTagSearchInput] = useState("");
  const [isTagSearchOpen, setIsTagSearchOpen] = useState(false);
  const tagSearchContainerRef = useRef<HTMLDivElement>(null);

  // Form Setup with React Hook Form + Zod
  const formSchema = useMemo(() => createOnboardingSchema(t), [t]);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
      handle: "",
      locationKey: "hcm",
      specialties: [],
      bio: "",
    },
  });

  // Queries
  const accessToken = useAuthStore((state) => state.accessToken);
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const { data: userProfile } = useProfile();
  const { data: cosplayerProfile } = useQuery<CosplayerDetailResDto>({
    queryKey: ["my-cosplayer-profile"],
    queryFn: getMyCosplayerProfile,
    staleTime: 1000 * 60 * 2,
    enabled: !isHydrating && !!accessToken,
    retry: 1,
  });

  // Trending System Tags
  const { data: trendingTags = [] } = useQuery<TagSummaryResDto[]>({
    queryKey: ["onboarding-trending-tags", locale],
    queryFn: () => getTrendingTags(10, locale),
    staleTime: 60 * 1000,
  });

  // Autocomplete System Tags
  const trimmedTagInput = tagSearchInput.trim().replace(/^#/, "");
  const { data: tagSuggestions = [] } = useQuery<TagAutocompleteItemDto[]>({
    queryKey: ["onboarding-tag-autocomplete", trimmedTagInput, locale],
    queryFn: () => autocompleteTags(trimmedTagInput, locale),
    enabled: isTagSearchOpen && trimmedTagInput.length > 0,
    staleTime: 20 * 1000,
  });

  // Click outside to close tag dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tagSearchContainerRef.current &&
        !tagSearchContainerRef.current.contains(event.target as Node)
      ) {
        setIsTagSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Pre-fill initial information
  useEffect(() => {
    if (cosplayerProfile) {
      if (cosplayerProfile.displayName) {
        form.setValue("displayName", cosplayerProfile.displayName);
      }
      if (cosplayerProfile.handle) {
        form.setValue("handle", cosplayerProfile.handle.replace(/^@+/, ""));
      }
      if (cosplayerProfile.bio) {
        form.setValue("bio", cosplayerProfile.bio);
      }
      if (
        cosplayerProfile.specialties &&
        cosplayerProfile.specialties.length > 0
      ) {
        form.setValue("specialties", cosplayerProfile.specialties);
      }
      if (cosplayerProfile.roleBadge) {
        const badgeLower = cosplayerProfile.roleBadge.toLowerCase();
        if (badgeLower.includes("photo")) setSelectedRole("photographer");
        else if (
          badgeLower.includes("fan") ||
          badgeLower.includes("enthusiast")
        )
          setSelectedRole("fan");
        else setSelectedRole("cosplayer");
      }
    } else if (userProfile) {
      if (!form.getValues("displayName") && userProfile.fullName) {
        form.setValue("displayName", userProfile.fullName);
      }
      if (!form.getValues("handle") && userProfile.email) {
        const initialSlug = (userProfile.email || "")
          .split("@")[0]
          ?.toLowerCase()
          .replace(/[^a-z0-9_-]/g, "");
        form.setValue("handle", initialSlug || "");
      }
    }
  }, [cosplayerProfile, userProfile, form]);

  // Sync role badge string
  const getRoleBadge = (role: OnboardingRole): string => {
    switch (role) {
      case "photographer":
        return "Photographer";
      case "fan":
        return "Enthusiast";
      case "cosplayer":
      default:
        return "Cosplayer";
    }
  };

  const handleToggleSpecialty = (item: string) => {
    const clean = item.trim().replace(/^#/, "");
    if (!clean) return;
    const current = form.getValues("specialties") || [];
    if (current.includes(clean)) {
      form.setValue(
        "specialties",
        current.filter((s) => s !== clean),
        { shouldValidate: true }
      );
    } else {
      form.setValue("specialties", [...current, clean], {
        shouldValidate: true,
      });
    }
  };

  const handleAddCustomTag = (tag: string) => {
    const clean = tag.trim().replace(/^#/, "");
    if (!clean) return;
    const current = form.getValues("specialties") || [];
    if (!current.includes(clean)) {
      form.setValue("specialties", [...current, clean], {
        shouldValidate: true,
      });
    }
    setTagSearchInput("");
    setIsTagSearchOpen(false);
  };

  const handleNextFromStep1 = () => {
    setStep(2);
  };

  const handleBackToStep1 = () => {
    setStep(1);
  };

  const handleSaveStep2 = async (values: OnboardingFormData) => {
    const trimmedName = values.displayName.trim();
    const cleanHandle = values.handle.trim().replace(/^@+/, "").toLowerCase();
    const resolvedLocationLabel = t(
      `step2.cities.${values.locationKey}` as any
    );

    setIsSubmitting(true);
    try {
      await updateMyCosplayerProfile({
        displayName: trimmedName,
        handle: cleanHandle,
        roleBadge: getRoleBadge(selectedRole),
        locationLabel: resolvedLocationLabel,
        specialties: values.specialties,
        bio: values.bio?.trim() || undefined,
      });

      if (selectedRole === "cosplayer" || selectedRole === "photographer") {
        try {
          await requestCosplayerRole();
        } catch {
          // Non-blocking if already requested
        }
      }

      await queryClient.invalidateQueries({
        queryKey: ["my-cosplayer-profile"],
      });
      await queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });

      toast.success(t("toasts.savedSuccess"));
      setStep(3);
    } catch (err: unknown) {
      if (err instanceof XiorError && err.response?.status === 409) {
        form.setError("handle", {
          type: "manual",
          message: t("toasts.handleConflict"),
        });
        toast.error(t("toasts.handleConflict"));
      } else {
        toast.error(t("toasts.saveFailed"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    router.push("/explore");
  };

  const handleFinish = (target: "/explore" | "/profile") => {
    router.push(target);
  };

  // Step progress percentage
  const progressPercent = step === 1 ? 33 : step === 2 ? 66 : 100;

  const currentDisplayName =
    form.watch("displayName") || userProfile?.fullName || "Cosplayer";
  const currentHandle = form.watch("handle") || "username";
  const currentLocationKey = form.watch("locationKey") || "hcm";
  const currentSpecialties = form.watch("specialties") || [];

  return (
    <div className="bg-background flex min-h-dvh flex-col">
      {/* Top Bar */}
      <header className="border-border/60 bg-background/80 sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 backdrop-blur-md sm:px-8">
        <Link href="/" className="flex items-center gap-2">
          <WhiteLabelLogo
            className="h-8 w-auto object-contain"
            textClassName="text-xl"
          />
        </Link>

        <div className="flex items-center gap-3">
          <LanguageSwitcher variant="dropdown" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground text-xs sm:text-sm"
          >
            {t("skip")}
          </Button>
        </div>
      </header>

      {/* Main Wizard Area */}
      <main className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl space-y-6 sm:space-y-8">
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="text-muted-foreground flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
              <span>
                {t("stepProgress", { current: String(step), total: "3" })}
              </span>
              <span className="text-primary font-bold">
                {step === 1
                  ? t("steps.role")
                  : step === 2
                    ? t("steps.profile")
                    : t("steps.ready")}
              </span>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
          </div>

          {/* STEP 1: ROLE SELECTION */}
          {step === 1 && (
            <Card className="border-border/70 bg-card/90 rounded-2xl shadow-xl backdrop-blur-xl sm:rounded-3xl">
              <CardContent className="space-y-6 p-6 sm:p-8">
                <div className="space-y-2 text-center sm:text-left">
                  <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                    {t("step1.title")}
                  </h1>
                  <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                    {t("step1.subtitle")}
                  </p>
                </div>

                {/* 3 Role Options */}
                <div className="grid gap-4 sm:grid-cols-3">
                  {/* Option 1: Cosplayer / Creator */}
                  <div
                    onClick={() => setSelectedRole("cosplayer")}
                    className={cn(
                      "group relative flex cursor-pointer flex-col justify-between rounded-2xl border p-5 transition-all duration-200",
                      selectedRole === "cosplayer"
                        ? "border-primary bg-primary/[0.04] ring-primary/20 ring-2"
                        : "border-border/80 bg-background/60 hover:border-primary/50 hover:bg-muted/40"
                    )}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="bg-primary/15 text-primary flex size-10 items-center justify-center rounded-xl">
                          <Palette className="size-5" />
                        </div>
                        {selectedRole === "cosplayer" && (
                          <div className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full">
                            <Check className="size-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div>
                        <Badge
                          variant="secondary"
                          className="mb-1 text-[10px] tracking-wider uppercase"
                        >
                          {t("step1.roles.cosplayer.badge")}
                        </Badge>
                        <h2 className="text-foreground text-base font-bold">
                          {t("step1.roles.cosplayer.title")}
                        </h2>
                      </div>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        {t("step1.roles.cosplayer.description")}
                      </p>
                    </div>
                  </div>

                  {/* Option 2: Photographer / Studio / MUA */}
                  <div
                    onClick={() => setSelectedRole("photographer")}
                    className={cn(
                      "group relative flex cursor-pointer flex-col justify-between rounded-2xl border p-5 transition-all duration-200",
                      selectedRole === "photographer"
                        ? "border-primary bg-primary/[0.04] ring-primary/20 ring-2"
                        : "border-border/80 bg-background/60 hover:border-primary/50 hover:bg-muted/40"
                    )}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="bg-primary/15 text-primary flex size-10 items-center justify-center rounded-xl">
                          <Camera className="size-5" />
                        </div>
                        {selectedRole === "photographer" && (
                          <div className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full">
                            <Check className="size-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div>
                        <Badge
                          variant="secondary"
                          className="mb-1 text-[10px] tracking-wider uppercase"
                        >
                          {t("step1.roles.photographer.badge")}
                        </Badge>
                        <h2 className="text-foreground text-base font-bold">
                          {t("step1.roles.photographer.title")}
                        </h2>
                      </div>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        {t("step1.roles.photographer.description")}
                      </p>
                    </div>
                  </div>

                  {/* Option 3: Cosplay Fan / Enthusiast */}
                  <div
                    onClick={() => setSelectedRole("fan")}
                    className={cn(
                      "group relative flex cursor-pointer flex-col justify-between rounded-2xl border p-5 transition-all duration-200",
                      selectedRole === "fan"
                        ? "border-primary bg-primary/[0.04] ring-primary/20 ring-2"
                        : "border-border/80 bg-background/60 hover:border-primary/50 hover:bg-muted/40"
                    )}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="bg-primary/15 text-primary flex size-10 items-center justify-center rounded-xl">
                          <Heart className="size-5" />
                        </div>
                        {selectedRole === "fan" && (
                          <div className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full">
                            <Check className="size-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div>
                        <Badge
                          variant="secondary"
                          className="mb-1 text-[10px] tracking-wider uppercase"
                        >
                          {t("step1.roles.fan.badge")}
                        </Badge>
                        <h2 className="text-foreground text-base font-bold">
                          {t("step1.roles.fan.title")}
                        </h2>
                      </div>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        {t("step1.roles.fan.description")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Continue Action */}
                <div className="flex justify-end pt-4">
                  <Button
                    size="lg"
                    onClick={handleNextFromStep1}
                    className="gap-2 rounded-xl px-6 font-semibold shadow-md shadow-purple-500/20"
                  >
                    <span>{t("step1.continueBtn")}</span>
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 2: PROFILE DETAILS (React Hook Form + Zod + System Tag Integration) */}
          {step === 2 && (
            <Card className="border-border/70 bg-card/90 rounded-2xl shadow-xl backdrop-blur-xl sm:rounded-3xl">
              <CardContent className="space-y-6 p-6 sm:p-8">
                <div className="space-y-2">
                  <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                    {selectedRole === "fan"
                      ? t("step2.fanTitle")
                      : t("step2.creatorTitle")}
                  </h1>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {t("step2.subtitle")}
                  </p>
                </div>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSaveStep2)}
                    className="space-y-5"
                  >
                    {/* Stage Name / Display Name */}
                    <FormField
                      control={form.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-foreground text-sm font-semibold">
                            {t("step2.fields.displayName")}{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t(
                                "step2.fields.displayNamePlaceholder"
                              )}
                              className="rounded-xl"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Handle with live preview */}
                    <FormField
                      control={form.control}
                      name="handle"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-foreground text-sm font-semibold">
                            {t("step2.fields.handle")}{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="text-muted-foreground absolute top-1/2 left-3.5 -translate-y-1/2 text-sm font-bold">
                                @
                              </span>
                              <Input
                                value={field.value}
                                onChange={(e) => {
                                  const val = e.target.value
                                    .toLowerCase()
                                    .replace(/[^a-z0-9_-]/g, "");
                                  field.onChange(val);
                                }}
                                placeholder={t(
                                  "step2.fields.handlePlaceholder"
                                )}
                                className="rounded-xl pl-8"
                              />
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs">
                            {t("step2.fields.handlePreview")}{" "}
                            <span className="text-primary font-mono font-medium">
                              kosume.click/cosplayer/@
                              {field.value || "username"}
                            </span>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* City Selector */}
                    <FormField
                      control={form.control}
                      name="locationKey"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-foreground text-sm font-semibold">
                            {t("step2.fields.location")}{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full rounded-xl">
                                <SelectValue
                                  placeholder={t(
                                    "step2.fields.locationPlaceholder"
                                  )}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CITY_KEYS.map((cKey) => (
                                <SelectItem key={cKey} value={cKey}>
                                  {t(`step2.cities.${cKey}` as any)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Specialties & System Tags Section */}
                    <FormField
                      control={form.control}
                      name="specialties"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <div className="space-y-1">
                            <FormLabel className="text-foreground text-sm font-semibold">
                              {selectedRole === "cosplayer"
                                ? t("step2.fields.specialtiesCosplayer")
                                : selectedRole === "photographer"
                                  ? t("step2.fields.specialtiesPhotographer")
                                  : t("step2.fields.specialtiesFan")}
                            </FormLabel>
                            <p className="text-muted-foreground text-xs">
                              {t("step2.fields.specialtiesHint")}
                            </p>
                          </div>

                          {/* 1. Curated Role Specialties (Localized) */}
                          <div className="flex flex-wrap gap-2 pt-0.5">
                            {SPECIALTY_OPTIONS[selectedRole].map((spec) => {
                              const isSelected = field.value?.includes(
                                spec.key
                              );
                              const label = t(
                                `step2.specialtyOptions.${spec.i18nKey}` as any
                              );
                              return (
                                <button
                                  key={spec.key}
                                  type="button"
                                  onClick={() =>
                                    handleToggleSpecialty(spec.key)
                                  }
                                  className={cn(
                                    "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-150 select-none",
                                    isSelected
                                      ? "bg-primary text-primary-foreground ring-primary/30 shadow-xs ring-2 shadow-purple-500/25"
                                      : "border-border/80 bg-muted/60 text-muted-foreground hover:border-primary/40 hover:text-foreground border"
                                  )}
                                >
                                  {isSelected ? (
                                    <Check className="size-3 stroke-[2.5]" />
                                  ) : (
                                    <Hash className="text-muted-foreground/60 size-3" />
                                  )}
                                  <span>{label}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* 2. System Trending Tags from Tag Management */}
                          {trendingTags && trendingTags.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold">
                                <Flame className="size-3.5 text-amber-500" />
                                <span>
                                  {t("step2.fields.tagTrendingSystem")}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {trendingTags.slice(0, 8).map((tag) => {
                                  const isSelected = field.value?.includes(
                                    tag.name
                                  );
                                  return (
                                    <button
                                      key={tag.id}
                                      type="button"
                                      onClick={() =>
                                        handleToggleSpecialty(tag.name)
                                      }
                                      className={cn(
                                        "inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium transition-all select-none",
                                        isSelected
                                          ? "bg-primary text-primary-foreground shadow-xs"
                                          : "border-border/60 bg-background/70 text-muted-foreground hover:border-primary/40 hover:text-foreground border"
                                      )}
                                    >
                                      <span className="text-primary/70">#</span>
                                      <span>{tag.name}</span>
                                      {isSelected && (
                                        <Check className="ml-0.5 size-3" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* 3. Search & Add Tags from System Autocomplete */}
                          <div
                            ref={tagSearchContainerRef}
                            className="relative pt-1"
                          >
                            <div className="relative">
                              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
                              <Input
                                value={tagSearchInput}
                                onChange={(e) => {
                                  setTagSearchInput(e.target.value);
                                  setIsTagSearchOpen(true);
                                }}
                                onFocus={() => setIsTagSearchOpen(true)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    if (trimmedTagInput) {
                                      handleAddCustomTag(trimmedTagInput);
                                    }
                                  } else if (e.key === "Escape") {
                                    setIsTagSearchOpen(false);
                                  }
                                }}
                                placeholder={t(
                                  "step2.fields.tagSearchPlaceholder"
                                )}
                                className="bg-background/50 border-border/70 h-9 rounded-xl pr-24 pl-9 text-xs"
                              />
                              {trimmedTagInput && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleAddCustomTag(trimmedTagInput)
                                  }
                                  className="text-primary hover:text-primary hover:bg-primary/10 absolute top-1/2 right-1 h-7 -translate-y-1/2 px-2 text-xs font-semibold"
                                >
                                  <Plus className="mr-1 size-3" />
                                  <span>{t("step2.fields.addCustomTag")}</span>
                                </Button>
                              )}
                            </div>

                            {/* Autocomplete Dropdown */}
                            {isTagSearchOpen && trimmedTagInput.length > 0 && (
                              <div className="border-border/80 bg-popover/95 absolute top-full left-0 z-50 mt-1.5 max-h-52 w-full overflow-y-auto rounded-2xl border p-1.5 shadow-2xl backdrop-blur-md">
                                <button
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleAddCustomTag(trimmedTagInput);
                                  }}
                                  className="hover:bg-primary/10 text-primary flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors"
                                >
                                  <div className="flex items-center gap-1.5">
                                    <Sparkles className="size-3.5" />
                                    <span>
                                      {t("step2.fields.addCustomTag")}:{" "}
                                      <strong className="underline">
                                        #{trimmedTagInput}
                                      </strong>
                                    </span>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="border-primary/30 text-[10px]"
                                  >
                                    Custom
                                  </Badge>
                                </button>

                                {tagSuggestions.length > 0 && (
                                  <div className="border-border/40 mt-1 border-t pt-1">
                                    {tagSuggestions.map((sug) => {
                                      const isSelected = field.value?.includes(
                                        sug.name
                                      );
                                      return (
                                        <button
                                          key={sug.id}
                                          type="button"
                                          disabled={isSelected}
                                          onMouseDown={(e) => {
                                            e.preventDefault();
                                            handleAddCustomTag(sug.name);
                                          }}
                                          className={cn(
                                            "flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-1.5 text-left text-xs transition-colors",
                                            isSelected
                                              ? "bg-muted/40 cursor-not-allowed opacity-50"
                                              : "hover:bg-muted"
                                          )}
                                        >
                                          <div className="flex items-center gap-2">
                                            <span className="text-foreground font-semibold">
                                              #{sug.name}
                                            </span>
                                            {sug.category && (
                                              <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-[10px] capitalize">
                                                {sug.category}
                                              </span>
                                            )}
                                          </div>
                                          {isSelected ? (
                                            <Check className="text-muted-foreground size-3" />
                                          ) : (
                                            <Plus className="text-muted-foreground size-3" />
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* 4. Active Selected Tags Tray */}
                          {field.value && field.value.length > 0 && (
                            <div className="border-border/40 space-y-1.5 border-t pt-1">
                              <div className="text-muted-foreground text-[11px] font-medium">
                                {t("step2.fields.tagLimitHint", {
                                  count: String(field.value.length),
                                })}
                                :
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {field.value.map((item) => (
                                  <span
                                    key={item}
                                    className="bg-primary/10 text-primary border-primary/25 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold"
                                  >
                                    <span>#{item}</span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleToggleSpecialty(item)
                                      }
                                      className="hover:bg-primary/20 cursor-pointer rounded-full p-0.5 transition-colors"
                                    >
                                      <X className="size-3" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Short Bio */}
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-foreground text-sm font-semibold">
                              {t("step2.fields.bio")}
                            </FormLabel>
                            <span className="text-muted-foreground text-xs">
                              {(field.value || "").length}/300
                            </span>
                          </div>
                          <FormControl>
                            <Textarea
                              maxLength={300}
                              placeholder={t("step2.fields.bioPlaceholder")}
                              className="min-h-[84px] resize-none rounded-xl"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Form Navigation Actions */}
                    <div className="flex items-center justify-between pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBackToStep1}
                        disabled={isSubmitting}
                        className="gap-2 rounded-xl"
                      >
                        <ArrowLeft className="size-4" />
                        <span>{t("step2.backBtn")}</span>
                      </Button>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="gap-2 rounded-xl px-6 font-semibold shadow-md shadow-purple-500/20"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            <span>{t("step2.saving")}</span>
                          </>
                        ) : (
                          <>
                            <span>{t("step2.saveBtn")}</span>
                            <ArrowRight className="size-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* STEP 3: READY / CELEBRATION */}
          {step === 3 && (
            <Card className="border-border/70 bg-card/90 rounded-2xl shadow-xl backdrop-blur-xl sm:rounded-3xl">
              <CardContent className="space-y-8 p-6 text-center sm:p-10">
                {/* Clean celebration icon */}
                <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-500 shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="size-10 stroke-[2.2]" />
                </div>

                <div className="space-y-2">
                  <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                    {t("step3.title")}
                  </h1>
                  <p className="text-muted-foreground mx-auto max-w-md text-sm leading-relaxed sm:text-base">
                    {t("step3.subtitle")}
                  </p>
                </div>

                {/* Summary Profile Preview Card */}
                <div className="border-border/80 bg-background/60 mx-auto max-w-md space-y-4 rounded-2xl border p-5 text-left">
                  <div className="flex items-center gap-3.5">
                    <div className="bg-primary/20 text-primary flex size-12 items-center justify-center rounded-2xl font-bold">
                      <User className="size-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-foreground truncate font-bold">
                          {currentDisplayName}
                        </span>
                        <BadgeCheck className="text-primary size-4 shrink-0" />
                      </div>
                      <p className="text-muted-foreground truncate font-mono text-xs">
                        @{currentHandle}
                      </p>
                    </div>
                    <Badge variant="purple" className="shrink-0">
                      {getRoleBadge(selectedRole)}
                    </Badge>
                  </div>

                  <div className="border-border/60 flex items-center gap-2 border-t pt-3 text-xs">
                    <MapPin className="text-muted-foreground size-3.5 shrink-0" />
                    <span className="text-muted-foreground">
                      {t(`step2.cities.${currentLocationKey}` as any)}
                    </span>
                  </div>

                  {currentSpecialties.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {currentSpecialties.slice(0, 4).map((spec) => (
                        <span
                          key={spec}
                          className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-[11px] font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                      {currentSpecialties.length > 4 && (
                        <span className="text-muted-foreground px-1 py-0.5 text-[11px]">
                          +{currentSpecialties.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Role Request Notice */}
                {(selectedRole === "cosplayer" ||
                  selectedRole === "photographer") && (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-left">
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-300">
                      {t("step3.pendingRoleTitle")}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {t("step3.pendingRoleDesc")}
                    </p>
                  </div>
                )}

                {/* Destination CTAs */}
                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-center">
                  <Button
                    size="lg"
                    onClick={() => handleFinish("/explore")}
                    className="gap-2 rounded-xl px-7 font-bold shadow-md shadow-purple-500/25"
                  >
                    <Compass className="size-4" />
                    <span>{t("step3.exploreBtn")}</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleFinish("/profile")}
                    className="rounded-xl px-6 font-semibold"
                  >
                    {t("step3.profileBtn")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
