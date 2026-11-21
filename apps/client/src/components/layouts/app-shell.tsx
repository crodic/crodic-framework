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
}

export function AppShell({ children, showRightRail = true }: AppShellProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      {/* Official shadcn Sidebar */}
      <AppSidebar />

      {/* Main Content Inset */}
      <SidebarInset className="bg-background flex h-dvh min-h-dvh flex-col overflow-hidden">
        <AppHeader />
        <div className="flex-1 overflow-y-auto pb-16 md:pb-6">
          <div className="flex w-full items-start gap-4 px-3 py-4 sm:px-5 sm:py-5 lg:gap-6 lg:px-6">
            <main className="min-w-0 flex-1">{children}</main>
            {showRightRail && (
              <aside className="hidden w-[340px] shrink-0 space-y-5 self-start xl:sticky xl:top-4 xl:block">
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
