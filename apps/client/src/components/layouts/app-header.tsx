"use client";

import React, { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import {
  Bell,
  ChevronDown,
  LogOut,
  Plus,
  Search,
  Settings,
  User as UserIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CreateAlbumModal } from "@/components/studio/create-album-modal";
import { WhiteLabelLogo } from "@/lib/white-label";
import { useAuthStore } from "@/store/use-auth-store";
import { useProfile, useSignOut } from "@/hooks/use-profile";
import { useQuery } from "@tanstack/react-query";
import { getUnreadNotificationCount } from "@/services/notifications";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export function AppHeader() {
  const router = useRouter();
  const t = useTranslations("Navigation");
  const [searchQuery, setSearchQuery] = useState("");

  // Authentication State
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const { data: profile } = useProfile();
  const signOutMutation = useSignOut();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: getUnreadNotificationCount,
    enabled: !isHydrating && isAuthenticated,
    staleTime: 30 * 1000,
  });

  const displayName =
    profile?.fullName ||
    (profile?.firstName
      ? `${profile.firstName} ${profile.lastName || ""}`.trim()
      : profile?.email?.split("@")[0] || t("guest")) ||
    t("guest");
  const displayEmail = profile?.email || "";
  const displayAvatar = profile?.avatar || "";
  const initials =
    displayName
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  const handleLogout = () => {
    signOutMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success(t("logoutSuccess"));
      },
      onError: () => {
        toast.error(t("logoutError"));
      },
    });
  };

  const handleDesktopSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="border-border bg-background sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between gap-2 border-b px-4 sm:gap-4 sm:px-6">
      {/* Left Area: Unified Sidebar Trigger (same PanelLeft icon on mobile & desktop) + Mobile Logo or Desktop Search */}
      <div className="flex max-w-xl min-w-0 flex-1 items-center gap-1 sm:gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground hover:bg-muted -ml-2 size-10 shrink-0 cursor-pointer rounded-lg" />

        {/* Mobile Brand Logo (hidden on desktop where AppSidebar is visible) */}
        <Link
          href="/"
          className="flex min-w-0 cursor-pointer items-center overflow-hidden text-base font-semibold tracking-tight md:hidden"
        >
          <WhiteLabelLogo
            width={160}
            height={40}
            className="h-8 w-auto max-w-full object-contain"
            textClassName="truncate text-base"
            showEmblemOnFallback={false}
          />
        </Link>

        {/* Desktop Search Bar (hidden on mobile) */}
        <form
          onSubmit={handleDesktopSearch}
          className="relative hidden w-full max-w-xs sm:max-w-md md:block"
        >
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("search")}
            className="h-10 w-full rounded-lg pr-10 pl-9 [&::-webkit-search-cancel-button]:hidden"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label={t("clearSearch")}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-1 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-md focus-visible:ring-2"
            >
              <X className="size-3" />
            </button>
          )}
        </form>
      </div>

      {/* Right Area: Actions + User Profile or Guest Auth */}
      <div className="flex shrink-0 items-center gap-2">
        {/* "+ Đăng album" Action Button - Desktop (Only visible for authenticated users) */}
        {isAuthenticated && (
          <CreateAlbumModal
            trigger={
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 hidden h-10 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-semibold whitespace-nowrap shadow-xs transition-colors sm:px-4 sm:text-sm md:inline-flex"
              >
                <Plus className="size-4 shrink-0" />
                <span>{t("postAlbum")}</span>
              </Button>
            }
          />
        )}

        {/* Language Switcher & Theme Mode Toggle (Desktop only; moved to Sidebar Sheet on mobile) */}
        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          <ModeToggle />
        </div>

        {isHydrating ? (
          // Hydrating Skeleton
          <div className="bg-muted h-10 w-16 rounded-lg motion-safe:animate-pulse sm:w-24" />
        ) : isAuthenticated ? (
          <>
            {/* Notification Bell - Both Mobile & Desktop (Direct link to /notifications) */}
            <Button
              variant="outline"
              size="icon"
              asChild
              className="text-muted-foreground hover:text-foreground relative size-10 rounded-lg shadow-none"
              aria-label={t("notifications")}
            >
              <Link href="/notifications">
                <Bell className="size-4" />
                {unreadCount > 0 && (
                  <span className="bg-primary absolute top-2 right-2 size-2 rounded-full" />
                )}
              </Link>
            </Button>

            {/* User Account Profile Pill */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  aria-label={displayName}
                  className="size-10 rounded-lg p-0 shadow-none has-[>svg]:p-0 md:size-auto md:h-10 md:gap-2 md:px-2.5 md:has-[>svg]:px-2.5"
                >
                  <Avatar className="size-7 rounded-md">
                    <AvatarImage
                      src={displayAvatar}
                      alt={displayName}
                      className="rounded-md"
                    />
                    <AvatarFallback className="bg-primary/20 text-primary rounded-md text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-foreground hidden max-w-[120px] truncate text-xs font-semibold md:inline">
                    {displayName}
                  </span>
                  <ChevronDown className="text-muted-foreground hidden size-3.5 md:inline" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 rounded-xl p-1.5"
              >
                <DropdownMenuLabel className="px-2.5 py-2 font-normal">
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-foreground truncate text-sm font-bold">
                      {displayName}
                    </p>
                    {displayEmail && (
                      <p className="text-muted-foreground truncate text-xs">
                        {displayEmail}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer rounded-lg text-xs"
                >
                  <Link href="/profile" className="flex items-center gap-2">
                    <UserIcon className="text-primary size-4" />
                    <span>{t("portfolio")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer rounded-lg text-xs"
                >
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="text-primary size-4" />
                    <span>{t("settings")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive cursor-pointer rounded-lg text-xs"
                >
                  <LogOut className="mr-2 size-4" />
                  <span>{t("logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          /* Guest Buttons: Login & Sign-up */
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hidden h-10 rounded-lg sm:inline-flex"
            >
              <Link href="/auth/login">{t("signIn")}</Link>
            </Button>
            <Button
              size="sm"
              asChild
              className="h-10 rounded-lg px-3 text-xs sm:px-4 sm:text-sm"
            >
              <Link href="/auth/sign-up">{t("signUp")}</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
