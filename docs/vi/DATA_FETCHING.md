# Kiến Trúc & Quy Chuẩn Gọi Dữ Liệu (Data Fetching)

> [English](../en/DATA_FETCHING.md) | **Tiếng Việt**

Tài liệu này giải thích chi tiết kiến trúc gọi dữ liệu (Data Fetching) 3 tầng trong ứng dụng Next.js 16 (`apps/client`), làm rõ khi nào, tại sao và cách sử dụng từng công cụ HTTP: **`serverFetch`**, **`http`**, và **`xior`**.

---

## Tổng Quan Kiến Trúc

Trong một hệ thống full-stack monorepo hiện đại kết hợp Next.js 16 (App Router) và NestJS, việc gọi dữ liệu diễn ra ở 2 môi trường hoàn toàn khác biệt:

1. **Phía Server (Node.js)**: Server Components (RSC), Server Actions và Route Handlers.
2. **Phía Client (Trình duyệt)**: Các component tương tác có `'use client'`, TanStack Query, các hàm xử lý sự kiện (onClick, onSubmit).

Để đảm bảo hiệu năng tối đa, không bị lỗi CORS, không mất cookie trên subdomain và tránh vòng lặp vô tận khi làm mới token, hệ thống áp dụng **chiến lược 3 tầng HTTP**:

```mermaid
flowchart TD
    subgraph ClientSide["Trình duyệt (Phía Client)"]
        UI["React Client Components ('use client')"]
        Store["Zustand Auth Store (Lưu Access Token trong RAM)"]

        UI -->|99% API nghiệp vụ ứng dụng| HTTP["http (@/lib/http)"]
        HTTP -.->|Đọc token| Store
        HTTP -->|Tự động Bearer Token + Interceptor 401| NestAPI["NestJS Backend (Port 8000 / api.example.com)"]

        UI -->|API xác thực BFF: /api/auth/*| RawXior["xior (Thư viện fetch thuần)"]
        UI -->|Upload thẳng lên S3 Presigned URL / Webhook ngoài| RawXior
        RawXior -->|Đường dẫn tương đối: Cùng Origin| NextBFF["Next.js Route Handlers (Port 3000 / app.example.com)"]
    end

    subgraph ServerSide["Node.js / Docker (Phía Server)"]
        RSC["React Server Components (page.tsx / layout.tsx)"]
        SA["Server Actions / Route Handlers"]
        Cookies["Next.js Cookies (next/headers)"]

        RSC -->|Lấy dữ liệu SSR / ISR| SF["serverFetch (@/lib/server-fetch)"]
        SA -->|Thao tác dữ liệu / Proxy| SF
        SF -.->|Tự động chuyển tiếp accessToken| Cookies
        SF -->|Mạng nội bộ Docker (http://api:8000)| NestAPI
    end
```

---

## Bảng So Sánh Chi Tiết

| Tiêu chí                 | `serverFetch` (`@/lib/server-fetch`)      | `http` (`@/lib/http`)                      | `xior` (`import xior from "xior"`)              |
| :----------------------- | :---------------------------------------- | :----------------------------------------- | :---------------------------------------------- |
| **Môi trường chạy**      | **Chỉ trên Server** (RSC, Server Actions) | **Chỉ trên Client** (`'use client'`)       | **Chỉ trên Client** (Tác vụ đặc thù)            |
| **Đích đến mặc định**    | NestJS Backend (`SERVER_API_URL`)         | NestJS Backend (`NEXT_PUBLIC_API_URL`)     | Host hiện tại của tab trình duyệt               |
| **Đường truyền mạng**    | Mạng nội bộ Docker (`http://api:8000`)    | Mạng Internet / Nginx Reverse Proxy        | Trình duyệt gọi nội bộ (`/api/...`)             |
| **Nguồn lấy Token**      | Cookie HttpOnly (`next/headers`)          | Bộ nhớ RAM Zustand (`useAuthStore`)        | Không (tự động đính kèm cookie của tab)         |
| **Tự động làm mới 401**  | Không (do Middleware/Client quản lý)      | **Có** (Single-flight tự retry trong suốt) | **Không** (Bỏ qua mọi Interceptor)              |
| **Hỗ trợ Cache Next.js** | **Có** (`next: { revalidate, tags }`)     | Không (quản lý bởi TanStack Query)         | Không                                           |
| **Trường hợp sử dụng**   | SSR ban đầu, SEO metadata, Server Action  | 99% tương tác Client, CRUD, TanStack Query | Route nội bộ Next.js (`/api/auth/*`), upload S3 |

---

## 1. `serverFetch`: Tầng Gọi Dữ Liệu Phía Server

[`apps/client/src/lib/server-fetch.ts`](../../apps/client/src/lib/server-fetch.ts) là tiện ích chính thức để fetch dữ liệu trong **React Server Components**, **Server Actions**, và **Route Handlers**.

### Tính Năng Nổi Bật

1. **Giao tiếp mạng nội bộ siêu tốc**: Tự động sử dụng `SERVER_API_URL` (ví dụ `http://api:8000`) khi chạy trong Docker. Dữ liệu đi thẳng qua mạng cầu nối (bridge network) nội bộ của máy chủ, không tốn tài nguyên NAT ra Internet rồi quay vòng về.
2. **Tự động chuyển tiếp Cookie xác thực**: Tự động đọc `cookies()` từ `next/headers` và đính kèm `Authorization: Bearer <token>` khi gọi sang NestJS Backend.
3. **Hỗ trợ tạo trang tĩnh (`anonymous: true`)**: Đối với các trang công khai (ISR/SSG) không cần phiên đăng nhập, bật cờ `anonymous: true` giúp `serverFetch` bỏ qua bước đọc cookie, cho phép Next.js prerender trang HTML tĩnh hoàn toàn.
4. **Tích hợp cơ chế Cache của Next.js**: Hỗ trợ đầy đủ `next: { revalidate, tags }` cho Incremental Static Regeneration.
5. **Tự động ngắt khi quá thời gian (Timeout)**: Quản lý vòng đời `AbortController` tự động, tránh treo request.
6. **Bảo toàn cơ chế điều hướng Next.js**: Không nuốt lỗi `notFound()` hay `redirect()` của Next.js Router.

### Ví Dụ Sử Dụng

#### A. Trong Server Component (SSR / ISR)

```tsx
// app/[locale]/posts/[slug]/page.tsx
import { serverFetch } from "@/lib/server-fetch";

interface Post {
  id: string;
  title: string;
  content: string;
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Gọi trực tiếp NestJS qua mạng nội bộ Docker: http://api:8000/api/v1/posts/:slug
  const post = await serverFetch<Post>(`/api/v1/posts/${slug}`, {
    next: { revalidate: 3600, tags: [`post-${slug}`] }, // Lưu đệm cache trong 1 giờ
  });

  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  );
}
```

#### B. Trong Server Component cần quyền đăng nhập

```tsx
// Tự động trích xuất HttpOnly cookie accessToken gửi sang NestJS:
const userProfile = await serverFetch<UserProfile>("/api/v1/user/profile");
```

---

## 2. `http`: Tầng Gọi Dữ Liệu Nghiệp Vụ Phía Client

[`apps/client/src/lib/http.ts`](../../apps/client/src/lib/http.ts) là instance của `xior` được cấu hình tối ưu hóa cho **toàn bộ các API nghiệp vụ trên trình duyệt**.

### Tính Năng Nổi Bật

1. **Đích đến chuẩn hóa**: Tự động gắn `baseURL: process.env.NEXT_PUBLIC_API_URL` trỏ về NestJS API.
2. **Tự động gắn Bearer Token**: Đọc `accessToken` mới nhất từ bộ nhớ RAM của Zustand store (`useAuthStore`) trước mỗi request.
3. **Cơ chế Single-Flight xoay vòng Token (401 Interceptor)**:
   - Khi token hết hạn (HTTP 401), `http` tạm dừng request lại.
   - Nó gửi đúng **1** lệnh làm mới token duy nhất sang `/api/auth/refresh`. Dù có 10 component cùng kích hoạt 401 cùng lúc, hệ thống chỉ gửi 1 request làm mới token duy nhất.
   - Khi có token mới, toàn bộ các request đang chờ sẽ tự động được gửi lại (retry) với token mới, trải nghiệm người dùng hoàn toàn mượt mà.
4. **Tự động xử lý FormData**: Tự động loại bỏ header `Content-Type` cứng nhắc khi `data instanceof FormData`, để trình duyệt tự điền boundary chuẩn `multipart/form-data`.

### Ví Dụ Sử Dụng

#### A. Trong TanStack Query (`useQuery`)

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";

export function UserProfileCard() {
  const { data, isLoading } = useQuery({
    queryKey: ["user", "profile"],
    queryFn: async () => {
      // Tự động gắn Bearer Token: http://localhost:8000/api/v1/user/profile
      const res = await http.get<UserProfile>("/api/v1/user/profile");
      return res.data;
    },
  });

  if (isLoading) return <div>Đang tải...</div>;
  return <div>Xin chào, {data?.name}</div>;
}
```

#### B. Thao tác Mutation (`useMutation`)

```tsx
"use client";

import { useMutation } from "@tanstack/react-query";
import { http } from "@/lib/http";

export function useCreatePost() {
  return useMutation({
    mutationFn: (newPost: { title: string; content: string }) =>
      http.post("/api/v1/posts", newPost),
  });
}
```

---

## 3. `xior`: Tầng Gọi Thuần Cho BFF & Tác Vụ Độc Lập

Được import trực tiếp từ thư viện: `import xior from "xior"`.

### Tại sao KHÔNG dùng `http` cho các route Next.js BFF?

1. **Sai lệch địa chỉ đích**: `http` có `baseURL` trỏ sang NestJS (Port 8000). Nếu dùng `http.get("/api/auth/tokens")`, request sẽ bay sang NestJS và trả về lỗi **404 Not Found** (vì route này nằm ở Next.js).
2. **Nguy cơ lặp vô tận (Deadlock)**: Nếu route làm mới token trả về 401, `http` sẽ lại kích hoạt Interceptor 401 -> tạo vòng lặp vô tận làm đơ ứng dụng.
3. **Tương thích Subdomain**: Dùng `xior.get("/api/auth/tokens")` giữ nguyên URL tương đối, trình duyệt sẽ tự động ghép subdomain hiện tại (`app.example.com` hoặc `app.localhost:3000`), không bị lỗi CORS và giữ nguyên Cookie.

### Khi Nào Dùng `xior` Thuần?

1. **Gọi các Route Handler xác thực của Next.js**:
   - Lưu phiên đăng nhập: `xior.post("/api/auth/tokens", { accessToken, refreshToken })`
   - Làm mới phiên đăng nhập: `xior.post("/api/auth/refresh")`
   - Đăng xuất xóa cookie: `xior.post("/api/auth/logout")`
2. **Tải file trực tiếp lên Storage bên thứ 3**:
   - Upload file trực tiếp lên AWS S3 / MinIO bằng Presigned URL:
     ```ts
     // xior thuần đảm bảo KHÔNG làm lộ Bearer token sang dịch vụ ngoài
     await xior.put(presignedUploadUrl, fileBinary, {
       headers: { "Content-Type": file.type },
     });
     ```
3. **Gọi Webhook ngoài & Phân tích dữ liệu**:
   - Gửi log telemetry hoặc Captcha xác thực sang Google / Cloudflare.

---

## Cây Quyết Định Chọn Công Cụ

Mỗi khi chuẩn bị viết lệnh gọi API, bạn chỉ cần trả lời 2 câu hỏi sau:

```
1. Bạn đang viết code ở đâu?
   ├── Ở Server (page.tsx, layout.tsx, Server Action)
   │   └── BẮT BUỘC DÙNG: `serverFetch` (@/lib/server-fetch)
   │
   └── Ở Client ('use client', tương tác giao diện)
       2. Bạn muốn gọi tới đâu?
          ├── Tới Route nội bộ Next.js (/api/auth/*) hoặc S3 Presigned URL
          │   └── DÙNG: `xior` thuần (import xior from "xior")
          │
          └── Tới Backend API NestJS (99% nghiệp vụ ứng dụng)
              └── DÙNG: `http` (@/lib/http)
```
