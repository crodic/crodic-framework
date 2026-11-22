# syntax=docker/dockerfile:1.7

FROM node:26-alpine AS base
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
ENV HUSKY=0

RUN npm install -g pnpm@11.25.0

# ------------------------------------------------------------------------------
# Stage 1: Prune monorepo for Web (Vite SPA)
# ------------------------------------------------------------------------------
FROM base AS pruner
RUN apk add --no-cache libc6-compat \
  && npm install -g turbo@2.11.7

COPY . .
RUN turbo prune web --docker

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

RUN pnpm --filter web build

# ------------------------------------------------------------------------------
# Stage 4: Production (Nginx)
# ------------------------------------------------------------------------------
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
