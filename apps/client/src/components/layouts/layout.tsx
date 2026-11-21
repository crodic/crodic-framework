import React from "react";
import { AppShell } from "./app-shell";

export default function Layout({
  children,
  showRightRail = true,
}: {
  children: React.ReactNode;
  showRightRail?: boolean;
}) {
  return <AppShell showRightRail={showRightRail}>{children}</AppShell>;
}
