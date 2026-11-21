import React from "react";
import Layout from "@/components/layouts/layout";

export default function ProfileRouteGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout showRightRail={false}>{children}</Layout>;
}
