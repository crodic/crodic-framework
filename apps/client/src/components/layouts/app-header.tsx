"use client";

import React, { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import {
  Bell,
  ChevronDown,
  LogOut,
  MessageSquare,
  Plus,
  Search,
  Settings,
  User,
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
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CreateAlbumModal } from "@/components/studio/create-album-modal";
import { MobileSearchDialog } from "@/components/explore/mobile-search-dialog";

export function AppHeader() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

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
          <div className="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-lg shadow-xs">
            <svg
              className="size-3.5 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="flex items-center text-base font-bold">
            <span className="text-primary font-bold">Cos</span>
            <span className="text-foreground font-bold">Space</span>
          </span>
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
            placeholder="Tìm kiếm cosplayer, dự án, series..."
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

      {/* Right Area: Actions + User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search Button (visible only on mobile) */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileSearchOpen(true)}
          className="border-border/70 bg-card/60 text-muted-foreground hover:text-foreground size-8.5 cursor-pointer rounded-lg sm:size-9 md:hidden"
          aria-label="Tìm kiếm"
        >
          <Search className="size-4" />
        </Button>

        {/* "+ Đăng album" Action Button - Desktop */}
        <CreateAlbumModal
          trigger={
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 hidden h-9 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-semibold whitespace-nowrap shadow-xs transition-all hover:scale-[1.02] sm:px-4 sm:text-sm md:inline-flex"
            >
              <Plus className="size-4 shrink-0" />
              <span>Đăng album</span>
            </Button>
          }
        />

        {/* Theme mode toggle - Desktop only */}
        <div className="hidden md:block">
          <ModeToggle className="border-border/70 bg-card/60 size-9 rounded-lg" />
        </div>

        {/* Notification Bell - Both Mobile & Desktop */}
        <Button
          variant="outline"
          size="icon"
          className="border-border/70 bg-card/60 text-muted-foreground hover:text-foreground relative size-8.5 cursor-pointer rounded-lg sm:size-9"
          aria-label="Thông báo"
        >
          <Bell className="size-4" />
          <span className="bg-primary absolute top-2 right-2 size-2 rounded-full" />
        </Button>

        {/* Chat / Messages - Desktop only */}
        <Button
          variant="outline"
          size="icon"
          className="border-border/70 bg-card/60 text-muted-foreground hover:text-foreground hidden size-9 cursor-pointer rounded-lg md:inline-flex"
          aria-label="Tin nhắn"
        >
          <MessageSquare className="size-4" />
        </Button>

        {/* User Account Profile Pill */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="border-border/70 bg-card/60 hover:bg-muted flex h-8.5 cursor-pointer items-center gap-2 rounded-full border px-1 sm:h-9 sm:px-2.5"
            >
              <Avatar className="border-primary/30 size-7 border">
                <AvatarImage src="/landing/avatar-acheron.jpg" alt="Hải Anh" />
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                  HA
                </AvatarFallback>
              </Avatar>
              <span className="text-foreground hidden text-xs font-semibold md:inline">
                Hải Anh
              </span>
              <ChevronDown className="text-muted-foreground hidden size-3.5 sm:inline" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5">
            <DropdownMenuLabel className="px-2.5 py-2 font-normal">
              <div className="flex flex-col space-y-0.5">
                <p className="text-foreground text-sm font-bold">Hải Anh</p>
                <p className="text-muted-foreground text-xs">
                  haianh.cos@visel.click
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              asChild
              className="cursor-pointer rounded-lg text-xs"
            >
              <Link href="/profile" className="flex items-center gap-2">
                <User className="text-primary size-4" />
                <span>Portfolio của tôi</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="cursor-pointer rounded-lg text-xs"
            >
              <Link href="/settings" className="flex items-center gap-2">
                <Settings className="text-primary size-4" />
                <span>Cài đặt & Studio</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer rounded-lg text-xs">
              <LogOut className="mr-2 size-4" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Search Dialog */}
      <MobileSearchDialog
        open={mobileSearchOpen}
        onOpenChange={setMobileSearchOpen}
      />
    </header>
  );
}
