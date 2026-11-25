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
import { useScroll } from "@/hooks/use-scroll";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ModeToggle } from "@/components/mode-toggle";
import { WhiteLabelLogo } from "@/lib/white-label";
import { getAppExternalUrl } from "@/lib/subdomain";

export function LandingNavbar() {
  const t = useTranslations("Landing.nav");
  const scrolled = useScroll(10);
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
      "text-foreground hover:bg-muted flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-base font-medium transition-colors";

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
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-200",
        scrolled
          ? "border-border/60 bg-background/85 shadow-xs backdrop-blur-md"
          : "bg-background/40 border-transparent backdrop-blur-xs"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          href="/"
          className="group focus-visible:ring-ring flex items-center gap-1.5 rounded-md focus-visible:ring-2 focus-visible:outline-none"
          aria-label={t("homeAria")}
        >
          <WhiteLabelLogo
            width={180}
            height={44}
            className="h-10 w-auto object-contain"
            textClassName="text-2xl"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden items-center gap-1 md:flex lg:gap-2"
          aria-label={t("mainNavAria")}
        >
          {LANDING_NAV_LINKS.map((link) => renderDesktopNavLink(link))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden items-center gap-2.5 sm:flex">
          <LanguageSwitcher />
          <ModeToggle className="border-border/70 bg-card/40 size-9 rounded-full" />

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="border-border/70 bg-card/40 hover:bg-muted/60 text-foreground h-9 cursor-pointer rounded-full border px-4 font-medium transition-colors"
          >
            <a href={getAppExternalUrl("/auth/login")}>{t("signIn")}</a>
          </Button>

          <Button
            asChild
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 cursor-pointer rounded-full px-5 font-medium shadow-2xs transition-colors"
          >
            <a href={getAppExternalUrl("/auth/sign-up")}>{t("signUp")}</a>
          </Button>
        </div>

        {/* Mobile Navigation Trigger */}
        <div className="flex items-center gap-2 sm:hidden">
          <LanguageSwitcher />
          <Button
            asChild
            size="sm"
            className="bg-primary text-primary-foreground h-8 rounded-full px-3 text-xs"
          >
            <a href={getAppExternalUrl("/auth/sign-up")}>{t("signUp")}</a>
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="border-border/80 bg-card/60 size-9 rounded-lg"
                aria-label={t("toggleMenuAria")}
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-card w-[300px] p-6 sm:w-[360px]"
            >
              <SheetHeader className="border-border/40 border-b pb-4 text-left">
                <SheetTitle className="flex items-center gap-1.5 text-xl font-bold">
                  <WhiteLabelLogo
                    width={160}
                    height={40}
                    className="h-9 w-auto object-contain"
                    textClassName="text-xl"
                  />
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-2 py-6">
                {LANDING_NAV_LINKS.map((link) => renderMobileNavLink(link))}
              </div>

              <div className="border-border/40 flex flex-col gap-3 border-t pt-4">
                <Button
                  asChild
                  variant="outline"
                  className="border-border bg-background w-full rounded-full"
                >
                  <a
                    href={getAppExternalUrl("/auth/login")}
                    onClick={() => setMobileOpen(false)}
                  >
                    {t("signIn")}
                  </a>
                </Button>
                <Button
                  asChild
                  className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-full shadow-2xs transition-colors"
                >
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
