import Script from "next/script";

interface GoogleAnalyticsProps {
  gtmId?: string;
  gaId?: string;
}

export function GoogleAnalytics({ gtmId, gaId }: GoogleAnalyticsProps) {
  const targetId = gtmId || gaId;
  if (!targetId) return null;

  const isGtm = targetId.startsWith("GTM-");

  if (isGtm) {
    return (
      <>
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtm.js?id=${targetId}`}
        />
        <Script
          id="gtm-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
            `,
          }}
        />
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${targetId}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
      </>
    );
  }

  // Google Analytics 4 (G-XXXXXXX)
  return (
    <>
      <Script
        id="ga-script"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${targetId}`}
      />
      <Script
        id="ga-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${targetId}');
          `,
        }}
      />
    </>
  );
}
