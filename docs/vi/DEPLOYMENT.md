# Hướng Dẫn Triển Khai Production Với Docker Compose (VPS)

> [English](../en/DEPLOYMENT.md) | **Tiếng Việt**

Tài liệu này hướng dẫn chi tiết từng bước triển khai toàn bộ hệ thống Monorepo lên máy chủ VPS Ubuntu theo kiến trúc chuẩn bằng **Docker Compose** ([`docker-compose.prod.yml`](../../docker-compose.prod.yml)) và **Nginx Reverse Proxy**, bao gồm:

- **NestJS 11 API** (`apps/api`) chạy trên cổng `8000`, gắn volume lưu trữ bền vững `/app/storage`.
- **Next.js 16 Client Website** (`apps/client`) chạy Server-Side Rendering (SSR) chế độ `standalone` trên cổng `3000`.
- **Vite 6 + React 19 Admin Portal** (`apps/web`) phục vụ SPA qua Nginx (đã bật Gzip & Immutable Cache) trên cổng `8080` (container port `80`).
- **PostgreSQL 16**, **Redis 7** và **MinIO (S3 Storage)** chạy trong mạng nội bộ Docker (`app-network`) và chỉ bind vào `127.0.0.1` trên máy chủ host để bảo mật tối đa.
- **Nginx Reverse Proxy + Certbot (Let's Encrypt)** trên máy chủ VPS xử lý SSL/TLS (HTTPS) cho cả 3 domain.

---

## Mục Lục

1. [Kiến Trúc Triển Khai & Luồng CI/CD](#1-kiến-trúc-triển-khai--luồng-cicd)
2. [Bước 1: Chuẩn Bị VPS, Swap & Cài Đặt Docker](#bước-1-chuẩn-bị-vps-swap--cài-đặt-docker)
3. [Bước 2: Cấu Hình DNS Tên Miền](#bước-2-cấu-hình-dns-tên-miền)
4. [Bước 3: Clone Mã Nguồn & Cấu Hình Các File `.env`](#bước-3-clone-mã-nguồn--cấu-hình-các-file-env)
5. [Bước 4: Build & Khởi Chạy Hệ Thống Với Docker Compose](#bước-4-build--khởi-chạy-hệ-thống-với-docker-compose)
6. [Bước 5: Chạy Migration, Đồng Bộ Quyền & Seed Dữ Liệu](#bước-5-chạy-migration-đồng-bộ-quyền--seed-dữ-liệu)
7. [Bước 6: Cấu Hình Nginx Reverse Proxy & Chứng Chỉ SSL (HTTPS)](#bước-6-cấu-hình-nginx-reverse-proxy--chứng-chỉ-ssl-https)
8. [Bước 7: Quy Trình Cập Nhật Phiên Bản Mới (Redeploy)](#bước-7-quy-trình-cập-nhật-phiên-bản-mới-redeploy)
9. [Bước 8: Kiểm Tra Hoạt Động (Smoke Tests) & Sao Lưu](#bước-8-kiểm-tra-hoạt-động-smoke-tests--sao-lưu)
10. [Xử Lý Sự Cố Thường Gặp (Troubleshooting)](#xử-lý-sự-cố-thường-gặp-troubleshooting)

---

## 1. Kiến Trúc Triển Khai & Luồng CI/CD

### 1.1. Sơ Đồ Kiến Trúc Mạng

```
                         [ Internet: Người dùng truy cập ]
                                        │
                         ┌──────────────┴──────────────┐
                         │  Nginx Reverse Proxy (Host) │
                         │    Ports 80 / 443 (SSL)     │
                         └──────────────┬──────────────┘
                                        │
       ┌────────────────────────────────┼────────────────────────────────┐
       │ api.yourdomain.com             │ yourdomain.com                 │ admin.yourdomain.com
       ▼ (:8000)                        ▼ (:3000)                        ▼ (:8080 -> :80)
┌──────────────┐                 ┌──────────────┐                 ┌──────────────┐
│  crodic_api  │                 │crodic_client │                 │  crodic_web  │
│  NestJS 11   │                 │  Next.js 16  │                 │ Nginx + Vite │
└──────┬───┬───┘                 └──────┬───────┘                 └──────────────┘
       │   │                            │ (SSR internal fetch)
       │   └──────────────┬─────────────┘
       ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  PostgreSQL  │   │    Redis     │   │    MinIO     │
│  :5432       │   │    :6379     │   │  :9000/:9001 │
└──────────────┘   └──────────────┘   └──────────────┘
       (Cô lập trong mạng Docker nội bộ app-network & 127.0.0.1)
```

### 1.2. Nguyên Tắc Thiết Kế CI/CD & Docker Build Chuẩn

1. **GitHub Actions CI ([`.github/workflows/ci-cd.yml`](../../.github/workflows/ci-cd.yml)) đóng vai trò Quality Gate**:
   - Tự động kiểm tra Lint, Type-check, Unit Test, E2E Test và kiểm thử biên dịch (`pnpm build`) cho `api`, `web`, `client` và `@repo/query-builder` trên mọi Pull Request và mỗi khi push lên `main`.
2. **Mỗi ứng dụng tự quản lý file `.env` chuẩn của riêng mình trên Server**:
   - Không dùng các biến trung gian `ARG`/`ENV` phức tạp trong Dockerfile hay Docker Compose.
   - Trên máy chủ có 4 file `.env` rõ ràng:
     - `.env` (ở thư mục gốc): Cấu hình cổng và thông tin khởi tạo hạ tầng (`postgres`, `redis`, `minio`).
     - `apps/api/.env`: Biến môi trường Runtime của NestJS (nạp qua `env_file` khi chạy container).
     - `apps/web/.env`: Biến môi trường của Vite (được Vite tự động đọc trực tiếp khi chạy `pnpm --filter web build`).
     - `apps/client/.env`: Biến môi trường của Next.js (được Next.js tự động đọc trực tiếp khi chạy `pnpm --filter client build` và nạp qua `env_file` lúc chạy SSR).
3. **Tối ưu hóa Docker Layer Cache theo từng Workspace**:
   - Stage `deps` chỉ copy các file `package.json` và `pnpm-lock.yaml`, giúp bước `pnpm install --frozen-lockfile` luôn được cache 100% nếu không cài thêm thư viện mới.
   - Stage `builder` của từng Dockerfile chỉ copy thư mục `packages/` và thư mục của riêng ứng dụng đó (`apps/api`, `apps/web`, hoặc `apps/client`).
   - File [`.dockerignore`](../../.dockerignore) loại trừ `apps/api/.env*`, `docs/`, `.github/` khỏi build context:
     - Khi bạn chỉ sửa biến trong `apps/api/.env`, Docker **không cần build lại image API** mà chỉ khởi động lại container trong 1 giây.
     - Khi bạn sửa code của `apps/web`, Docker **chỉ build lại đúng image `web`**, giữ nguyên cache và không làm gián đoạn `api` hay `client`.

### 1.3. Cấu Hình VPS Khuyến Nghị

| Tiêu Chí              | Cấu Hình Tối Thiểu           | Cấu Hình Khuyến Nghị (Production) |
| :-------------------- | :--------------------------- | :-------------------------------- |
| **Hệ Điều Hành**      | Ubuntu 22.04 LTS / 24.04 LTS | Ubuntu 24.04 LTS x86_64           |
| **CPU**               | 2 vCPU                       | 4 vCPU                            |
| **RAM**               | 4 GB (+ 4GB Swap)            | 8 GB (+ 4GB Swap)                 |
| **Ổ Cứng (SSD/NVMe)** | 40 GB SSD                    | 80+ GB NVMe SSD                   |

---

## Bước 1: Chuẩn Bị VPS, Swap & Cài Đặt Docker

Kết nối SSH vào VPS:

```bash
ssh root@<IP_VPS_CUA_BAN>
```

### 1.1. Cập nhật hệ thống & cài đặt công cụ cơ bản

```bash
apt update && apt upgrade -y
apt install -y curl wget git ufw htop ca-certificates gnupg nginx certbot python3-certbot-nginx
```

### 1.2. Tạo 4GB Swapfile (Chống tràn RAM khi compile Next.js & Vite)

```bash
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
sysctl vm.swappiness=10
echo 'vm.swappiness=10' | tee -a /etc/sysctl.conf
```

### 1.3. Cài đặt Docker Engine & Docker Compose Plugin chính thức

```bash
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker
docker --version
docker compose version
```

### 1.4. Cấu hình Tường Lửa (UFW Firewall)

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status
```

---

## Bước 2: Cấu Hình DNS Tên Miền

Trỏ các bản ghi **A Record** tại nhà cung cấp DNS về địa chỉ IP của VPS:

| Loại (Type) | Tên (Host)           | Giá Trị (Target)   | Dịch Vụ Đích                              |
| :---------- | :------------------- | :----------------- | :---------------------------------------- |
| **A**       | `@` (yourdomain.com) | `<IP_VPS_CUA_BAN>` | Website khách hàng (`apps/client` :3000)  |
| **A**       | `www`                | `<IP_VPS_CUA_BAN>` | Website khách hàng (`apps/client` :3000)  |
| **A**       | `api`                | `<IP_VPS_CUA_BAN>` | REST API Backend (`apps/api` :8000)       |
| **A**       | `admin`              | `<IP_VPS_CUA_BAN>` | Cổng quản trị Admin (`apps/web` :8080)    |

---

## Bước 3: Clone Mã Nguồn & Cấu Hình Các File `.env`

### 3.1. Clone repository về máy chủ

```bash
mkdir -p /opt/crodic
cd /opt/crodic
git clone git@github.com:<ORG>/<REPO>.git .
```

### 3.2. Khởi tạo 4 file `.env` từ file mẫu

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/client/.env.example apps/client/.env
```

### 3.3. Chỉnh sửa nội dung các file `.env`

#### 1. File `.env` ở thư mục gốc (Hạ tầng & Cổng)
```env
API_PORT=8000
WEB_PORT=8080
CLIENT_PORT=3000

POSTGRES_HOST=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=MatKhauDatabaseManh123!
POSTGRES_DB=monorepo
POSTGRES_PORT=5432

REDIS_HOST=redis
REDIS_PASSWORD=MatKhauRedisManh123!
REDIS_PORT=6379

MINIO_HOST=minio
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=MatKhauMinioManh123!
AWS_DEFAULT_S3_BUCKET=nest-uploads
AWS_PRIVATE_BUCKET=nest-uploads-private
```

#### 2. File `apps/api/.env` (Backend NestJS)
Chỉnh sửa các thông số quan trọng trong `apps/api/.env`:
```env
NODE_ENV=production
APP_PORT=8000
APP_URL=https://api.yourdomain.com
APP_DEBUG=false
APP_CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com,https://admin.yourdomain.com

# Kết nối tới container postgres và redis trong mạng Docker nội bộ
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=MatKhauDatabaseManh123!
DATABASE_NAME=monorepo
DATABASE_SYNCHRONIZE=false

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=MatKhauRedisManh123!

# URL điều hướng xác thực
AUTH_PORTAL_URL=https://admin.yourdomain.com
AUTH_PORTAL_RESET_PASSWORD_URL=https://admin.yourdomain.com/reset-password
USER_AUTH_CLIENT_URL=https://yourdomain.com
USER_AUTH_CLIENT_RESET_PASSWORD_URL=https://yourdomain.com/auth/reset-password
```
*(Đừng quên thay thế các khóa `AUTH_JWT_SECRET`, `USER_AUTH_JWT_SECRET`... bằng chuỗi ngẫu nhiên tối thiểu 32 ký tự).*

#### 3. File `apps/web/.env` (Cổng Quản Trị Vite)
```env
PORT=5173
VITE_API_URL=https://api.yourdomain.com/api/v1
VITE_APP_NAME=Animazing
VITE_SOCKET_URL=https://api.yourdomain.com
VITE_AUTH_KEY="${VITE_APP_NAME}_AUTH_KEY"
VITE_CLIENT_URL=https://yourdomain.com
VITE_SENTRY_ENVIRONMENT=production
```

#### 4. File `apps/client/.env` (Website Khách Hàng Next.js)
```env
PORT=3000
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com
NEXT_PUBLIC_ADMIN_PORTAL_URL=https://admin.yourdomain.com
# Gọi trực tiếp qua mạng nội bộ Docker khi render phía server (SSR)
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

## Bước 4: Build & Khởi Chạy Hệ Thống Với Docker Compose

Từ thư mục gốc `/opt/crodic`, chạy lệnh:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Kiểm tra trạng thái các container đang chạy:

```bash
docker compose -f docker-compose.prod.yml ps
```

Theo dõi log khởi động của hệ thống:

```bash
docker compose -f docker-compose.prod.yml logs -f api client web
```

---

## Bước 5: Chạy Migration, Đồng Bộ Quyền & Seed Dữ Liệu

Trong lần triển khai đầu tiên, thực thi các lệnh khởi tạo cơ sở dữ liệu bên trong container `crodic_api`:

```bash
# 1. Chạy TypeORM Migrations tạo bảng
docker exec -it crodic_api npm run migration:run:prod

# 2. Đồng bộ danh mục quyền hạn (RBAC Permissions)
docker exec -it crodic_api npm run permissions:sync:prod

# 3. Khởi tạo tài khoản Super Admin mặc định và dữ liệu nền
docker exec -it crodic_api npm run seed:run:prod
```

---

## Bước 6: Cấu Hình Nginx Reverse Proxy & Chứng Chỉ SSL (HTTPS)

Tạo cấu hình Nginx tại `/etc/nginx/sites-available/crodic.conf`:

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

Kích hoạt cấu hình và cấp phát chứng chỉ SSL miễn phí bằng Certbot:

```bash
ln -s /etc/nginx/sites-available/crodic.conf /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Cấp chứng chỉ HTTPS tự động cho cả 3 domain
certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com -d admin.yourdomain.com
```

---

## Bước 7: Quy Trình Cập Nhật Phiên Bản Mới (Redeploy)

Khi có bản cập nhật mới trên nhánh `main` (sau khi GitHub Actions CI đã chạy pass toàn bộ bài test):

```bash
cd /opt/crodic
git pull origin main

# Build và cập nhật các container có thay đổi
docker compose -f docker-compose.prod.yml up -d --build

# Chạy migration mới (nếu có) và đồng bộ quyền
docker exec -it crodic_api npm run migration:run:prod
docker exec -it crodic_api npm run permissions:sync:prod

# Dọn dẹp các image cũ không còn sử dụng
docker image prune -f
```

> [!TIP]
> Nhờ cơ chế tách lớp cache trong Dockerfile:
> - Nếu bản cập nhật chỉ sửa `apps/web`, chỉ `crodic_web` được build và khởi động lại; `crodic_api` và `crodic_client` được giữ nguyên 100%.
> - Nếu bạn chỉ sửa biến trong `apps/api/.env`, lệnh `docker compose -f docker-compose.prod.yml up -d` sẽ nạp lại biến môi trường và khởi động lại `crodic_api` ngay lập tức mà không cần build lại image.

---

## Bước 8: Kiểm Tra Hoạt Động (Smoke Tests) & Sao Lưu

### 8.1. Kiểm tra phản hồi các dịch vụ

```bash
curl -f -I https://api.yourdomain.com/api/v1/health
curl -f -I https://yourdomain.com
curl -f -I https://admin.yourdomain.com
```

### 8.2. Sao lưu cơ sở dữ liệu PostgreSQL tự động (Cronjob)

Tạo cronjob sao lưu PostgreSQL mỗi ngày vào 02:00 sáng:

```bash
mkdir -p /opt/backups/postgres

# Thêm vào crontab (crontab -e):
0 2 * * * docker exec crodic_postgres pg_dump -U postgres monorepo | gzip > /opt/backups/postgres/db_$(date +\%F).sql.gz && find /opt/backups/postgres -type f -mtime +7 -delete
```

---

## Xử Lý Sự Cố Thường Gặp (Troubleshooting)

### 1. Quá trình build bị dừng đột ngột với `Exit code 137 (OOM Killed)`
- **Nguyên nhân**: Hạt nhân Linux tắt tiến trình biên dịch do thiếu RAM.
- **Cách khắc phục**: Kiểm tra Swap bằng lệnh `free -h` và đảm bảo đã tạo tối thiểu 4GB Swap ở [Bước 1.2](#12-tạo-4gb-swapfile-chống-tràn-ram-khi-compile-nextjs--vite). Nếu VPS ít RAM, có thể build từng dịch vụ lần lượt:
  ```bash
  docker compose -f docker-compose.prod.yml build api
  docker compose -f docker-compose.prod.yml build web
  docker compose -f docker-compose.prod.yml build client
  docker compose -f docker-compose.prod.yml up -d
  ```

### 2. Lỗi CORS khi gọi API từ Admin hoặc Client
- **Cách khắc phục**: Kiểm tra biến `APP_CORS_ORIGIN` trong `apps/api/.env` đã liệt kê đầy đủ các domain có `https://` và không có dấu `/` ở cuối, sau đó chạy `docker compose -f docker-compose.prod.yml up -d api`.

### 3. Thay đổi biến trong `apps/web/.env` hoặc `apps/client/.env`
- **Lưu ý**: Các biến `VITE_*` và `NEXT_PUBLIC_*` được trình biên dịch đóng gói vào bundle lúc build. Khi thay đổi các file này trên server, hãy chạy `docker compose -f docker-compose.prod.yml up -d --build web client` để cập nhật bundle mới.
