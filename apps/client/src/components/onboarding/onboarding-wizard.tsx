"use client";

import React, { useState, useEffect, useId } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { XiorError } from "xior";
import { useAuthStore } from "@/store/use-auth-store";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Camera,
  Check,
  CheckCircle2,
  Compass,
  Heart,
  Loader2,
  MapPin,
  Palette,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  updateMyCosplayerProfile,
  type CosplayerDetailResDto,
} from "@/services/cosplayer";
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

export function OnboardingWizard() {
  const t = useTranslations("Onboarding");
  const router = useRouter();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRole, setSelectedRole] = useState<OnboardingRole>("cosplayer");
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [locationKey, setLocationKey] = useState<string>("hcm");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [handleError, setHandleError] = useState("");
  const [nameError, setNameError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Pre-fill initial information
  useEffect(() => {
    if (cosplayerProfile) {
      if (cosplayerProfile.displayName) {
        setDisplayName(cosplayerProfile.displayName);
      }
      if (cosplayerProfile.handle) {
        setHandle(cosplayerProfile.handle.replace(/^@+/, ""));
      }
      if (cosplayerProfile.bio) {
        setBio(cosplayerProfile.bio);
      }
      if (
        cosplayerProfile.specialties &&
        cosplayerProfile.specialties.length > 0
      ) {
        setSelectedSpecialties(cosplayerProfile.specialties);
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
      if (!displayName && userProfile.fullName) {
        setDisplayName(userProfile.fullName);
      }
      if (!handle && userProfile.email) {
        const initialSlug = (userProfile.email || "")
          .split("@")[0]
          ?.toLowerCase()
          .replace(/[^a-z0-9_-]/g, "");
        setHandle(initialSlug || "");
      }
    }
  }, [cosplayerProfile, userProfile]);

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
    setSelectedSpecialties((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    );
  };

  const handleNextFromStep1 = () => {
    setStep(2);
  };

  const handleBackToStep1 = () => {
    setStep(1);
  };

  const handleSaveStep2 = async () => {
    setNameError("");
    setHandleError("");

    const trimmedName = displayName.trim();
    const cleanHandle = handle.trim().replace(/^@+/, "").toLowerCase();

    if (!trimmedName) {
      setNameError(t("step2.validation.displayNameRequired"));
      return;
    }

    if (!cleanHandle) {
      setHandleError(t("step2.validation.handleRequired"));
      return;
    }

    if (!/^[a-z0-9_-]{3,30}$/.test(cleanHandle)) {
      setHandleError(t("step2.validation.handleInvalid"));
      return;
    }

    const resolvedLocationLabel = t(`step2.cities.${locationKey}` as any);

    setIsSubmitting(true);
    try {
      await updateMyCosplayerProfile({
        displayName: trimmedName,
        handle: cleanHandle,
        roleBadge: getRoleBadge(selectedRole),
        locationLabel: resolvedLocationLabel,
        specialties: selectedSpecialties,
        bio: bio.trim() || undefined,
      });

      await queryClient.invalidateQueries({
        queryKey: ["my-cosplayer-profile"],
      });
      await queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });

      toast.success(t("toasts.savedSuccess"));
      setStep(3);
    } catch (err: unknown) {
      if (err instanceof XiorError && err.response?.status === 409) {
        setHandleError(t("toasts.handleConflict"));
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
                        ? "border-primary bg-primary/5 ring-primary/20 shadow-primary/10 shadow-lg ring-2"
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
                        ? "border-primary bg-primary/5 ring-primary/20 shadow-primary/10 shadow-lg ring-2"
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
                        ? "border-primary bg-primary/5 ring-primary/20 shadow-primary/10 shadow-lg ring-2"
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

          {/* STEP 2: PROFILE DETAILS */}
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

                <div className="space-y-5">
                  {/* Stage Name / Display Name */}
                  <div className="space-y-2">
                    <label className="text-foreground text-sm font-semibold">
                      {t("step2.fields.displayName")}{" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <Input
                      value={displayName}
                      onChange={(e) => {
                        setDisplayName(e.target.value);
                        if (nameError) setNameError("");
                      }}
                      placeholder={t("step2.fields.displayNamePlaceholder")}
                      className={cn(
                        "rounded-xl",
                        nameError &&
                          "border-destructive focus-visible:ring-destructive/30"
                      )}
                    />
                    {nameError && (
                      <p className="text-destructive text-xs">{nameError}</p>
                    )}
                  </div>

                  {/* Handle with live preview */}
                  <div className="space-y-2">
                    <label className="text-foreground text-sm font-semibold">
                      {t("step2.fields.handle")}{" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <span className="text-muted-foreground absolute top-1/2 left-3.5 -translate-y-1/2 text-sm font-bold">
                        @
                      </span>
                      <Input
                        value={handle}
                        onChange={(e) => {
                          const val = e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9_-]/g, "");
                          setHandle(val);
                          if (handleError) setHandleError("");
                        }}
                        placeholder={t("step2.fields.handlePlaceholder")}
                        className={cn(
                          "rounded-xl pl-8",
                          handleError &&
                            "border-destructive focus-visible:ring-destructive/30"
                        )}
                      />
                    </div>
                    {handleError ? (
                      <p className="text-destructive text-xs">{handleError}</p>
                    ) : (
                      <p className="text-muted-foreground text-xs">
                        {t("step2.fields.handlePreview")}{" "}
                        <span className="text-primary font-mono font-medium">
                          kosume.click/cosplayer/@{handle || "username"}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* City Selector */}
                  <div className="space-y-2">
                    <label className="text-foreground text-sm font-semibold">
                      {t("step2.fields.location")}{" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <Select value={locationKey} onValueChange={setLocationKey}>
                      <SelectTrigger className="w-full rounded-xl">
                        <SelectValue
                          placeholder={t("step2.fields.locationPlaceholder")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {CITY_KEYS.map((cKey) => (
                          <SelectItem key={cKey} value={cKey}>
                            {t(`step2.cities.${cKey}` as any)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Specialties / Fandoms */}
                  <div className="space-y-2.5">
                    <label className="text-foreground text-sm font-semibold">
                      {selectedRole === "cosplayer"
                        ? t("step2.fields.specialtiesCosplayer")
                        : selectedRole === "photographer"
                          ? t("step2.fields.specialtiesPhotographer")
                          : t("step2.fields.specialtiesFan")}
                    </label>
                    <p className="text-muted-foreground text-xs">
                      {t("step2.fields.specialtiesHint")}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {SPECIALTY_OPTIONS[selectedRole].map((spec) => {
                        const isSelected = selectedSpecialties.includes(
                          spec.key
                        );
                        const label = t(
                          `step2.specialtyOptions.${spec.i18nKey}` as any
                        );
                        return (
                          <button
                            key={spec.key}
                            type="button"
                            onClick={() => handleToggleSpecialty(spec.key)}
                            className={cn(
                              "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-150 select-none",
                              isSelected
                                ? "bg-primary text-primary-foreground shadow-xs shadow-purple-500/25"
                                : "border-border/80 bg-muted/60 text-muted-foreground hover:border-primary/40 hover:text-foreground border"
                            )}
                          >
                            {isSelected && (
                              <Check className="size-3 stroke-[2.5]" />
                            )}
                            <span>{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Short Bio */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-foreground text-sm font-semibold">
                        {t("step2.fields.bio")}
                      </label>
                      <span className="text-muted-foreground text-xs">
                        {bio.length}/300
                      </span>
                    </div>
                    <Textarea
                      value={bio}
                      maxLength={300}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder={t("step2.fields.bioPlaceholder")}
                      className="min-h-[84px] resize-none rounded-xl"
                    />
                  </div>
                </div>

                {/* Form Navigation Actions */}
                <div className="flex items-center justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={handleBackToStep1}
                    disabled={isSubmitting}
                    className="gap-2 rounded-xl"
                  >
                    <ArrowLeft className="size-4" />
                    <span>{t("step2.backBtn")}</span>
                  </Button>

                  <Button
                    onClick={handleSaveStep2}
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
              </CardContent>
            </Card>
          )}

          {/* STEP 3: READY / CELEBRATION */}
          {step === 3 && (
            <Card className="border-border/70 bg-card/90 rounded-2xl shadow-xl backdrop-blur-xl sm:rounded-3xl">
              <CardContent className="space-y-8 p-6 text-center sm:p-10">
                {/* Clean celebration icon (CheckCircle2 - NO Sparkles) */}
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
                          {displayName || userProfile?.fullName || "Cosplayer"}
                        </span>
                        <BadgeCheck className="text-primary size-4 shrink-0" />
                      </div>
                      <p className="text-muted-foreground truncate font-mono text-xs">
                        @{handle || "username"}
                      </p>
                    </div>
                    <Badge variant="purple" className="shrink-0">
                      {getRoleBadge(selectedRole)}
                    </Badge>
                  </div>

                  <div className="border-border/60 flex items-center gap-2 border-t pt-3 text-xs">
                    <MapPin className="text-muted-foreground size-3.5 shrink-0" />
                    <span className="text-muted-foreground">
                      {t(`step2.cities.${locationKey}` as any)}
                    </span>
                  </div>

                  {selectedSpecialties.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedSpecialties.slice(0, 4).map((spec) => (
                        <span
                          key={spec}
                          className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-[11px] font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                      {selectedSpecialties.length > 4 && (
                        <span className="text-muted-foreground px-1 py-0.5 text-[11px]">
                          +{selectedSpecialties.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

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
