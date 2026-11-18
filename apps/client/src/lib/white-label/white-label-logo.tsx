"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import React, { useSyncExternalStore } from "react";
import { DEFAULT_BRAND_NAME } from "./white-label.config";
import { useWhiteLabel } from "./white-label-provider";
import { cn } from "@/lib/utils";

type WhiteLabelLogoProps = {
  className?: string;
  width?: number;
  height?: number;
  alt?: string;
  fallback?: React.ReactNode;
  textClassName?: string;
  showEmblemOnFallback?: boolean;
};

const emptySubscribe = () => () => {};

export function WhiteLabelLogo({
  className,
  width = 140,
  height = 36,
  alt,
  fallback,
  textClassName,
  showEmblemOnFallback = true,
}: WhiteLabelLogoProps) {
  const { whiteLabel, isEnabled } = useWhiteLabel();
  const { theme, resolvedTheme } = useTheme();
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const brandName =
    isEnabled && whiteLabel?.brandName
      ? whiteLabel.brandName
      : DEFAULT_BRAND_NAME;

  const defaultFallback = (
    <div className="inline-flex items-center gap-2">
      {showEmblemOnFallback && (
        <div className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-xl shadow-xs">
          <svg
            className="size-4 fill-current"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
      )}
      <span
        className={cn(
          "text-foreground text-xl font-black tracking-tight",
          textClassName
        )}
      >
        {brandName}
      </span>
    </div>
  );

  if (!isEnabled || !whiteLabel) {
    return <>{fallback ?? defaultFallback}</>;
  }

  const isDark = isMounted && (resolvedTheme === "dark" || theme === "dark");
  const logoSrc = (isDark && whiteLabel.siteDarkLogo) || whiteLabel.siteLogo;

  if (!logoSrc) {
    return <>{fallback ?? defaultFallback}</>;
  }

  return (
    <Image
      src={logoSrc}
      alt={alt || brandName}
      width={width}
      height={height}
      className={className || "h-8 w-auto object-contain"}
      priority
      unoptimized={logoSrc.startsWith("http")}
    />
  );
}
