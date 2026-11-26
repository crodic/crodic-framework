"use client";

import React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import { AppBottomNav } from "./app-bottom-nav";
import { MobileCreatePostFab } from "./mobile-create-post-fab";
import { AppRightRail } from "./app-right-rail";

interface AppShellProps {
  children: React.ReactNode;
  showRightRail?: boolean;
  defaultOpen?: boolean;
}

export function AppShell({
  children,
  showRightRail = true,
  defaultOpen = true,
}: AppShellProps) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      {/* Official shadcn Sidebar */}
      <AppSidebar />

      {/* Main Content Inset */}
      <SidebarInset className="bg-background flex h-dvh min-h-dvh min-w-0 flex-col overflow-hidden">
        <AppHeader />
        <div className="flex-1 overflow-y-auto pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
          <div className="mx-auto flex w-full max-w-screen-2xl items-start gap-6 p-4 sm:p-6">
            <main className="min-w-0 flex-1">{children}</main>
            {showRightRail && (
              <aside className="hidden w-80 shrink-0 self-start xl:sticky xl:top-6 xl:block">
                <AppRightRail />
              </aside>
            )}
          </div>
        </div>
        <MobileCreatePostFab />
        <AppBottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
