"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Clock, Loader2, Mail, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  extractErrorMessage,
  useResendVerificationEmail,
} from "@/hooks/use-profile";

const COOLDOWN_SECONDS = 60;

interface UnverifiedEmailBannerProps {
  email: string;
}

export function UnverifiedEmailBanner({ email }: UnverifiedEmailBannerProps) {
  const t = useTranslations("Profile.emailVerification");
  const resendMutation = useResendVerificationEmail();
  const storageKey = `verify_email_cooldown_${email}`;

  const [cooldown, setCooldown] = useState<number>(0);

  // Initialize cooldown from sessionStorage if remaining
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.sessionStorage.getItem(storageKey);
    if (stored) {
      const expiry = parseInt(stored, 10);
      const remaining = Math.max(0, Math.ceil((expiry - Date.now()) / 1000));
      if (remaining > 0) {
        setCooldown(remaining);
      } else {
        window.sessionStorage.removeItem(storageKey);
      }
    }
  }, [storageKey]);

  // Interval countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = window.setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (typeof window !== "undefined") {
            window.sessionStorage.removeItem(storageKey);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown, storageKey]);

  const handleResend = async () => {
    if (cooldown > 0 || resendMutation.isPending) return;

    try {
      await resendMutation.mutateAsync({ email });
      toast.success(t("successToast"));

      // Set cooldown for 60 seconds
      setCooldown(COOLDOWN_SECONDS);
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          storageKey,
          String(Date.now() + COOLDOWN_SECONDS * 1000)
        );
      }
    } catch (error) {
      const msg = extractErrorMessage(error, t("errorToast"));
      toast.error(msg);
    }
  };

  const isPending = resendMutation.isPending;
  const isCooldownActive = cooldown > 0;

  return (
    <div
      role="alert"
      className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-950 shadow-2xs backdrop-blur-xs sm:flex-row sm:items-center sm:p-5 dark:text-amber-100"
    >
      <div className="flex items-start gap-3.5 sm:items-center">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400"
          aria-hidden="true"
        >
          <ShieldAlert className="size-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-foreground text-sm font-bold tracking-tight sm:text-base">
            {t("bannerTitle")}
          </h3>
          <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
            {t("bannerDescription", { email })}
          </p>
        </div>
      </div>

      <div className="w-full shrink-0 sm:w-auto">
        <Button
          type="button"
          variant="outline-warning"
          size="sm"
          disabled={isPending || isCooldownActive}
          onClick={handleResend}
          className="w-full gap-2 rounded-xl text-xs font-semibold sm:w-auto"
        >
          {isPending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              <span>{t("sending")}</span>
            </>
          ) : isCooldownActive ? (
            <>
              <Clock className="size-3.5 opacity-70" aria-hidden="true" />
              <span>{t("cooldown", { seconds: String(cooldown) })}</span>
            </>
          ) : (
            <>
              <Mail className="size-3.5" aria-hidden="true" />
              <span>{t("resendButton")}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
