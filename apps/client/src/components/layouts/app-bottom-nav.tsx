"use client";

import React, { useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { Compass, Home, LogIn, Search, User, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/use-auth-store";
import { MobileSearchDialog } from "@/components/explore/mobile-search-dialog";

interface BottomNavItem {
  label: string;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  hasBadge?: boolean;
}

function isNavItemActive(href: string, pathname: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  if (href === "/profile") {
    return (
      pathname.startsWith("/profile") || pathname.startsWith("/cosplayer/")
    );
  }
  return pathname.startsWith(href);
}

export function AppBottomNav() {
  const pathname = usePathname();
  const t = useTranslations("Navigation");
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const navItems: BottomNavItem[] = isAuthenticated
    ? [
        { label: t("home"), href: "/", icon: Home },
        { label: t("feed"), href: "/feed", icon: Users },
        {
          label: t("search"),
          onClick: () => setMobileSearchOpen(true),
          isActive: mobileSearchOpen,
          icon: Search,
        },
        { label: t("explore"), href: "/explore", icon: Compass },
        { label: t("personalGroup"), href: "/profile", icon: User },
      ]
    : [
        { label: t("home"), href: "/", icon: Home },
        {
          label: t("search"),
          onClick: () => setMobileSearchOpen(true),
          isActive: mobileSearchOpen,
          icon: Search,
        },
        { label: t("explore"), href: "/explore", icon: Compass },
        { label: t("signIn"), href: "/auth/login", icon: LogIn },
      ];

  return (
    <>
      <nav
        className="bg-background border-border fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t px-2 pt-1 pb-[calc(0.25rem+env(safe-area-inset-bottom))] md:hidden"
        aria-label={t("exploreGroup")}
      >
        {navItems.map((item) => {
          const isActive =
            typeof item.isActive === "boolean"
              ? item.isActive
              : item.href
                ? isNavItemActive(item.href, pathname)
                : false;
          const Icon = item.icon;
          const itemClassName = cn(
            "relative flex min-h-11 min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-xs font-medium transition-colors",
            isActive
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground"
          );
          const content = (
            <>
              <div className="relative">
                <Icon className="size-5" />
                {item.hasBadge && (
                  <span className="bg-primary absolute -top-1 -right-1 size-2 rounded-full" />
                )}
              </div>
              <span className="truncate">{item.label}</span>
            </>
          );

          if (item.onClick) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                aria-expanded={mobileSearchOpen}
                className={itemClassName}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href!}
              aria-current={isActive ? "page" : undefined}
              className={itemClassName}
            >
              {content}
            </Link>
          );
        })}
      </nav>

      <MobileSearchDialog
        open={mobileSearchOpen}
        onOpenChange={setMobileSearchOpen}
      />
    </>
  );
}
