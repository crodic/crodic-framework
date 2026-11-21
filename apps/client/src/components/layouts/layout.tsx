import React from "react";
import { cookies } from "next/headers";
import { AppShell } from "./app-shell";

export default async function Layout({
  children,
  showRightRail = true,
}: {
  children: React.ReactNode;
  showRightRail?: boolean;
}) {
  const cookieStore = await cookies();
  const sidebarCookie = cookieStore.get("sidebar_state")?.value;
  const defaultOpen =
    sidebarCookie !== undefined ? sidebarCookie === "true" : true;

  return (
    <AppShell defaultOpen={defaultOpen} showRightRail={showRightRail}>
      {children}
    </AppShell>
  );
}
