import type { Metadata } from "next";
import {
  ThemeTransitionProvider,
  ThemeTransitionScript,
} from "@/components/transitions/theme-transition";
import Provider from "@/components/provider";
import {
  fetchActiveClientWhiteLabel,
  isWhiteLabelEnabled,
  WhiteLabelProvider,
  WhiteLabelServerStyle,
} from "@/lib/white-label";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getMessages, setRequestLocale } from "next-intl/server";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const whiteLabel = await fetchActiveClientWhiteLabel();

  const defaultTitle = "Kosume - Creative Platform for Artists";
  const defaultDescription =
    "Creative Portfolio & Community for Digital Artists";

  if (!whiteLabel || !isWhiteLabelEnabled) {
    return {
      metadataBase: new URL(baseUrl),
      title: {
        default: defaultTitle,
        template: `%s | Kosume`,
      },
      description: defaultDescription,
      icons: {
        icon: [{ rel: "icon", url: "/favicon.png" }],
      },
      openGraph: {
        title: defaultTitle,
        description: defaultDescription,
        url: baseUrl,
        siteName: "Kosume",
        type: "website",
        images: [
          { url: "/og-image.png", width: 1200, height: 630, alt: defaultTitle },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: defaultTitle,
        description: defaultDescription,
        images: ["/og-image.png"],
      },
    };
  }

  const title =
    whiteLabel.metaTitle ||
    whiteLabel.siteTitle ||
    whiteLabel.brandName ||
    defaultTitle;
  const description = whiteLabel.metaDescription || defaultDescription;
  const iconUrl = whiteLabel.siteFavicon || "/favicon.png";
  const siteName = whiteLabel.brandName || "Kosume";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    description,
    icons: {
      icon: [{ rel: "icon", url: iconUrl }],
    },
    openGraph: {
      title,
      description,
      url: baseUrl,
      siteName,
      type: "website",
      images: whiteLabel.ogImage
        ? [{ url: whiteLabel.ogImage }]
        : [
            {
              url: "/og-image.png",
              width: 1200,
              height: 630,
              alt: title,
            },
          ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: whiteLabel.twitterImage
        ? [whiteLabel.twitterImage]
        : ["/og-image.png"],
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  modal,
  params,
}: {
  children: React.ReactNode;
  modal?: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  const messages = await getMessages();

  // Fetch active white label on server (SSR)
  const whiteLabel = await fetchActiveClientWhiteLabel();
  const themeStorageKey = `${process.env.APP_NAME}-theme`;

  return (
    <>
      <WhiteLabelServerStyle styles={whiteLabel?.styles} />
      <ThemeTransitionScript storageKey={themeStorageKey} />
      <NextIntlClientProvider messages={messages} locale={locale}>
        <ThemeTransitionProvider
          transition="gif-chika"
          storageKey={themeStorageKey}
        >
          <Provider>
            <WhiteLabelProvider initialData={whiteLabel}>
              {children}
              {modal}
            </WhiteLabelProvider>
          </Provider>
        </ThemeTransitionProvider>
      </NextIntlClientProvider>
      <GoogleAnalytics
        gtmId={process.env.NEXT_PUBLIC_GTM_ID}
        gaId={process.env.NEXT_PUBLIC_GA_ID}
      />
    </>
  );
}
