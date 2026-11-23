# Data Fetching Architecture & Guidelines

> **English** | [Tiếng Việt](../vi/DATA_FETCHING.md)

This document describes the 3-tier data fetching architecture in the Next.js 16 Client application (`apps/client`), explaining when, why, and how to use each HTTP client: **`serverFetch`**, **`http`**, and **`xior`**.

---

## Architecture Overview

In a modern full-stack monorepo with Next.js 16 (App Router) and NestJS, data fetching occurs in two fundamentally different environments:

1. **Server-side (Node.js)**: Server Components (RSC), Server Actions, and Route Handlers.
2. **Client-side (Browser)**: Interactive components (`'use client'`), TanStack Query, event handlers.

To handle these environments cleanly, securely, and efficiently without CORS issues or infinite loops, the application implements a **3-tier HTTP strategy**:

```mermaid
flowchart TD
    subgraph ClientSide["Browser (Client-side)"]
        UI["React Client Components ('use client')"]
        Store["Zustand Auth Store (In-Memory Access Token)"]

        UI -->|99% Business API Requests| HTTP["http (@/lib/http)"]
        HTTP -.->|Reads token| Store
        HTTP -->|Auto Bearer Token + 401 Interceptor| NestAPI["NestJS Backend (Port 8000 / api.example.com)"]

        UI -->|Auth BFF Requests: /api/auth/*| RawXior["xior (Raw Fetch Wrapper)"]
        UI -->|S3 Presigned Uploads / Webhooks| RawXior
        RawXior -->|Relative URL: Same-Origin| NextBFF["Next.js Route Handlers (Port 3000 / app.example.com)"]
    end

    subgraph ServerSide["Node.js / Docker (Server-side)"]
        RSC["React Server Components (page.tsx / layout.tsx)"]
        SA["Server Actions / Route Handlers"]
        Cookies["Next.js Cookies (next/headers)"]

        RSC -->|SSR / ISR Data Fetching| SF["serverFetch (@/lib/server-fetch)"]
        SA -->|Mutations / Proxied Calls| SF
        SF -.->|Auto-forwards accessToken| Cookies
        SF -->|Docker Internal Network (http://api:8000)| NestAPI
    end
```

---

## Comparison Matrix

| Capability / Feature   | `serverFetch` (`@/lib/server-fetch`)       | `http` (`@/lib/http`)                         | `xior` (`import xior from "xior"`)                   |
| :--------------------- | :----------------------------------------- | :-------------------------------------------- | :--------------------------------------------------- |
| **Execution Context**  | **Server-side ONLY** (RSC, Server Actions) | **Client-side ONLY** (`'use client'`)         | **Client-side** (Specialized tasks)                  |
| **Default Target**     | NestJS Backend (`SERVER_API_URL`)          | NestJS Backend (`NEXT_PUBLIC_API_URL`)        | Current Host / Relative URL                          |
| **Network Path**       | Internal Docker (`http://api:8000`)        | Public Network / Reverse Proxy                | Browser Same-Origin (`/api/...`)                     |
| **Auth Token Source**  | HttpOnly Cookie (`next/headers`)           | In-memory Zustand (`useAuthStore`)            | None (relies on browser cookie jar)                  |
| **401 Auto-Refresh**   | No (handled by middleware/client)          | **Yes** (Single-flight auto-retry)            | **No** (Bypasses interceptors)                       |
| **Next.js Cache Tags** | **Yes** (`next: { revalidate, tags }`)     | No (handled by TanStack Query)                | No                                                   |
| **Use Case**           | SSR, SEO metadata, Initial page render     | 99% Client interactions, CRUD, TanStack Query | Next.js BFF routes (`/api/auth/*`), S3 direct upload |

---

## 1. `serverFetch`: Server-Side Data Fetching

[`apps/client/src/lib/server-fetch.ts`](../../apps/client/src/lib/server-fetch.ts) is the official utility for fetching data in **React Server Components**, **Server Actions**, and **Route Handlers**.

### Key Features

1. **Zero-Overhead Internal Networking**: Automatically uses `SERVER_API_URL` (e.g. `http://api:8000`) when running inside Docker. Traffic stays inside the private host network rather than exiting to the public internet and looping back.
2. **Transparent Cookie Forwarding**: Automatically inspects `cookies()` from `next/headers` and attaches `Authorization: Bearer <token>` when targeting the API backend.
3. **Static Generation Support (`anonymous: true`)**: When fetching public data for ISR/SSG pages, set `anonymous: true` so `serverFetch` does not read request cookies, allowing Next.js to prerender static pages.
4. **Next.js Caching & Revalidation**: Supports native `next: { revalidate, tags }` cache tags.
5. **Built-in Timeout & AbortController**: Configurable timeout with automatic abort signal cleanup.
6. **Router-Safe Errors**: Preserves Next.js internal control flow errors (`notFound()`, `redirect()`).

### Usage Examples

#### A. Server Component (SSR / ISR)

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

  // Fetches from NestJS via internal Docker network: http://api:8000/api/v1/posts/:slug
  const post = await serverFetch<Post>(`/api/v1/posts/${slug}`, {
    next: { revalidate: 3600, tags: [`post-${slug}`] }, // Cache for 1 hour
  });

  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  );
}
```

#### B. Authenticated Server Component

```tsx
// Automatically forwards the user's HttpOnly cookie accessToken:
const userProfile = await serverFetch<UserProfile>("/api/v1/user/profile");
```

---

## 2. `http`: Client-Side Business Logic Client

[`apps/client/src/lib/http.ts`](../../apps/client/src/lib/http.ts) is an enhanced `xior` instance tailored for **browser-side business API requests**.

### Key Features

1. **Target Backend**: Configured with `baseURL: process.env.NEXT_PUBLIC_API_URL` (NestJS REST API).
2. **Automatic Token Injection**: Reads `accessToken` from Zustand in-memory store (`useAuthStore`) before every request.
3. **Single-Flight 401 Interceptor**:
   - If an API request returns `401 Unauthorized`, `http` pauses the request.
   - It issues a single refresh request to the BFF `/api/auth/refresh`. If 10 concurrent requests return 401 at the same moment, only **1** refresh request is dispatched.
   - Upon successful refresh, all queued requests are retried with the new access token seamlessly.
4. **Automatic FormData Boundary**: Strips explicit `Content-Type` headers when `data instanceof FormData`, allowing the browser to append the required `multipart/form-data; boundary=...`.

### Usage Examples

#### A. In TanStack Query (`useQuery`)

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";

export function UserProfileCard() {
  const { data, isLoading } = useQuery({
    queryKey: ["user", "profile"],
    queryFn: async () => {
      // Calls http://localhost:8000/api/v1/user/profile with Bearer token
      const res = await http.get<UserProfile>("/api/v1/user/profile");
      return res.data;
    },
  });

  if (isLoading) return <div>Loading...</div>;
  return <div>Welcome, {data?.name}</div>;
}
```

#### B. Mutations & File Uploads (`useMutation`)

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

## 3. `xior`: Specialized & BFF Client

Directly imported via `import xior from "xior"`.

### Why not use `http` for Next.js BFF routes?

1. **Target Mismatch**: `http` prepends `NEXT_PUBLIC_API_URL` (Port 8000). Calling `http.get("/api/auth/tokens")` would route the request to **NestJS** (returning 404), not **Next.js**.
2. **Deadlock / Infinite Loop Prevention**: If the refresh route itself returns 401, using `http` would trigger the 401 interceptor again, resulting in an infinite refresh loop.
3. **Subdomain Agility**: Using `xior.get("/api/auth/tokens")` keeps the URL relative. The browser automatically prefixes the current tab origin (`http://app.localhost:3000` or `https://app.example.com`), preventing CORS issues and preserving cookies.

### When to use raw `xior`

1. **Next.js BFF Authentication Handlers**:
   - Save session tokens: `xior.post("/api/auth/tokens", { accessToken, refreshToken })`
   - Refresh tokens: `xior.post("/api/auth/refresh")`
   - Logout & clear cookies: `xior.post("/api/auth/logout")`
2. **Direct Third-Party Service Uploads**:
   - Uploading files directly to AWS S3 / MinIO via a Presigned URL:
     ```ts
     // Raw xior ensures NO Bearer token is leaked to third-party endpoints
     await xior.put(presignedUploadUrl, fileBinary, {
       headers: { "Content-Type": file.type },
     });
     ```
3. **External Webhooks & Analytics**:
   - Sending telemetry or captcha verification payloads to Google/Cloudflare.

---

## Decision Tree

When writing code, follow this simple checklist:

```
1. Is this code running on the Server (page.tsx, layout.tsx, Server Action)?
   ├── YES: Use `serverFetch` (@/lib/server-fetch)
   └── NO (Client-side 'use client'):
       2. Are you calling Next.js internal Route Handlers (/api/auth/*)
          or a 3rd-party Presigned S3 URL?
          ├── YES: Use `xior` directly (import xior from "xior")
          └── NO: Calling NestJS Backend API (99% of app features)
              └── Use `http` (@/lib/http)
```
