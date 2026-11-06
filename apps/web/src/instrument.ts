import React from 'react'
import * as Sentry from '@sentry/react'
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router'

const sentryDsn = import.meta.env.VITE_SENTRY_DNS
const isProd = import.meta.env.PROD

Sentry.init({
  dsn: sentryDsn,
  enabled: Boolean(sentryDsn) && isProd,
  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/react/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
  integrations: [
    // Sentry.feedbackIntegration({
    //   // Additional SDK configuration goes in here, for example:
    //   colorScheme: 'system',
    // }),
    Sentry.reactRouterV7BrowserTracingIntegration({
      useEffect: React.useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
    Sentry.zodErrorsIntegration(),
  ],
  // Enable logs to be sent to Sentry
  enableLogs: isProd,

  tracesSampleRate: isProd ? 0.2 : 0,
  // Set `tracePropagationTargets` to control for which URLs trace propagation should be enabled
  tracePropagationTargets: [/^\//],
  environment:
    import.meta.env.VITE_SENTRY_ENVIRONMENT ||
    (isProd ? 'production' : 'development'),
})
