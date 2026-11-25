# syntax=docker/dockerfile:1.7

FROM node:26-alpine AS base
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
ENV HUSKY=0
ENV pnpm_config_store_dir="/pnpm/store"

RUN apk add --no-cache libc6-compat dumb-init \
  && npm install -g pnpm@11.25.0

FROM base AS deps
RUN apk add --no-cache python3 make g++

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
  pnpm install --filter api... --frozen-lockfile --network-concurrency=4 --fetch-timeout=120000

FROM deps AS development
ENV NODE_ENV=development

COPY packages ./packages
COPY apps/api ./apps/api

USER node

CMD ["pnpm", "--filter", "api", "start:dev"]

FROM deps AS builder
ENV NODE_ENV=production

COPY packages ./packages
COPY apps/api ./apps/api

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store,sharing=locked \
  pnpm --filter api build \
  && pnpm --filter api deploy --prod --legacy /prod/api \
  && mkdir -p /prod/api/public /prod/api/dist/database \
  && cp -r apps/api/dist /prod/api/dist \
  && cp -r apps/api/src/database/data /prod/api/dist/database/data

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
