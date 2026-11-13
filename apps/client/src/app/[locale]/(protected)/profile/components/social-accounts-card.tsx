"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLinkGoogle, useSocialAccounts } from "@/hooks/use-profile";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef } from "react";
import { toast } from "sonner";
import { CheckCircle2, Globe, Loader2 } from "lucide-react";

function GoogleLinkButtonContent({
  isLinking,
  hasGoogleLinked,
  t,
}: {
  isLinking: boolean;
  hasGoogleLinked: boolean;
  t: ReturnType<typeof useTranslations<"Security.social">>;
}) {
  if (isLinking) {
    return (
      <>
        <Loader2 className="mr-2 size-4 animate-spin" />
        {t("linking")}
      </>
    );
  }
  if (hasGoogleLinked) {
    return <>{t("linked")}</>;
  }
  return <>{t("linkGoogle")}</>;
}

export function SocialAccountsCard() {
  const t = useTranslations("Security.social");
  const { data: socialAccounts = [], isLoading } = useSocialAccounts();
  const linkGoogleMutation = useLinkGoogle();
  const router = useRouter();
  const searchParams = useSearchParams();
  const handledSocialStatusRef = useRef(false);

  useEffect(() => {
    if (handledSocialStatusRef.current) {
      return;
    }

    const social = searchParams.get("social");
    if (!social) {
      return;
    }

    handledSocialStatusRef.current = true;

    if (social === "linked") {
      toast.success(t("linkSuccess"));
    } else if (social === "failed") {
      toast.error(t("linkError"));
    }

    // Clean up query param
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("social");
    const query = nextParams.toString();
    router.replace(query ? `/profile?${query}` : "/profile");
  }, [router, searchParams, t]);

  const hasGoogleLinked = socialAccounts.some(
    (account) => account.provider === "google"
  );

  const handleLinkGoogle = async () => {
    try {
      await linkGoogleMutation.mutateAsync();
    } catch {
      toast.error(t("linkError"));
    }
  };

  const isLinking = linkGoogleMutation.isPending;

  return (
    <Card className="border-border/60 rounded-2xl shadow-xs">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="text-primary size-5" />
          <CardTitle className="text-lg font-semibold sm:text-xl">
            {t("title")}
          </CardTitle>
        </div>
        <CardDescription className="text-xs sm:text-sm">
          {t("description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border-border/50 bg-background/50 flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl font-bold">
              G
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-foreground text-sm font-semibold">
                  {t("google")}
                </span>
                {hasGoogleLinked ? (
                  <Badge
                    variant="outline-success"
                    className="gap-1 text-xs font-medium"
                  >
                    <CheckCircle2 className="size-3" />
                    {t("linked")}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs font-normal">
                    {t("notLinked")}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-xs">
                {t("googleDescription")}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant={hasGoogleLinked ? "secondary" : "outline"}
            disabled={hasGoogleLinked || isLinking || isLoading}
            onClick={handleLinkGoogle}
            className="shrink-0 rounded-xl text-xs"
          >
            <GoogleLinkButtonContent
              isLinking={isLinking}
              hasGoogleLinked={hasGoogleLinked}
              t={t}
            />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
