"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LANDING_NAV_LINKS } from "@/config/landing";
import { ChevronRight, Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ModeToggle } from "@/components/mode-toggle";
import { WhiteLabelLogo } from "@/lib/white-label";
import { getAppExternalUrl } from "@/lib/subdomain";

export function LandingNavbar() {
  const t = useTranslations("Landing.nav");
  const [mobileOpen, setMobileOpen] = useState(false);

  const navKeys: Record<
    string,
    "explore" | "tags" | "community" | "events" | "ranking"
  > = {
    explore: "explore",
    tags: "tags",
    community: "community",
    events: "events",
    ranking: "ranking",
  };

  const renderDesktopNavLink = (link: (typeof LANDING_NAV_LINKS)[number]) => {
    const isAnchor = link.href.startsWith("#");
    const label = t(navKeys[link.key] || "explore");
    const className =
      "text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors";

    if (isAnchor) {
      return (
        <a key={link.key} href={link.href} className={className}>
          {label}
        </a>
      );
    }

    return (
      <Link key={link.key} href={link.href} className={className}>
        {label}
      </Link>
    );
  };

  const renderMobileNavLink = (link: (typeof LANDING_NAV_LINKS)[number]) => {
    const isAnchor = link.href.startsWith("#");
    const label = t(navKeys[link.key] || "explore");
    const className =
      "text-foreground hover:bg-muted flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors";

    if (isAnchor) {
      return (
        <a
          key={link.key}
          href={link.href}
          onClick={() => setMobileOpen(false)}
          className={className}
        >
          <span>{label}</span>
          <ChevronRight className="text-muted-foreground/60 size-4" />
        </a>
      );
    }

    return (
      <Link
        key={link.key}
        href={link.href}
        onClick={() => setMobileOpen(false)}
        className={className}
      >
        <span>{label}</span>
        <ChevronRight className="text-muted-foreground/60 size-4" />
      </Link>
    );
  };

  return (
    <header className="border-border bg-background sticky top-0 z-50 w-full border-b">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          href="/"
          className="focus-visible:ring-ring flex min-w-0 items-center overflow-hidden rounded-md focus-visible:ring-2 focus-visible:outline-none"
          aria-label={t("homeAria")}
        >
          <WhiteLabelLogo
            width={180}
            height={44}
            className="h-10 w-auto max-w-full object-contain"
            textClassName="line-clamp-1 text-lg sm:text-xl"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden shrink-0 items-center gap-1 xl:flex"
          aria-label={t("mainNavAria")}
        >
          {LANDING_NAV_LINKS.map((link) => renderDesktopNavLink(link))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden shrink-0 items-center gap-2 xl:flex">
          <LanguageSwitcher />
          <ModeToggle className="size-10 rounded-lg shadow-none" />

          <Button
            asChild
            variant="outline"
            className="h-10 rounded-lg px-4 shadow-none"
          >
            <a href={getAppExternalUrl("/auth/login")}>{t("signIn")}</a>
          </Button>

          <Button asChild className="h-10 rounded-lg">
            <a href={getAppExternalUrl("/auth/sign-up")}>{t("signUp")}</a>
          </Button>
        </div>

        {/* Mobile Navigation Trigger */}
        <div className="flex shrink-0 items-center gap-2 xl:hidden">
          <Button asChild className="h-11 rounded-lg px-3">
            <a href={getAppExternalUrl("/auth/sign-up")}>{t("signUp")}</a>
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-11 rounded-lg shadow-none"
                aria-label={t("toggleMenuAria")}
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              aria-describedby={undefined}
              className="bg-card w-[min(100%,22rem)] gap-4 overflow-y-auto p-4 sm:p-6"
            >
              <SheetHeader className="border-border border-b p-0 pb-4 text-left">
                <SheetTitle className="flex items-center gap-1.5 text-xl font-bold">
                  <WhiteLabelLogo
                    width={160}
                    height={40}
                    className="h-9 w-auto object-contain"
                    textClassName="text-xl"
                  />
                </SheetTitle>
              </SheetHeader>

              <nav
                className="flex flex-col gap-1"
                aria-label={t("mainNavAria")}
              >
                {LANDING_NAV_LINKS.map((link) => renderMobileNavLink(link))}
              </nav>

              <div className="border-border flex flex-col gap-3 border-t pt-4">
                <div className="self-start">
                  <LanguageSwitcher />
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="h-11 w-full rounded-lg shadow-none"
                >
                  <a
                    href={getAppExternalUrl("/auth/login")}
                    onClick={() => setMobileOpen(false)}
                  >
                    {t("signIn")}
                  </a>
                </Button>
                <Button asChild className="h-11 w-full rounded-lg">
                  <a
                    href={getAppExternalUrl("/auth/sign-up")}
                    onClick={() => setMobileOpen(false)}
                  >
                    {t("signUp")}
                  </a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
