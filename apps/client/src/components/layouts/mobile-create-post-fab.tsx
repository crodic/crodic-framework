"use client";

import React from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/use-auth-store";

export function MobileCreatePostFab() {
  const pathname = usePathname();
  const t = useTranslations("Navigation");
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Do not show FAB if unauthenticated or already on the upload page
  if (!isAuthenticated || pathname.startsWith("/upload")) {
    return null;
  }

  return (
    <Link
      href="/upload"
      className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-40 flex size-13 items-center justify-center rounded-full shadow-md transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95 md:hidden"
      aria-label={t("postAlbum")}
      title={t("postAlbum")}
    >
      <Plus className="size-6 stroke-[2.5]" />
    </Link>
  );
}
