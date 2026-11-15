import React from "react";
import { setRequestLocale } from "next-intl/server";

interface ProtectedLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function ProtectedLayout({
  children,
  params,
}: ProtectedLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <>{children}</>;
}
