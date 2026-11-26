"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FOOTER_LINKS_COL_1, FOOTER_DEFAULT_CMS_LINKS } from "@/config/landing";
import { WhiteLabelLogo, useWhiteLabel } from "@/lib/white-label";
import { fetchPublishedCmsPagesClient } from "@/services/cms-pages-client";
import type { CmsPageApiResponse } from "@/services/cms-pages";

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
          className="text-muted-foreground hover:text-foreground text-sm leading-relaxed underline-offset-4 transition-colors hover:underline"
        >
          {linkText}
        </a>
      );
    }

    return (
      <Link
        href={item.href}
        className="text-muted-foreground hover:text-foreground text-sm leading-relaxed underline-offset-4 transition-colors hover:underline"
      >
        {linkText}
      </Link>
    );
  };

  return (
    <footer className="border-border border-t py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 pb-8 lg:grid-cols-[2fr_1fr_1fr] lg:gap-10">
          {/* Brand Col */}
          <div className="col-span-2 flex flex-col gap-3 lg:col-span-1">
            <Link
              href="/"
              className="focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-md focus-visible:ring-2 focus-visible:outline-none"
            >
              <WhiteLabelLogo
                width={160}
                height={40}
                className="h-9 w-auto object-contain"
                textClassName="text-xl"
              />
            </Link>

            <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
              {t("description")}
            </p>
          </div>

          {/* Links Column 1: Explore / Platform Features */}
          <div>
            <h2 className="text-foreground mb-3 text-sm font-semibold">
              {t("exploreTitle")}
            </h2>
            <ul className="space-y-3">
              {FOOTER_LINKS_COL_1.map((item) => (
                <li key={item.key}>{renderNavColLink(item)}</li>
              ))}
            </ul>
          </div>

          {/* Links Column 2: Dynamic CMS Pages & Policies */}
          <div>
            <h2 className="text-foreground mb-3 text-sm font-semibold">
              {t("companyTitle")}
            </h2>
            <ul className="space-y-3">
              {cmsLinks.length > 0
                ? cmsLinks.map((item) => (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-foreground text-sm leading-relaxed underline-offset-4 transition-colors hover:underline"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))
                : FOOTER_DEFAULT_CMS_LINKS.map((item) => (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-foreground text-sm leading-relaxed underline-offset-4 transition-colors hover:underline"
                      >
                        {getLinkLabel(item.key)}
                      </Link>
                    </li>
                  ))}
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-border border-t pt-6">
          <p className="text-muted-foreground text-xs">
            {t("copyright", {
              year: String(new Date().getFullYear()),
              brand: brandName,
            })}
          </p>
        </div>
      </div>
    </footer>
  );
}
