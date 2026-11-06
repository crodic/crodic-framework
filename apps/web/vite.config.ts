import path from 'path'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { existsSync, readFileSync } from 'fs'
import { defineConfig } from 'vitest/config'

function resolveAppVersion(): string {
  const rootPkgUrl = new URL('../../package.json', import.meta.url)
  const localPkgUrl = new URL('./package.json', import.meta.url)
  const targetUrl = existsSync(rootPkgUrl) ? rootPkgUrl : localPkgUrl
  try {
    const pkg = JSON.parse(readFileSync(targetUrl, 'utf8')) as {
      version?: string
    }
    return pkg.version ?? '1.0.0'
  } catch {
    return '1.0.0'
  }
}

const appVersion = resolveAppVersion()

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = Number(env.PORT || env.VITE_PORT || 5173)

  return {
    server: {
      host: '0.0.0.0',
      port,
    },
    preview: {
      port,
    },
    plugins: [react(), tailwindcss()],
    define: {
      __APP_VERSION__: JSON.stringify(appVersion),
    },
    build: {
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (!id.includes('node_modules')) return

            // Core React runtime first
            if (
              /\/node_modules\/(react|react-dom|react-router|scheduler|use-sync-external-store)\//.test(
                id
              )
            ) {
              return 'vendor-react'
            }

            // Editor dependencies
            if (
              /\/node_modules\/(@tiptap|prosemirror|reactjs-tiptap-editor)/.test(
                id
              )
            ) {
              return 'vendor-editor'
            }

            // TanStack libraries
            if (/\/node_modules\/@tanstack\//.test(id)) {
              return 'vendor-tanstack'
            }

            // Radix UI primitives
            if (/\/node_modules\/(@radix-ui|radix-ui)\//.test(id)) {
              return 'vendor-radix'
            }

            // Icons
            if (/\/node_modules\/lucide-react\//.test(id)) {
              return 'vendor-icons'
            }

            // Sentry error monitoring
            if (/\/node_modules\/@sentry\//.test(id)) {
              return 'vendor-sentry'
            }

            // Media players
            if (/\/node_modules\/media-chrome\//.test(id)) {
              return 'vendor-media'
            }
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      dedupe: ['react', 'react-dom'],
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        reportsDirectory: './coverage',
        exclude: [
          'dist/**',
          'coverage/**',
          'node_modules/**',
          'src/main.tsx',
          'src/routes/**',
          'src/**/*.d.ts',
          'src/**/*.config.*',
          'src/**/data/**',
          'src/assets/**',
          'src/i18n/**',
          'src/test/**',
        ],
      },
    },
  }
})
