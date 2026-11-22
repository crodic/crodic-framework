# syntax=docker/dockerfile:1.7

FROM node:26-alpine AS base
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
ENV HUSKY=0
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat dumb-init \
  && npm install -g pnpm@11.25.0

# ------------------------------------------------------------------------------
# Stage 1: Prune monorepo for Client (Next.js)
# ------------------------------------------------------------------------------
FROM base AS pruner
RUN apk add --no-cache libc6-compat \
  && npm install -g turbo@2.11.7

COPY . .
RUN turbo prune client --docker

# ------------------------------------------------------------------------------
# Stage 2: Install dependencies
# ------------------------------------------------------------------------------
FROM base AS deps

# Copy pruned lockfile and isolated package.jsons
COPY --from=pruner /app/out/json/ .

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm install --frozen-lockfile

# ------------------------------------------------------------------------------
# Stage 3: Builder
# ------------------------------------------------------------------------------
FROM deps AS builder
ENV NODE_ENV=production

COPY --from=pruner /app/out/full/ .

RUN pnpm --filter client build

# ------------------------------------------------------------------------------
# Stage 4: Production (Standalone runner)
# ------------------------------------------------------------------------------
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
