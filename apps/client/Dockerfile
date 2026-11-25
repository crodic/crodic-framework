# syntax=docker/dockerfile:1.7

FROM node:26-alpine AS base
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
ENV HUSKY=0
ENV NEXT_TELEMETRY_DISABLED=1
ENV pnpm_config_store_dir="/pnpm/store"

RUN apk add --no-cache libc6-compat dumb-init \
  && npm install -g pnpm@11.25.0

FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY packages/commitlint-config/package.json ./packages/commitlint-config/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/prettier-config/package.json ./packages/prettier-config/package.json
COPY packages/query-builder/package.json ./packages/query-builder/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY apps/api/package.json ./apps/api/package.json
COPY apps/client/package.json ./apps/client/package.json
COPY apps/web/package.json ./apps/web/package.json

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store,sharing=locked \
  pnpm install --filter client... --frozen-lockfile --network-concurrency=4 --fetch-timeout=120000

FROM deps AS builder
ENV NODE_ENV=production

COPY packages ./packages
COPY apps/client ./apps/client

RUN --mount=type=cache,id=nextjs-cache,target=/app/apps/client/.next/cache \
  pnpm --filter client build

FROM node:26-alpine AS production
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN apk add --no-cache libc6-compat dumb-init \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/client/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/client/.next/static ./apps/client/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/client/public ./apps/client/public

USER nextjs

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "apps/client/server.js"]
