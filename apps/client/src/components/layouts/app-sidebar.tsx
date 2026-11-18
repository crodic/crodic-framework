"use client";

import React from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { APP_SIDEBAR_NAV } from "@/config/navigation";
import { useAuthStore } from "@/store/use-auth-store";
import { isProtectedRoute } from "@/config/routes";
import {
  BookOpen,
  Calendar,
  Compass,
  Folder,
  FolderHeart,
  Home,
  Newspaper,
  Settings,
  Star,
  Trophy,
  Users,
} from "lucide-react";

export function AppSidebar() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const tNav = useTranslations("Navigation");

  const visibleNavGroups = APP_SIDEBAR_NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      const needsAuth = item.requireAuth || isProtectedRoute(item.href);
      return !needsAuth || isAuthenticated;
    }),
  })).filter((group) => group.items.length > 0);

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const getNavIcon = (iconName: string) => {
    switch (iconName) {
      case "home":
        return <Home className="size-4 shrink-0" />;
      case "compass":
        return <Compass className="size-4 shrink-0" />;
      case "star":
        return <Star className="size-4 shrink-0" />;
      case "folder":
        return <Folder className="size-4 shrink-0" />;
      case "calendar":
        return <Calendar className="size-4 shrink-0" />;
      case "trophy":
        return <Trophy className="size-4 shrink-0" />;
      case "newspaper":
        return <Newspaper className="size-4 shrink-0" />;
      case "book-open":
        return <BookOpen className="size-4 shrink-0" />;
      case "users":
        return <Users className="size-4 shrink-0" />;
      case "user-circle":
        return <FolderHeart className="size-4 shrink-0" />;
      case "settings":
        return <Settings className="size-4 shrink-0" />;
      default:
        return <Compass className="size-4 shrink-0" />;
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-sidebar-border bg-sidebar border-r"
    >
      {/* Brand Header: Collapses smoothly to emblem icon (shadcn sidebar-07 pattern) */}
      <SidebarHeader className="border-sidebar-border/60 flex h-16 justify-center border-b p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              tooltip="Kosume"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-colors"
            >
              <Link href="/" onClick={handleLinkClick}>
                {/* Hexagon Brand Emblem */}
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 shrink-0 items-center justify-center rounded-xl shadow-xs">
                  <svg
                    className="size-4 fill-current"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="text-sidebar-foreground truncate text-base font-bold">
                    Kosume
                  </span>
                  <span className="text-muted-foreground truncate text-[11px] font-medium">
                    Portfolio Hub
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Nav Content */}
      <SidebarContent className="space-y-2 p-2">
        {visibleNavGroups.map((group) => {
          const groupTitle = tNav.has(group.titleKey as any)
            ? tNav(group.titleKey as any)
            : group.defaultTitle;

          return (
            <SidebarGroup key={group.titleKey} className="p-0">
              <SidebarGroupLabel className="text-sidebar-foreground/50 px-2 text-[11px] font-semibold tracking-wider uppercase">
                {groupTitle}
              </SidebarGroupLabel>
              <SidebarGroupContent className="pt-1">
                <SidebarMenu className="space-y-0.5">
                  {group.items.map((item) => {
                    const isCurrent =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href);
                    const itemLabel = tNav.has(item.labelKey as any)
                      ? tNav(item.labelKey as any)
                      : item.defaultLabel;

                    return (
                      <SidebarMenuItem key={item.labelKey}>
                        <SidebarMenuButton
                          asChild
                          isActive={isCurrent}
                          tooltip={itemLabel}
                          className="data-[active=true]:bg-primary/15 data-[active=true]:text-primary data-[active=true]:hover:bg-primary/20 h-9 cursor-pointer rounded-xl px-2.5 text-xs font-medium transition-colors data-[active=true]:font-semibold"
                        >
                          <Link href={item.href} onClick={handleLinkClick}>
                            {getNavIcon(item.icon)}
                            <span className="truncate group-data-[collapsible=icon]:hidden">
                              {itemLabel}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      {/* Subtle Sidebar Rail */}
      <SidebarRail />
    </Sidebar>
  );
}
