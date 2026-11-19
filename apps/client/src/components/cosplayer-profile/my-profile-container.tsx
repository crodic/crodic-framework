"use client";

import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getMyCosplayerProfile,
  type CosplayerDetailResDto,
} from "@/services/cosplayer";
import { Compass, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/use-auth-store";

export function MyProfileContainer() {
  const t = useTranslations("Common");
  const tOnboarding = useTranslations("Onboarding");
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isHydrating = useAuthStore((state) => state.isHydrating);

  // 1. Fetch current user cosplayer profile from real backend API
  const {
    data: cosplayerProfile,
    isLoading: isCosplayerLoading,
    isError,
  } = useQuery<CosplayerDetailResDto>({
    queryKey: ["my-cosplayer-profile"],
    queryFn: getMyCosplayerProfile,
    staleTime: 1000 * 60 * 2,
    enabled: !isHydrating && !!accessToken,
    retry: false,
  });

  // 2. Seamlessly redirect to the unified canonical profile URL (/cosplayer/[slug])
  useEffect(() => {
    if (cosplayerProfile?.slug) {
      router.replace(`/cosplayer/${cosplayerProfile.slug}`);
    }
  }, [cosplayerProfile?.slug, router]);

  // 3. Loading state while hydrating or waiting for redirect
  if (
    isHydrating ||
    isCosplayerLoading ||
    (cosplayerProfile?.slug && !isError)
  ) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="text-primary size-8 animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">
          {t("loading")}
        </p>
      </div>
    );
  }

  // 4. Fallback if user doesn't have a cosplayer profile yet: prompt to onboard
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div className="bg-primary/10 text-primary flex size-16 items-center justify-center rounded-2xl">
        <Compass className="size-8" />
      </div>
      <div className="max-w-md space-y-2">
        <h3 className="text-foreground text-lg font-bold">
          {tOnboarding("banner.title")}
        </h3>
        <p className="text-muted-foreground text-sm">
          {tOnboarding("banner.desc")}
        </p>
      </div>
      <Button asChild className="rounded-xl px-6 font-semibold">
        <Link href="/onboarding">{tOnboarding("banner.cta")}</Link>
      </Button>
    </div>
  );
}

export default MyProfileContainer;
