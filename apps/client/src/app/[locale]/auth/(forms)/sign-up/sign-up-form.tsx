"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Flame,
  Hash,
  Heart,
  Loader2,
  Palette,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import xior, { XiorError } from "xior";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GoogleIcon } from "@/components/icons/google-icon";
import { WhiteLabelLogo } from "@/lib/white-label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PROFILE_QUERY_KEY } from "@/hooks/use-profile";
import { useAuthStore } from "@/store/use-auth-store";
import { http } from "@/lib/http";
import { LoginResponseData } from "@/types/apis";
import {
  autocompleteTags,
  getTrendingTags,
  type TagAutocompleteItemDto,
  type TagSummaryResDto,
} from "@/services/tags";
import { cn } from "@/lib/utils";
import { createSignUpFormSchema, type SignUpFormValues } from "./schema";

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

export default function SignUpForm() {
  const t = useTranslations("Auth.signUp");
  const tOnboard = useTranslations("Onboarding");
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Tag search state for Step 2
  const [tagSearchInput, setTagSearchInput] = useState("");
  const [isTagSearchOpen, setIsTagSearchOpen] = useState(false);
  const tagSearchContainerRef = useRef<HTMLDivElement>(null);

  const signUpFormSchema = useMemo(
    () => createSignUpFormSchema(t, tOnboard),
    [t, tOnboard]
  );

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      role: "cosplayer",
      displayName: "",
      locationKey: "hcm",
      specialties: [],
      bio: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const selectedRole = (form.watch("role") || "cosplayer") as OnboardingRole;

  // Trending System Tags
  const { data: trendingTags = [] } = useQuery<TagSummaryResDto[]>({
    queryKey: ["signup-trending-tags", locale],
    queryFn: () => getTrendingTags(10, locale),
    staleTime: 60 * 1000,
  });

  // Autocomplete System Tags
  const trimmedTagInput = tagSearchInput.trim().replace(/^#/, "");
  const { data: tagSuggestions = [] } = useQuery<TagAutocompleteItemDto[]>({
    queryKey: ["signup-tag-autocomplete", trimmedTagInput, locale],
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

  const signUpMutation = useMutation({
    mutationFn: async (values: SignUpFormValues) => {
      const payload = {
        firstName: values.firstName.trim(),
        lastName: values.lastName?.trim() || undefined,
        email: values.email.trim(),
        password: values.password,
        roleBadge: getRoleBadge(values.role),
        displayName: values.displayName.trim(),
        locationLabel: tOnboard(`step2.cities.${values.locationKey}` as any),
        specialties: values.specialties,
        bio: values.bio?.trim() || undefined,
      };

      // 1 single API call for registration + auto-login session + initial profile creation
      const { data } = await http.post<LoginResponseData>(
        "api/v1/user/auth/register",
        payload
      );

      const { accessToken, refreshToken } = data;

      await xior.post("/api/auth/tokens", {
        accessToken,
        refreshToken,
      });

      useAuthStore.getState().setTokens({ accessToken });

      await queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      await queryClient.invalidateQueries({
        queryKey: ["my-cosplayer-profile"],
      });

      return data;
    },
    onSuccess: () => {
      toast.success(t("successToast"));
      router.push("/explore");
    },
    onError: (error) => {
      if (error instanceof XiorError) {
        const errorData = error.response?.data;
        const msg = errorData?.message || t("errorToast");
        toast.error(msg);
      } else {
        toast.error(t("errorToast"));
      }
    },
  });

  const onSubmit = (values: SignUpFormValues) => {
    signUpMutation.mutate(values);
  };

  const isSubmitting = signUpMutation.isPending || form.formState.isSubmitting;

  const handleNextFromStep1 = () => {
    setStep(2);
  };

  const handleNextFromStep2 = async () => {
    const isValid = await form.trigger(["displayName", "locationKey"]);
    if (isValid) {
      setStep(3);
    }
  };

  const progressPercent = step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <div className="mx-auto flex w-full max-w-xl min-w-0 flex-col justify-center py-2 sm:py-6">
      {/* Mobile Brand Logo */}
      <div className="mb-4 flex justify-center lg:hidden">
        <Link href="/" className="inline-flex items-center gap-2">
          <WhiteLabelLogo className="h-10 w-auto object-contain" />
        </Link>
      </div>

      <Card className="border-border/70 bg-card/95 w-full max-w-full min-w-0 gap-5 overflow-hidden rounded-2xl py-6 shadow-2xl shadow-purple-950/20 backdrop-blur-xl sm:py-8">
        <CardHeader className="flex w-full min-w-0 flex-col items-stretch space-y-3 px-4 sm:px-8">
          {/* Progress Indicator */}
          <div className="w-full space-y-1.5">
            <div className="text-muted-foreground flex w-full items-center justify-between text-xs font-semibold tracking-wider uppercase">
              <span>
                {t("step")} {step} / 3
              </span>
              <span className="text-primary font-bold">
                {step === 1
                  ? t("stepRole")
                  : step === 2
                    ? t("stepProfile")
                    : t("stepAccount")}
              </span>
            </div>
            <Progress value={progressPercent} className="h-1.5 w-full" />
          </div>

          <CardTitle className="text-2xl font-bold tracking-tight sm:text-3xl">
            {step === 1
              ? tOnboard("step1.title")
              : step === 2
                ? tOnboard("step2.creatorTitle")
                : t("title")}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm leading-relaxed">
            {step === 1
              ? tOnboard("step1.subtitle")
              : step === 2
                ? tOnboard("step2.subtitle")
                : t("description")}
          </CardDescription>
        </CardHeader>

        <CardContent className="w-full min-w-0 px-4 sm:px-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 sm:space-y-5"
            >
              {/* STEP 1: ROLE SELECTION */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-3">
                    {/* Option 1: Cosplayer */}
                    <div
                      onClick={() => form.setValue("role", "cosplayer")}
                      className={cn(
                        "group relative flex cursor-pointer items-center justify-between rounded-2xl border p-3.5 transition-all duration-200 select-none sm:p-4",
                        selectedRole === "cosplayer"
                          ? "border-primary bg-primary/5 ring-primary/20 shadow-primary/10 shadow-md ring-2"
                          : "border-border/80 bg-background/60 hover:border-primary/50 hover:bg-muted/40"
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-3.5 pr-2">
                        <div className="bg-primary/15 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                          <Palette className="size-5" />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h2 className="text-foreground truncate text-sm font-bold sm:text-base">
                              {tOnboard("step1.roles.cosplayer.title")}
                            </h2>
                            <Badge
                              variant="secondary"
                              className="shrink-0 text-[10px] tracking-wider uppercase"
                            >
                              {tOnboard("step1.roles.cosplayer.badge")}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                            {tOnboard("step1.roles.cosplayer.description")}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 pl-1">
                        <div
                          className={cn(
                            "flex size-5 items-center justify-center rounded-full border transition-all",
                            selectedRole === "cosplayer"
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border/80 bg-background/50"
                          )}
                        >
                          {selectedRole === "cosplayer" && (
                            <Check className="size-3 stroke-[3]" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Option 2: Photographer */}
                    <div
                      onClick={() => form.setValue("role", "photographer")}
                      className={cn(
                        "group relative flex cursor-pointer items-center justify-between rounded-2xl border p-3.5 transition-all duration-200 select-none sm:p-4",
                        selectedRole === "photographer"
                          ? "border-primary bg-primary/5 ring-primary/20 shadow-primary/10 shadow-md ring-2"
                          : "border-border/80 bg-background/60 hover:border-primary/50 hover:bg-muted/40"
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-3.5 pr-2">
                        <div className="bg-primary/15 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                          <Camera className="size-5" />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h2 className="text-foreground truncate text-sm font-bold sm:text-base">
                              {tOnboard("step1.roles.photographer.title")}
                            </h2>
                            <Badge
                              variant="secondary"
                              className="shrink-0 text-[10px] tracking-wider uppercase"
                            >
                              {tOnboard("step1.roles.photographer.badge")}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                            {tOnboard("step1.roles.photographer.description")}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 pl-1">
                        <div
                          className={cn(
                            "flex size-5 items-center justify-center rounded-full border transition-all",
                            selectedRole === "photographer"
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border/80 bg-background/50"
                          )}
                        >
                          {selectedRole === "photographer" && (
                            <Check className="size-3 stroke-[3]" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Option 3: Fan / Enthusiast */}
                    <div
                      onClick={() => form.setValue("role", "fan")}
                      className={cn(
                        "group relative flex cursor-pointer items-center justify-between rounded-2xl border p-3.5 transition-all duration-200 select-none sm:p-4",
                        selectedRole === "fan"
                          ? "border-primary bg-primary/5 ring-primary/20 shadow-primary/10 shadow-md ring-2"
                          : "border-border/80 bg-background/60 hover:border-primary/50 hover:bg-muted/40"
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-3.5 pr-2">
                        <div className="bg-primary/15 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                          <Heart className="size-5" />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h2 className="text-foreground truncate text-sm font-bold sm:text-base">
                              {tOnboard("step1.roles.fan.title")}
                            </h2>
                            <Badge
                              variant="secondary"
                              className="shrink-0 text-[10px] tracking-wider uppercase"
                            >
                              {tOnboard("step1.roles.fan.badge")}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                            {tOnboard("step1.roles.fan.description")}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 pl-1">
                        <div
                          className={cn(
                            "flex size-5 items-center justify-center rounded-full border transition-all",
                            selectedRole === "fan"
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border/80 bg-background/50"
                          )}
                        >
                          {selectedRole === "fan" && (
                            <Check className="size-3 stroke-[3]" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="button"
                      onClick={handleNextFromStep1}
                      className="h-10 cursor-pointer gap-2 rounded-xl px-6 text-sm font-semibold shadow-md shadow-purple-500/20 transition-all sm:h-11 sm:text-base"
                    >
                      <span>{t("nextStep")}</span>
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>

                  {/* Or continue with Google right on Step 1 */}
                  <div className="pt-1">
                    <div className="relative my-3">
                      <div className="absolute inset-0 flex items-center">
                        <span className="border-border/70 w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card text-muted-foreground px-2">
                          {t("orContinueWith")}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="hover:bg-accent/80 h-10 w-full cursor-pointer gap-2.5 rounded-xl font-medium transition-all sm:h-11"
                      onClick={() => {
                        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/auth/social/google`;
                      }}
                    >
                      <GoogleIcon className="size-4.5 shrink-0" />
                      <span>{t("continueGoogle")}</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: PROFILE DETAILS & SPECIALTIES */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs font-semibold sm:text-sm">
                            {tOnboard("step2.fields.displayName")}{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={tOnboard(
                                "step2.fields.displayNamePlaceholder"
                              )}
                              className="h-10 rounded-xl text-sm sm:h-10.5"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="locationKey"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs font-semibold sm:text-sm">
                            {tOnboard("step2.fields.location")}{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10 w-full rounded-xl text-sm sm:h-10.5">
                                <SelectValue
                                  placeholder={tOnboard(
                                    "step2.fields.locationPlaceholder"
                                  )}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CITY_KEYS.map((cKey) => (
                                <SelectItem key={cKey} value={cKey}>
                                  {tOnboard(`step2.cities.${cKey}` as any)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Specialties & System Tags */}
                  <FormField
                    control={form.control}
                    name="specialties"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <div className="space-y-0.5">
                          <FormLabel className="text-xs font-semibold sm:text-sm">
                            {selectedRole === "cosplayer"
                              ? tOnboard("step2.fields.specialtiesCosplayer")
                              : selectedRole === "photographer"
                                ? tOnboard(
                                    "step2.fields.specialtiesPhotographer"
                                  )
                                : tOnboard("step2.fields.specialtiesFan")}
                          </FormLabel>
                          <p className="text-muted-foreground text-[11px] sm:text-xs">
                            {tOnboard("step2.fields.specialtiesHint")}
                          </p>
                        </div>

                        {/* 1. Curated Role Specialties */}
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {SPECIALTY_OPTIONS[selectedRole].map((spec) => {
                            const isSelected = field.value?.includes(spec.key);
                            const label = tOnboard(
                              `step2.specialtyOptions.${spec.i18nKey}` as any
                            );
                            return (
                              <button
                                key={spec.key}
                                type="button"
                                onClick={() => handleToggleSpecialty(spec.key)}
                                className={cn(
                                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all select-none",
                                  isSelected
                                    ? "bg-primary text-primary-foreground ring-primary/30 shadow-xs ring-2"
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

                        {/* 2. System Trending Tags */}
                        {trendingTags && trendingTags.length > 0 && (
                          <div className="space-y-1 pt-1">
                            <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold">
                              <Flame className="size-3.5 text-amber-500" />
                              <span>
                                {tOnboard("step2.fields.tagTrendingSystem")}
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
                                      "inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all select-none",
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

                        {/* 3. Search & Add Tags */}
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
                              placeholder={tOnboard(
                                "step2.fields.tagSearchPlaceholder"
                              )}
                              className="bg-background/50 border-border/70 h-9 rounded-xl pr-20 pl-9 text-xs"
                            />
                            {trimmedTagInput && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleAddCustomTag(trimmedTagInput)
                                }
                                className="bg-primary text-primary-foreground hover:bg-primary/90 absolute top-1/2 right-1.5 -translate-y-1/2 rounded-lg px-2.5 py-1 text-[11px] font-medium shadow-xs"
                              >
                                + {tOnboard("step2.fields.addCustomTag")}
                              </button>
                            )}
                          </div>

                          {isTagSearchOpen &&
                            tagSuggestions &&
                            tagSuggestions.length > 0 && (
                              <div className="border-border/80 bg-card text-card-foreground absolute top-full z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border p-1 shadow-lg backdrop-blur-md">
                                {tagSuggestions.map((item) => (
                                  <div
                                    key={item.id}
                                    onClick={() =>
                                      handleAddCustomTag(item.name)
                                    }
                                    className="hover:bg-muted/70 flex cursor-pointer items-center justify-between rounded-lg px-3 py-1.5 text-xs transition-colors"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-primary font-bold">
                                        #
                                      </span>
                                      <span className="font-medium">
                                        {item.name}
                                      </span>
                                    </div>
                                    {item.category && (
                                      <span className="text-muted-foreground text-[10px]">
                                        {item.category}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Actions for Step 2 - Strictly Matching Uniform Buttons */}
                  <div className="flex items-center justify-between gap-3 pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="border-border/80 bg-background/50 hover:bg-muted/50 h-10 cursor-pointer gap-2 rounded-xl px-5 text-sm font-medium transition-all sm:h-11"
                    >
                      <ArrowLeft className="size-4" />
                      <span>{t("backStep")}</span>
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNextFromStep2}
                      className="h-10 cursor-pointer gap-2 rounded-xl px-6 text-sm font-semibold shadow-md shadow-purple-500/20 transition-all sm:h-11 sm:text-base"
                    >
                      <span>{t("nextStep")}</span>
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: ACCOUNT CREDENTIALS */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs font-medium sm:text-sm">
                            {t("firstName")}{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("firstNamePlaceholder")}
                              autoComplete="given-name"
                              disabled={isSubmitting}
                              className="h-10 rounded-xl text-sm sm:h-10.5"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs font-medium sm:text-sm">
                            {t("lastName")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("lastNamePlaceholder")}
                              autoComplete="family-name"
                              disabled={isSubmitting}
                              className="h-10 rounded-xl text-sm sm:h-10.5"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-medium sm:text-sm">
                          {t("email")}{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder={t("emailPlaceholder")}
                            autoComplete="email"
                            disabled={isSubmitting}
                            className="h-10 rounded-xl text-sm sm:h-10.5"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-medium sm:text-sm">
                          {t("password")}{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder="••••••••"
                            autoComplete="new-password"
                            disabled={isSubmitting}
                            className="h-10 rounded-xl text-sm sm:h-10.5"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-medium sm:text-sm">
                          {t("confirmPassword")}{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder="••••••••"
                            autoComplete="new-password"
                            disabled={isSubmitting}
                            className="h-10 rounded-xl text-sm sm:h-10.5"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Actions for Step 3 - Strictly Matching Uniform Buttons */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(2)}
                      disabled={isSubmitting}
                      className="border-border/80 bg-background/50 hover:bg-muted/50 h-10 cursor-pointer gap-2 rounded-xl px-5 text-sm font-medium transition-all sm:h-11"
                    >
                      <ArrowLeft className="size-4" />
                      <span>{t("backStep")}</span>
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-10 cursor-pointer gap-2 rounded-xl px-6 text-sm font-semibold shadow-md shadow-purple-500/20 transition-all sm:h-11 sm:text-base"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          <span>{t("submitting")}</span>
                        </>
                      ) : (
                        <span>{t("submit")}</span>
                      )}
                    </Button>
                  </div>

                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <span className="border-border/70 w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card text-muted-foreground px-2">
                        {t("orContinueWith")}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    className="hover:bg-accent/80 h-10 w-full cursor-pointer gap-2.5 rounded-xl font-medium transition-all sm:h-11"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() => {
                      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/auth/social/google`;
                    }}
                  >
                    <GoogleIcon className="size-4.5 shrink-0" />
                    <span>{t("continueGoogle")}</span>
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex w-full min-w-0 justify-center px-4 pt-2 sm:px-8 sm:pt-3">
          <p className="text-muted-foreground text-center text-xs sm:text-sm">
            {t("alreadyHaveAccount")}{" "}
            <Link
              href="/auth/login"
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              {t("signIn")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
