# syntax=docker/dockerfile:1.7

FROM node:26-alpine AS base
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
ENV HUSKY=0

RUN apk add --no-cache libc6-compat dumb-init \
  && npm install -g pnpm@11.25.0

# ------------------------------------------------------------------------------
# Stage 1: Prune monorepo for API
# ------------------------------------------------------------------------------
FROM base AS pruner
RUN apk add --no-cache libc6-compat \
  && npm install -g turbo@2.11.7

COPY . .
RUN turbo prune api --docker

# ------------------------------------------------------------------------------
# Stage 2: Install dependencies
# ------------------------------------------------------------------------------
FROM base AS deps
RUN apk add --no-cache python3 make g++

# Copy pruned lockfile and isolated package.jsons
COPY --from=pruner /app/out/json/ .

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm install --frozen-lockfile

# ------------------------------------------------------------------------------
# Stage 3: Development
# ------------------------------------------------------------------------------
FROM deps AS development
ENV NODE_ENV=development

COPY --from=pruner /app/out/full/ .

USER node

CMD ["pnpm", "--filter", "api", "start:dev"]

# ------------------------------------------------------------------------------
# Stage 4: Builder
# ------------------------------------------------------------------------------
FROM deps AS builder
ENV NODE_ENV=production

COPY --from=pruner /app/out/full/ .

RUN pnpm --filter api build \
  && pnpm --filter api deploy --prod --legacy /prod/api \
  && mkdir -p /prod/api/public /prod/api/dist/database \
  && cp -r apps/api/dist /prod/api/dist \
  && cp -r apps/api/src/database/data /prod/api/dist/database/data

# ------------------------------------------------------------------------------
# Stage 5: Production
# ------------------------------------------------------------------------------
FROM base AS production
ENV NODE_ENV=production
ENV CI=true

RUN mkdir -p \
  /app/storage/public \
  /app/storage/private \
  /app/storage/avatars \
  && chown -R node:node /app

COPY --chown=node:node --from=builder /prod/api/package.json ./package.json
COPY --chown=node:node --from=builder /prod/api/node_modules ./node_modules
COPY --chown=node:node --from=builder /prod/api/dist ./dist
COPY --chown=node:node --from=builder /prod/api/public ./public

USER node

EXPOSE 8000

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/main.js"]
