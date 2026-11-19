"use client";

import React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import { AppBottomNav } from "./app-bottom-nav";
import { MobileCreatePostFab } from "./mobile-create-post-fab";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      {/* Official shadcn Sidebar (Smooth, no jank, handles desktop & mobile natively) */}
      <AppSidebar />

      {/* Main Content Inset */}
      <SidebarInset className="bg-background flex h-dvh min-h-dvh flex-col overflow-hidden">
        <AppHeader />
        <div className="flex-1 overflow-y-auto pb-16 md:pb-6">{children}</div>
        <MobileCreatePostFab />
        <AppBottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
