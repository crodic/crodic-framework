# Production Deployment Guide with Docker Compose (VPS)

> **English** | [Tiếng Việt](../vi/DEPLOYMENT.md)

This guide provides a step-by-step production deployment procedure for the entire monorepo on an Ubuntu VPS using **Docker Compose** ([`docker-compose.prod.yml`](../../docker-compose.prod.yml)) and **Nginx Reverse Proxy**, including:

- **NestJS 11 API** (`apps/api`) running on port `8000` with a persistent volume mount at `/app/storage`.
- **Next.js 16 Client Website** (`apps/client`) running Server-Side Rendering (SSR) in `standalone` mode on port `3000`.
- **Vite 6 + React 19 Admin Portal** (`apps/web`) serving a Single-Page Application (SPA) through Nginx (with Gzip & Immutable Cache headers) on port `8080` (container port `80`).
- **PostgreSQL 16**, **Redis 7**, and **MinIO (S3 Storage)** isolated inside the internal Docker network (`app-network`) and bound exclusively to `127.0.0.1` on the host machine.
- **Nginx Reverse Proxy + Certbot (Let's Encrypt)** on the host machine handling SSL/TLS (HTTPS) termination across all domains.

---

## Table of Contents

1. [Deployment Architecture & CI/CD Flow](#1-deployment-architecture--cicd-flow)
2. [Step 1: VPS Preparation, Swap & Docker Installation](#step-1-vps-preparation-swap--docker-installation)
3. [Step 2: Domain DNS Configuration](#step-2-domain-dns-configuration)
4. [Step 3: Clone Repository & Configure `.env` Files](#step-3-clone-repository--configure-env-files)
5. [Step 4: Build & Start Services with Docker Compose](#step-4-build--start-services-with-docker-compose)
6. [Step 5: Run Migrations, Sync Permissions & Seed Database](#step-5-run-migrations-sync-permissions--seed-database)
7. [Step 6: Configure Nginx Reverse Proxy & SSL (HTTPS)](#step-6-configure-nginx-reverse-proxy--ssl-https)
8. [Step 7: Release & Redeployment Workflow](#step-7-release--redeployment-workflow)
9. [Step 8: Smoke Testing & Automated Database Backups](#step-8-smoke-testing--automated-database-backups)
10. [Troubleshooting](#troubleshooting)

---

## 1. Deployment Architecture & CI/CD Flow

### 1.1. Network & Routing Diagram

```
                         [ Internet: End Users ]
                                    │
                     ┌──────────────┴──────────────┐
                     │  Nginx Reverse Proxy (Host) │
                     │    Ports 80 / 443 (SSL)     │
                     └──────────────┬──────────────┘
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       │ api.yourdomain.com         │ yourdomain.com             │ admin.yourdomain.com
       ▼ (:8000)                    ▼ (:3000)                    ▼ (:8080 -> :80)
┌──────────────┐             ┌──────────────┐             ┌──────────────┐
│  crodic_api  │             │crodic_client │             │  crodic_web  │
│  NestJS 11   │             │  Next.js 16  │             │ Nginx + Vite │
└──────┬───┬───┘             └──────┬───────┘             └──────────────┘
       │   │                        │ (SSR internal fetch)
       │   └──────────────┬─────────┘
       ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  PostgreSQL  │   │    Redis     │   │    MinIO     │
│  :5432       │   │    :6379     │   │  :9000/:9001 │
└──────────────┘   └──────────────┘   └──────────────┘
     (Isolated inside internal Docker network app-network & 127.0.0.1)
```

### 1.2. Core CI/CD & Docker Build Principles

1. **GitHub Actions CI ([`.github/workflows/ci-cd.yml`](../../.github/workflows/ci-cd.yml)) as Quality Gate**:
   - Automatically runs Lint, Type-check, Unit Tests, E2E Tests, and compile verification (`pnpm build`) for `api`, `web`, `client`, and `@repo/query-builder` on every Pull Request and push to `main`.
2. **Native `.env` Configuration per Workspace on the Server**:
   - No intermediate `ARG`/`ENV` build-arg plumbing in Dockerfiles or Docker Compose.
   - The server maintains standard `.env` files in each workspace:
     - `.env` (at repository root): Configures host port mappings and infrastructure credentials (`postgres`, `redis`, `minio`).
     - `apps/api/.env`: Runtime environment variables for NestJS (injected at runtime via `env_file`).
     - `apps/web/.env`: Environment variables for Vite (natively read by Vite during `pnpm --filter web build`).
     - `apps/client/.env`: Environment variables for Next.js (natively read by Next.js during `pnpm --filter client build` and injected at runtime via `env_file` for SSR).
3. **Workspace-Scoped Docker Layer Caching**:
   - The `deps` stage copies only `package.json` manifests and `pnpm-lock.yaml`, ensuring `pnpm install --frozen-lockfile` stays 100% cached unless dependencies change.
   - Each Dockerfile's `builder` stage copies only `packages/` and its own workspace directory (`apps/api`, `apps/web`, or `apps/client`).
   - [`.dockerignore`](../../.dockerignore) excludes `apps/api/.env*`, `docs/`, and `.github/` from the build context:
     - Updating `apps/api/.env` never triggers an API image rebuild; Docker Compose simply restarts the container with the updated `env_file` in 1 second.
     - Updating code in `apps/web` only rebuilds the `web` image while leaving `api` and `client` cached and untouched.

### 1.3. Recommended VPS Specifications

| Specification          | Minimum Required             | Recommended (Production) |
| :--------------------- | :--------------------------- | :----------------------- |
| **Operating System**   | Ubuntu 22.04 LTS / 24.04 LTS | Ubuntu 24.04 LTS x86_64  |
| **CPU**                | 2 vCPUs                      | 4 vCPUs                  |
| **RAM**                | 4 GB (+ 4GB Swap)            | 8 GB (+ 4GB Swap)        |
| **Storage (SSD/NVMe)** | 40 GB SSD                    | 80+ GB NVMe SSD          |

---

## Step 1: VPS Preparation, Swap & Docker Installation

SSH into your VPS:

```bash
ssh root@<YOUR_VPS_IP>
```

### 1.1. Update system packages & install essentials

```bash
apt update && apt upgrade -y
apt install -y curl wget git ufw htop ca-certificates gnupg nginx certbot python3-certbot-nginx
```

### 1.2. Create a 4GB Swapfile (OOM protection during Next.js & Vite builds)

```bash
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
sysctl vm.swappiness=10
echo 'vm.swappiness=10' | tee -a /etc/sysctl.conf
```

### 1.3. Install official Docker Engine & Docker Compose Plugin

```bash
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker
docker --version
docker compose version
```

### 1.4. Configure UFW Firewall

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status
```

---

## Step 2: Domain DNS Configuration

Configure **A Records** with your DNS provider pointing to your VPS IP address:

| Type  | Host                 | Value (Target)  | Target Service                       |
| :---- | :------------------- | :-------------- | :----------------------------------- |
| **A** | `@` (yourdomain.com) | `<YOUR_VPS_IP>` | Client Website (`apps/client` :3000) |
| **A** | `www`                | `<YOUR_VPS_IP>` | Client Website (`apps/client` :3000) |
| **A** | `api`                | `<YOUR_VPS_IP>` | REST API Backend (`apps/api` :8000)  |
| **A** | `admin`              | `<YOUR_VPS_IP>` | Admin Portal (`apps/web` :8080)      |

---

## Step 3: Clone Repository & Configure `.env` Files

### 3.1. Clone repository on the server

```bash
mkdir -p /opt/crodic
cd /opt/crodic
git clone git@github.com:<ORG>/<REPO>.git .
```

### 3.2. Initialize the 4 `.env` files from templates

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/client/.env.example apps/client/.env
```

### 3.3. Configure each `.env` file

#### 1. Root `.env` (Infrastructure & Port Mappings)

```env
API_PORT=8000
WEB_PORT=8080
CLIENT_PORT=3000

POSTGRES_HOST=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=StrongDatabasePassword123!
POSTGRES_DB=monorepo
POSTGRES_PORT=5432

REDIS_HOST=redis
REDIS_PASSWORD=StrongRedisPassword123!
REDIS_PORT=6379

MINIO_HOST=minio
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=StrongMinioPassword123!
AWS_DEFAULT_S3_BUCKET=nest-uploads
AWS_PRIVATE_BUCKET=nest-uploads-private
```

#### 2. `apps/api/.env` (NestJS Backend)

Update the key production settings in `apps/api/.env`:

```env
NODE_ENV=production
APP_PORT=8000
APP_URL=https://api.yourdomain.com
APP_DEBUG=false
APP_CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com,https://admin.yourdomain.com

# Internal Docker network service hostnames
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=StrongDatabasePassword123!
DATABASE_NAME=monorepo
DATABASE_SYNCHRONIZE=false

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=StrongRedisPassword123!

# Authentication Redirect URLs
AUTH_PORTAL_URL=https://admin.yourdomain.com
AUTH_PORTAL_RESET_PASSWORD_URL=https://admin.yourdomain.com/reset-password
USER_AUTH_CLIENT_URL=https://yourdomain.com
USER_AUTH_CLIENT_RESET_PASSWORD_URL=https://yourdomain.com/auth/reset-password
```

_(Ensure all `AUTH_JWT_SECRET`, `USER_AUTH_JWT_SECRET`, etc. are replaced with cryptographically random strings at least 32 characters long)._

#### 3. `apps/web/.env` (Vite Admin Portal)

```env
PORT=5173
VITE_API_URL=https://api.yourdomain.com/api/v1
VITE_APP_NAME=Animazing
VITE_SOCKET_URL=https://api.yourdomain.com
VITE_AUTH_KEY="${VITE_APP_NAME}_AUTH_KEY"
VITE_CLIENT_URL=https://yourdomain.com
VITE_SENTRY_ENVIRONMENT=production
```

#### 4. `apps/client/.env` (Next.js Client Website)

```env
PORT=3000
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com
NEXT_PUBLIC_ADMIN_PORTAL_URL=https://admin.yourdomain.com
# Internal Docker network URL for Server-Side Rendering (SSR) fetches
SERVER_API_URL=http://api:8000
TOKEN_EXPIRY_MINUTES_REMAINING=1m
APP_NAME=Visel
NEXT_PUBLIC_ENABLE_WHITE_LABEL=true
NEXT_PUBLIC_USE_CASE=as-needed
NEXT_PUBLIC_APP_LOCALE=en
NEXT_PUBLIC_FALLBACK_LOCALE=en
NEXT_PUBLIC_ALLOWED_LOCALE=en,vi
SENTRY_ENVIROMENT=production
```

---

## Step 4: Build & Start Services with Docker Compose

From `/opt/crodic`, build and start all production containers:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Check running container statuses:

```bash
docker compose -f docker-compose.prod.yml ps
```

Inspect real-time application logs:

```bash
docker compose -f docker-compose.prod.yml logs -f api client web
```

---

## Step 5: Run Migrations, Sync Permissions & Seed Database

On the initial deployment, initialize the database schema, RBAC permissions, and default admin user inside `crodic_api`:

```bash
# 1. Run TypeORM database migrations
docker exec -it crodic_api npm run migration:run:prod

# 2. Synchronize RBAC permission catalog
docker exec -it crodic_api npm run permissions:sync:prod

# 3. Seed initial Super Admin account and baseline data
docker exec -it crodic_api npm run seed:run:prod
```

---

## Step 6: Configure Nginx Reverse Proxy & SSL (HTTPS)

A production-ready Nginx configuration template is provided at [`deploy/nginx/vps-reverse-proxy.conf`](../../deploy/nginx/vps-reverse-proxy.conf). Copy it directly to your VPS:

```bash
sudo cp deploy/nginx/vps-reverse-proxy.conf /etc/nginx/sites-available/crodic.conf
```

Then edit `/etc/nginx/sites-available/crodic.conf` and replace `yourdomain.com`, `api.yourdomain.com`, `admin.yourdomain.com` with your actual domains:

```nginx
# 1. Backend API (api.yourdomain.com -> 127.0.0.1:8000)
server {
    listen 80;
    server_name api.yourdomain.com;
    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 2. Admin Portal (admin.yourdomain.com -> 127.0.0.1:8080)
server {
    listen 80;
    server_name admin.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 3. Client Website (yourdomain.com -> 127.0.0.1:3000)
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site configuration and issue Let's Encrypt SSL certificates via Certbot:

```bash
ln -s /etc/nginx/sites-available/crodic.conf /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Provision HTTPS certificates for all domains
certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com -d admin.yourdomain.com
```

---

## Step 7: Release & Redeployment Workflow

### Option 1: Automated CD via GitHub Actions (Recommended)

An automated Continuous Deployment workflow is pre-configured at [`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml). Whenever changes are merged into `main` and all CI tests pass, it automatically SSHs into your VPS and runs the deployment.

Configure the following GitHub Repository Secrets under **Settings > Secrets and variables > Actions**:

- `VPS_HOST`: VPS IP address or hostname.
- `VPS_USERNAME`: SSH username (e.g., `root` or deploy user).
- `VPS_SSH_KEY`: SSH private key for authentication.
- `VPS_PORT`: SSH port (default: `22`).
- `DEPLOY_PATH`: Target directory path on your VPS (e.g., `/opt/crodic` or `/var/www/crodic-framework`).

### Option 2: Manual Deployment via Deploy Script

On your VPS, run the self-contained deployment script [`scripts/deploy.sh`](../../scripts/deploy.sh):

```bash
cd /opt/crodic
./scripts/deploy.sh
```

This script automatically:

1. Pulls the latest commits (`git pull`).
2. Builds changed Docker images.
3. Restarts containers with Docker Compose (`docker compose up -d`).
4. Runs database migrations (`migration:run:prod`) and syncs RBAC permissions (`permissions:sync:prod`).
5. Performs an automated health check and cleans up dangling Docker images.

> [!TIP]
> Thanks to workspace-scoped layer caching in the Dockerfiles:
>
> - If a commit only modifies `apps/web`, only `crodic_web` is rebuilt and restarted; `crodic_api` and `crodic_client` remain 100% cached.
> - If you only change runtime variables in `apps/api/.env`, running `docker compose -f docker-compose.prod.yml up -d` restarts `crodic_api` with the new environment in 1 second without rebuilding the image.

---

## Step 8: Smoke Testing & Automated Database Backups

### 8.1. Smoke Tests

```bash
curl -f -I https://api.yourdomain.com/api/v1/health
curl -f -I https://yourdomain.com
curl -f -I https://admin.yourdomain.com
```

### 8.2. Automated PostgreSQL Daily Backups (Cronjob)

Set up a daily cronjob at 02:00 AM server time:

```bash
mkdir -p /opt/backups/postgres

# Add to crontab (crontab -e):
0 2 * * * docker exec crodic_postgres pg_dump -U postgres monorepo | gzip > /opt/backups/postgres/db_$(date +\%F).sql.gz && find /opt/backups/postgres -type f -mtime +7 -delete
```

---

## Troubleshooting

### 1. Build terminates with `Exit code 137 (OOM Killed)`

- **Cause**: The Linux kernel terminated the build due to insufficient RAM.
- **Resolution**: Verify Swap is active via `free -h` ([Step 1.2](#12-create-a-4gb-swapfile-oom-protection-during-nextjs--vite-builds)). On lower-memory servers, build services sequentially:
  ```bash
  docker compose -f docker-compose.prod.yml build api
  docker compose -f docker-compose.prod.yml build web
  docker compose -f docker-compose.prod.yml build client
  docker compose -f docker-compose.prod.yml up -d
  ```

### 2. Browser CORS errors when calling API from Admin or Client

- **Resolution**: Ensure `APP_CORS_ORIGIN` in `apps/api/.env` includes all frontend origins with `https://` and no trailing slash, then restart the API container: `docker compose -f docker-compose.prod.yml up -d api`.

### 3. Updating variables in `apps/web/.env` or `apps/client/.env`

- **Note**: `VITE_*` and `NEXT_PUBLIC_*` variables are compiled into the static JS bundle during build. After modifying these files on the server, run `docker compose -f docker-compose.prod.yml up -d --build web client` to rebuild the frontend bundles.
