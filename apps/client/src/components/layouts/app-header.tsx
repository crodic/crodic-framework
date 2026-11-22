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
import { MobileSearchDialog } from "@/components/explore/mobile-search-dialog";
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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

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
    <header className="border-border/60 bg-background/85 sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b px-4 backdrop-blur-md sm:px-6">
      {/* Left Area: Unified Sidebar Trigger (same PanelLeft icon on mobile & desktop) + Mobile Logo or Desktop Search */}
      <div className="flex max-w-xl flex-1 items-center gap-2 sm:gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground hover:bg-muted/60 -ml-1 size-8 shrink-0 cursor-pointer rounded-lg" />

        {/* Mobile Brand Logo (hidden on desktop where AppSidebar is visible) */}
        <Link
          href="/"
          className="flex cursor-pointer items-center gap-1.5 text-base font-black tracking-tight select-none md:hidden"
        >
          <WhiteLabelLogo
            className="h-7 w-auto object-contain"
            textClassName="text-base"
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
            className="border-border/70 bg-card/60 focus-visible:ring-primary/40 focus-visible:border-primary/60 h-9 w-full rounded-xl pr-8 pl-9 text-xs transition-colors sm:text-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded-full p-0.5"
            >
              <X className="size-3" />
            </button>
          )}
        </form>
      </div>

      {/* Right Area: Actions + User Profile or Guest Auth */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search Button (visible only on mobile) */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileSearchOpen(true)}
          className="border-border/70 bg-card/60 text-muted-foreground hover:text-foreground size-8.5 cursor-pointer rounded-lg sm:size-9 md:hidden"
          aria-label={t("search")}
        >
          <Search className="size-4" />
        </Button>

        {/* "+ Đăng album" Action Button - Desktop (Only visible for authenticated users) */}
        {isAuthenticated && (
          <CreateAlbumModal
            trigger={
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 hidden h-9 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-semibold whitespace-nowrap shadow-xs transition-all hover:scale-[1.02] sm:px-4 sm:text-sm md:inline-flex"
              >
                <Plus className="size-4 shrink-0" />
                <span>{t("postAlbum")}</span>
              </Button>
            }
          />
        )}

        {/* Language Switcher & Theme Mode Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <LanguageSwitcher />
          <div className="hidden md:block">
            <ModeToggle className="border-border/70 bg-card/60 size-9 rounded-lg" />
          </div>
        </div>

        {isHydrating ? (
          // Hydrating Skeleton
          <div className="bg-muted/60 h-9 w-24 animate-pulse rounded-full" />
        ) : isAuthenticated ? (
          <>
            {/* Notification Bell - Both Mobile & Desktop (Direct link to /notifications) */}
            <Button
              variant="outline"
              size="icon"
              asChild
              className="border-border/70 bg-card/60 text-muted-foreground hover:text-foreground relative size-8.5 cursor-pointer rounded-lg sm:size-9"
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
                  variant="ghost"
                  aria-label={displayName}
                  className="border-border/70 bg-card/60 hover:bg-muted flex size-8.5 cursor-pointer items-center justify-center rounded-full border p-0 has-[>svg]:p-0 sm:size-9 md:size-auto md:h-9 md:gap-2 md:px-2.5 md:has-[>svg]:px-2.5"
                >
                  <Avatar className="border-primary/30 size-7 border">
                    <AvatarImage src={displayAvatar} alt={displayName} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
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
              className="text-muted-foreground hover:text-foreground h-9 cursor-pointer rounded-lg text-xs font-semibold sm:text-sm"
            >
              <Link href="/auth/login">{t("signIn")}</Link>
            </Button>
            <Button
              size="sm"
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 h-9 cursor-pointer rounded-lg px-3.5 text-xs font-semibold shadow-xs sm:px-4 sm:text-sm"
            >
              <Link href="/auth/sign-up">{t("signUp")}</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Search Dialog */}
      <MobileSearchDialog
        open={mobileSearchOpen}
        onOpenChange={setMobileSearchOpen}
      />
    </header>
  );
}
