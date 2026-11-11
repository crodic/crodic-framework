import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@/i18n'
import * as Sentry from '@sentry/react'
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import Providers from './components/providers'
import {
  trackingSentryMutation,
  trackingSentryQueries,
} from './config/tanstack-query'
import './instrument'
import AppRouter from './routes/router'
import './styles/index.css'

// Automatically reload the page when a chunk fails to load after a new deployment
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()
  const RELOAD_KEY = 'vite-preload-reload-timestamp'
  const MAX_RELOAD_INTERVAL = 10_000 // 10s guard to avoid reload loops
  try {
    const lastReloadTime = Number(sessionStorage.getItem(RELOAD_KEY) || 0)
    const now = Date.now()
    if (now - lastReloadTime < MAX_RELOAD_INTERVAL) {
      // eslint-disable-next-line no-console
      console.error('Preload error loop detected. Stopping automatic reload.')
      return
    }
    sessionStorage.setItem(RELOAD_KEY, String(now))
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to access sessionStorage for reload guard', e)
  }
  window.location.reload()
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // eslint-disable-next-line no-console
        if (import.meta.env.DEV) console.log({ failureCount, error })

        if (failureCount >= 0 && import.meta.env.DEV) return false
        if (failureCount > 3 && import.meta.env.PROD) return false

        return !(
          axios.isAxiosError(error) &&
          [401, 403].includes(error.response?.status ?? 0)
        )
      },
      refetchOnWindowFocus: import.meta.env.PROD,
      staleTime: 10 * 1000, // 10s
    },
    mutations: {
      onError: (error) => {
        handleServerError(error)

        if (axios.isAxiosError(error)) {
          if (error.response?.status === 304) {
            toast.error('Content not modified!')
          }
        }
      },
    },
  },
  queryCache: trackingSentryQueries(),
  mutationCache: trackingSentryMutation(),
})

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement, {
    // Callback called when an error is thrown and not caught by an ErrorBoundary.
    onUncaughtError: Sentry.reactErrorHandler((error, errorInfo) => {
      // eslint-disable-next-line no-console
      console.warn('Uncaught error', error, errorInfo.componentStack)
    }),
    // Callback called when React catches an error in an ErrorBoundary.
    onCaughtError: Sentry.reactErrorHandler(),
    // Callback called when React automatically recovers from errors.
    onRecoverableError: Sentry.reactErrorHandler(),
  })
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <Providers>
          <NuqsAdapter>
            <AppRouter />
          </NuqsAdapter>
        </Providers>
      </QueryClientProvider>
    </StrictMode>
  )
}
