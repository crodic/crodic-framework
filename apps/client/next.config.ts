import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  reactCompiler: true,
  experimental: {
    viewTransition: true,
  },
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.google.com",
      },
      {
        protocol: "https",
        hostname: "*.ggpht.com",
      },
      {
        protocol: "https",
        hostname: "cdn.crodic.click",
      },
      {
        protocol: "https",
        hostname: "*.crodic.click",
      },
      {
        protocol: "http",
        hostname: "*.localhost",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8001",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8001",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3000",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3001",
      },
      {
        protocol: "https",
        hostname: "api.crodic.click",
      },
    ],
  },
  async rewrites() {
    const rawApiUrl =
      process.env.SERVER_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8000";
    const apiBase = rawApiUrl.replace(/\/api(\/v\d+)?\/?$/, "");
    return [
      {
        source: "/storage/:path*",
        destination: `${apiBase}/storage/:path*`,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin({
  experimental: {
    createMessagesDeclaration: "./messages/en.json",
  },
});

export default withSentryConfig(withNextIntl(nextConfig), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "crodic",

  project: "visel",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
