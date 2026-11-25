# syntax=docker/dockerfile:1.7

FROM node:26-alpine AS base
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
ENV HUSKY=0
ENV pnpm_config_store_dir="/pnpm/store"

RUN npm install -g pnpm@11.25.0

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
  pnpm install --frozen-lockfile --network-concurrency=4 --fetch-timeout=120000

FROM deps AS builder
ENV NODE_ENV=production

COPY packages ./packages
COPY apps/web ./apps/web

RUN pnpm --filter web exec vite build

FROM nginx:1.27-alpine AS production

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

RUN apk add --no-cache libcap && \
  setcap 'cap_net_bind_service=+ep' /usr/sbin/nginx && \
  touch /var/run/nginx.pid && \
  chown -R nginx:nginx /var/run/nginx.pid /usr/share/nginx/html /var/cache/nginx /etc/nginx /var/log/nginx

USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
