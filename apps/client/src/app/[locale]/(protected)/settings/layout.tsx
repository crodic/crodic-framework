import React from "react";
import Layout from "@/components/layouts/layout";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout showRightRail={false}>
      <div className="mx-auto w-full max-w-5xl space-y-6 py-2">{children}</div>
    </Layout>
  );
}
