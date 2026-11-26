"use client";

import React from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
import { LanguageSwitcher } from "@/components/language-switcher";
import { ModeToggle } from "@/components/mode-toggle";
import { APP_SIDEBAR_NAV } from "@/config/navigation";
import { useAuthStore } from "@/store/use-auth-store";
import { isProtectedRoute } from "@/config/routes";
import {
  WhiteLabelLogo,
  useWhiteLabel,
  DEFAULT_BRAND_NAME,
} from "@/lib/white-label";
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
  const { whiteLabel } = useWhiteLabel();
  const tNav = useTranslations("Navigation");
  const brandName = whiteLabel?.brandName || DEFAULT_BRAND_NAME;

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
              tooltip={brandName}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 h-12 px-2 py-1 transition-colors"
            >
              <Link href="/" onClick={handleLinkClick}>
                <WhiteLabelLogo
                  width={180}
                  height={44}
                  className="h-10 w-auto max-w-full object-contain object-left group-data-[collapsible=icon]:size-8"
                  textClassName="text-lg"
                />
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
              <SidebarGroupLabel className="text-muted-foreground px-2 text-xs font-medium">
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
                          className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:hover:bg-primary/15 h-10 cursor-pointer rounded-lg px-2.5 text-sm font-medium transition-colors data-[active=true]:font-semibold"
                        >
                          <Link
                            href={item.href}
                            aria-current={isCurrent ? "page" : undefined}
                            onClick={handleLinkClick}
                          >
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

      {/* Mobile Quick Preferences Footer (Language & Theme) */}
      <SidebarFooter className="border-sidebar-border/60 border-t p-3 md:hidden">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground text-xs font-medium">
            {tNav("language")}
          </span>
          <div className="flex items-center gap-2">
            <LanguageSwitcher align="end" />
            <ModeToggle />
          </div>
        </div>
      </SidebarFooter>

      {/* Subtle Sidebar Rail */}
      <SidebarRail />
    </Sidebar>
  );
}
