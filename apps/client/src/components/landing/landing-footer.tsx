"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FOOTER_LINKS_COL_1, FOOTER_DEFAULT_CMS_LINKS } from "@/config/landing";
import { WhiteLabelLogo, useWhiteLabel } from "@/lib/white-label";
import { fetchPublishedCmsPagesClient } from "@/services/cms-pages-client";
import type { CmsPageApiResponse } from "@/services/cms-pages";
import { Mail, MessageCircle, Heart } from "lucide-react";

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
    <footer className="border-border border-t py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 pb-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.5fr]">
          {/* Brand Col */}
          <div className="flex flex-col gap-3.5 sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-md focus-visible:ring-2 focus-visible:outline-none"
            >
              <WhiteLabelLogo
                width={160}
                height={40}
                className="h-9 w-auto object-contain"
                textClassName="text-xl font-bold"
              />
            </Link>

            <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
              {t("description")}
            </p>

            <div className="text-muted-foreground mt-2 flex items-center gap-1.5 text-xs">
              <span>{t("foundedBy")}</span>
              <span className="text-foreground font-semibold">Crodic</span>
            </div>
          </div>

          {/* Links Column 1: Explore / Platform Features */}
          <div>
            <h2 className="text-foreground mb-3 text-sm font-semibold">
              {t("exploreTitle")}
            </h2>
            <ul className="space-y-2.5">
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
            <ul className="space-y-2.5">
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

          {/* Column 3: Contact & Community (Fix Trust & Identity) */}
          <div className="flex flex-col gap-3.5">
            <h2 className="text-foreground text-sm font-semibold">
              {t("contactTitle")}
            </h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {t("contactSubtitle")}
            </p>

            {/* Email Contact */}
            <a
              href="mailto:alice01422@gmail.com"
              className="border-border/80 bg-muted/40 text-foreground hover:bg-muted inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors"
            >
              <Mail className="text-primary size-3.5 shrink-0" />
              <span className="truncate">alice01422@gmail.com</span>
            </a>

            {/* Social Icons */}
            <div className="mt-1 flex items-center gap-2">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/share/1FyiNu3VMJ/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Kosume on Facebook"
                className="border-border/80 bg-card text-muted-foreground hover:bg-primary/10 hover:text-primary flex size-8 items-center justify-center rounded-lg border transition-colors"
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* X / Twitter */}
              <a
                href="https://x.com/alice01422"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Kosume on X"
                className="border-border/80 bg-card text-muted-foreground hover:bg-primary/10 hover:text-primary flex size-8 items-center justify-center rounded-lg border transition-colors"
              >
                <svg
                  className="size-3.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* Discord Placeholder */}
              <a
                href="https://discord.gg/kosume"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Kosume Discord Community"
                className="border-border/80 bg-card text-muted-foreground hover:bg-primary/10 hover:text-primary flex size-8 items-center justify-center rounded-lg border transition-colors"
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-border flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row">
          <p className="text-muted-foreground text-xs">
            {t("copyright", {
              year: String(new Date().getFullYear()),
              brand: brandName,
            })}
          </p>

          <p className="text-muted-foreground flex items-center gap-1 text-xs">
            <span>Crafted with</span>
            <Heart className="size-3 fill-rose-500 text-rose-500" />
            <span>for Cosplay Enthusiasts</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
