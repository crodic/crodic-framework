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
}

export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      {/* Official shadcn Sidebar */}
      <AppSidebar />

      {/* Main Content Inset */}
      <SidebarInset className="bg-background flex h-dvh min-h-dvh flex-col overflow-hidden">
        <AppHeader />
        <div className="flex-1 overflow-y-auto pb-16 md:pb-6">
          <div className="mx-auto flex w-full max-w-[1440px] justify-center gap-6 p-4 sm:p-6 lg:gap-8">
            <main className="max-w-[720px] min-w-0 flex-1">{children}</main>
            <aside className="hidden w-[340px] shrink-0 space-y-5 self-start xl:sticky xl:top-4 xl:block">
              <AppRightRail />
            </aside>
          </div>
        </div>
        <MobileCreatePostFab />
        <AppBottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
