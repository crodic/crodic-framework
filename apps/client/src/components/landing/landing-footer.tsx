"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FOOTER_LINKS_COL_1, FOOTER_DEFAULT_CMS_LINKS } from "@/config/landing";
import { WhiteLabelLogo, useWhiteLabel } from "@/lib/white-label";
import { fetchPublishedCmsPagesClient } from "@/services/cms-pages-client";
import type { CmsPageApiResponse } from "@/services/cms-pages";
import { ScrollReveal } from "./scroll-reveal";

interface LandingFooterProps {
  initialCmsPages?: CmsPageApiResponse[];
}

export function LandingFooter({ initialCmsPages }: LandingFooterProps) {
  const t = useTranslations("Landing.footer") as any;
  const locale = useLocale();
  const { whiteLabel, isEnabled } = useWhiteLabel();

  const brandName =
    isEnabled && whiteLabel?.brandName ? whiteLabel.brandName : "Kosume";

  // Fetch or revalidate published CMS pages dynamically
  const { data: dynamicPages } = useQuery({
    queryKey: ["published-cms-pages"],
    queryFn: fetchPublishedCmsPagesClient,
    initialData: initialCmsPages,
    staleTime: 5 * 60 * 1000,
  });

  const getLinkLabel = (key: string): string => {
    switch (key) {
      case "about":
        return t("links.about");
      case "features":
        return t("links.features");
      case "tags":
        return t("links.tags");
      case "events":
        return t("links.events");
      case "ranking":
        return t("links.ranking");
      case "explore":
        return t("links.explore");
      case "terms":
        return t("links.terms");
      case "privacy":
        return t("links.privacy");
      case "contact":
        return t("links.contact");
      default:
        return t("links.about");
    }
  };

  // Extract dynamic CMS page links localized for the active locale
  const cmsLinks = (dynamicPages || [])
    .map((page) => {
      const translation =
        page.translations?.find((tr) => tr.locale === locale) ||
        page.translations?.[0];
      if (!translation || !translation.slug) return null;
      return {
        key: `cms-${page.id}`,
        label: translation.title,
        href: `/pages/${translation.slug}`,
      };
    })
    .filter(
      (item): item is { key: string; label: string; href: string } =>
        item !== null
    );

  const renderNavColLink = (item: { key: string; href: string }) => {
    const isAnchor = item.href.startsWith("#");
    const linkText = getLinkLabel(item.key);

    if (isAnchor) {
      return (
        <a
          href={item.href}
          className="text-muted-foreground hover:text-foreground text-xs transition-colors sm:text-sm"
        >
          {linkText}
        </a>
      );
    }

    return (
      <Link
        href={item.href}
        className="text-muted-foreground hover:text-foreground text-xs transition-colors sm:text-sm"
      >
        {linkText}
      </Link>
    );
  };

  return (
    <footer className="border-border/40 bg-card/30 border-t pt-16 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="grid grid-cols-1 gap-10 pb-12 md:grid-cols-12 lg:gap-12">
            {/* Brand Col */}
            <div className="flex flex-col gap-3.5 md:col-span-4">
              <Link
                href="/landing"
                className="focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-md focus-visible:ring-2 focus-visible:outline-none"
              >
                <WhiteLabelLogo
                  width={160}
                  height={40}
                  className="h-9 w-auto object-contain"
                  textClassName="text-xl"
                />
              </Link>

              <p className="text-muted-foreground max-w-sm text-xs leading-relaxed sm:text-sm">
                {t("description")}
              </p>

              <p className="text-muted-foreground/80 text-xs italic">
                {t("tagline")}
              </p>
            </div>

            {/* Links Column 1: Explore / Platform Features */}
            <div className="md:col-span-3">
              <h4 className="text-foreground mb-4 text-xs font-semibold tracking-wider uppercase">
                {t("exploreTitle")}
              </h4>
              <ul className="space-y-3">
                {FOOTER_LINKS_COL_1.map((item) => (
                  <li key={item.key}>{renderNavColLink(item)}</li>
                ))}
              </ul>
            </div>

            {/* Links Column 2: Dynamic CMS Pages & Policies */}
            <div className="md:col-span-3">
              <h4 className="text-foreground mb-4 text-xs font-semibold tracking-wider uppercase">
                {t("companyTitle")}
              </h4>
              <ul className="space-y-3">
                {cmsLinks.length > 0
                  ? cmsLinks.map((item) => (
                      <li key={item.key}>
                        <Link
                          href={item.href}
                          className="text-muted-foreground hover:text-foreground text-xs transition-colors sm:text-sm"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))
                  : FOOTER_DEFAULT_CMS_LINKS.map((item) => (
                      <li key={item.key}>
                        <Link
                          href={item.href}
                          className="text-muted-foreground hover:text-foreground text-xs transition-colors sm:text-sm"
                        >
                          {getLinkLabel(item.key)}
                        </Link>
                      </li>
                    ))}
              </ul>
            </div>

            {/* Social Icons Column */}
            <div className="flex flex-col items-start gap-4 md:col-span-2 md:items-end">
              <div className="flex items-center gap-3">
                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-border/70 bg-card/60 hover:bg-muted hover:border-primary/50 text-muted-foreground hover:text-primary flex size-9 cursor-pointer items-center justify-center rounded-full border transition-all"
                  aria-label="Facebook"
                >
                  <svg
                    className="size-4 fill-current"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* TikTok */}
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-border/70 bg-card/60 hover:bg-muted hover:border-primary/50 text-muted-foreground hover:text-primary flex size-9 cursor-pointer items-center justify-center rounded-full border transition-all"
                  aria-label="TikTok"
                >
                  <svg
                    className="size-4 fill-current"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-border/70 bg-card/60 hover:bg-muted hover:border-primary/50 text-muted-foreground hover:text-primary flex size-9 cursor-pointer items-center justify-center rounded-full border transition-all"
                  aria-label="Instagram"
                >
                  <svg
                    className="size-4 fill-current"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* X (formerly Twitter) */}
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-border/70 bg-card/60 hover:bg-muted hover:border-primary/50 text-muted-foreground hover:text-primary flex size-9 cursor-pointer items-center justify-center rounded-full border transition-all"
                  aria-label="X (Twitter)"
                >
                  <svg
                    className="size-3.5 fill-current"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="border-border/30 border-t pt-8 text-center">
            <p className="text-muted-foreground text-xs">
              {t("copyright", {
                year: String(new Date().getFullYear()),
                brand: brandName,
              })}
            </p>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
}
