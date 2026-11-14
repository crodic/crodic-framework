"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { Bell, Home, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Trang chủ", href: "/", icon: Home },
    { label: "Tìm kiếm", href: "/search", icon: Search },
    { label: "Cá nhân", href: "/profile", icon: User },
    { label: "Thông báo", href: "/notifications", icon: Bell, hasBadge: true },
  ];

  return (
    <nav
      className="bg-background/95 border-border/70 fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t px-4 py-1.5 shadow-lg backdrop-blur-md md:hidden"
      aria-label="Điều hướng di động"
    >
      {navItems.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "relative flex cursor-pointer flex-col items-center justify-center rounded-xl px-3 py-1 text-[10px] font-medium transition-colors",
              isActive
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="relative">
              <Icon className="size-5" />
              {item.hasBadge && (
                <span className="bg-primary absolute -top-1 -right-1 size-2 rounded-full" />
              )}
            </div>
            <span className="mt-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
