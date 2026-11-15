"use client";

import React, { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import {
  ArrowLeft,
  Bell,
  EyeOff,
  Link as LinkIcon,
  Palette,
  ShieldCheck,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SecuritySettings } from "./security-settings";
import { AppearanceSettings } from "./appearance-settings";
import { NotificationsSettings } from "./notifications-settings";
import { ConnectedAccountsSettings } from "./connected-accounts-settings";
import { PrivacySettings } from "./privacy-settings";
import { cn } from "@/lib/utils";

type SettingsSection =
  "security" | "appearance" | "notifications" | "connected" | "privacy";

interface NavItem {
  id: SettingsSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SETTINGS_NAV: NavItem[] = [
  { id: "security", label: "Bảo mật tài khoản", icon: ShieldCheck },
  { id: "appearance", label: "Giao diện Sáng/Tối", icon: Palette },
  { id: "notifications", label: "Cài đặt Thông báo", icon: Bell },
  { id: "connected", label: "Liên kết tài khoản", icon: LinkIcon },
  { id: "privacy", label: "Quyền riêng tư & Dữ liệu", icon: EyeOff },
];

export function SettingsView() {
  const router = useRouter();
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("security");

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/profile");
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Page Header matching Mockup 1 */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground h-9 cursor-pointer gap-1.5 rounded-xl px-2.5 text-xs"
          >
            <ArrowLeft className="size-4" />
            <span className="font-semibold">Quay lại</span>
          </Button>

          <h1 className="text-foreground text-xl font-extrabold tracking-tight sm:text-2xl">
            Cài đặt & Thiết lập
          </h1>
        </div>

        {/* Quick link to Profile */}
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-border/70 hidden h-9 gap-1.5 rounded-xl text-xs sm:flex"
        >
          <Link href="/profile">
            <User className="text-primary size-3.5" />
            <span>Hồ sơ cá nhân</span>
          </Link>
        </Button>
      </div>

      {/* Main Settings Layout: 2 Columns on Desktop, Stacked / Tabs on Mobile */}
      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-12">
        {/* Left Sub-nav (Desktop) / Horizontal Tabs (Mobile) */}
        <div className="md:col-span-4 lg:col-span-3">
          {/* Mobile horizontal pill navigation */}
          <div className="flex scrollbar-none items-center gap-1.5 overflow-x-auto pb-2 md:hidden">
            {SETTINGS_NAV.map((item) => {
              const isActive = activeSection === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border-border/60 border"
                  )}
                >
                  <Icon className="size-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop Left Sub-nav Card (Matching Mockup 1) */}
          <div className="border-border/70 bg-card/60 hidden space-y-1 rounded-2xl border p-2 shadow-xs md:block">
            <Link
              href="/profile"
              className="text-muted-foreground hover:text-foreground hover:bg-muted/60 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors"
            >
              <User className="text-primary size-4" />
              <span>Hồ sơ cá nhân (Chỉnh sửa)</span>
            </Link>

            <div className="bg-border/50 mx-2 my-1 h-px" />

            {SETTINGS_NAV.map((item) => {
              const isActive = activeSection === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-all",
                    isActive
                      ? "bg-primary/15 text-primary border-primary/25 border font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="md:col-span-8 lg:col-span-9">
          {activeSection === "security" && <SecuritySettings />}
          {activeSection === "appearance" && <AppearanceSettings />}
          {activeSection === "notifications" && <NotificationsSettings />}
          {activeSection === "connected" && <ConnectedAccountsSettings />}
          {activeSection === "privacy" && <PrivacySettings />}
        </div>
      </div>
    </div>
  );
}
