# NestJS Observe (APM & OpenTelemetry)

> **English** | [Tiếng Việt](../vi/OBSERVE.md)

This document describes how **NestJS Observe** (the official APM platform for NestJS) is integrated into `apps/api` for real-time application performance monitoring, latency tracing, and runtime telemetry.

---

## Table of Contents

- [Overview](#overview)
- [Architecture & Key Files](#architecture--key-files)
- [Configuration & Environment Variables](#configuration--environment-variables)
- [How It Works](#how-it-works)
  - [Bootstrap Instrumentation (`main.ts` & `observe.ts`)](#bootstrap-instrumentation-maints--observets)
  - [Module Setup (`AppModule`)](#module-setup-appmodule)
  - [Worker Telemetry Pipeline](#worker-telemetry-pipeline)
- [Dashboard Features](#dashboard-features)
- [Local Development & Verification](#local-development--verification)
- [Production Deployment (VPS)](#production-deployment-vps)

---

## Overview

[NestJS Observe](https://observe.nestjs.com/) is the official Application Performance Monitoring (APM) and observability solution purpose-built for the NestJS ecosystem. Powered by OpenTelemetry under the hood, it provides:

- **Real-Time Request Tracing**: Detailed trace per HTTP request, including route, execution duration, P95 latency, and status code.
- **CPU & Memory Tracking**: Low-overhead worker thread continuously sampling process health, memory usage, and CPU percentages.
- **Service & Environment Identification**: Dynamic tagging (`Production` vs `Development`) separated by `OBSERVE_SERVICE_ID`.
- **Zero-Crash Resiliency**: Background telemetry failures (rate-limits, 401s, timeouts) never interrupt or degrade API request handling.

---

## Architecture & Key Files

```
apps/api/
├── src/
│   ├── observe.ts                  # Exports { ObserveModule, ObserveInstrument } via createObserveModule()
│   ├── main.ts                     # Imports 'dotenv/config' and registers instrument: ObserveInstrument
│   ├── app.module.ts               # Configures ObserveModule.forRootAsync() with ConfigService
│   └── config/
│       ├── observe.config.ts       # Typed configuration and environment sanitation (strips accidental quotes)
│       └── config.type.ts          # Integrates ObserveConfig into AllConfigType
├── .env.example                    # Template containing OBSERVE_APP_KEY, OBSERVE_APP_SECRET, OBSERVE_SERVICE_ID
└── .env                            # Application environment variables
```

---

## Configuration & Environment Variables

Configure NestJS Observe in `apps/api/.env`:

```env
# ==============================================================================
# NestJS Observe (APM)
# ==============================================================================
OBSERVE_APP_KEY=your_app_key_here
OBSERVE_APP_SECRET=your_app_secret_here
OBSERVE_SERVICE_ID=kosume-api
```

| Variable             | Description                                                            | Default / Example                          |
| :------------------- | :--------------------------------------------------------------------- | :----------------------------------------- |
| `OBSERVE_APP_KEY`    | Ingestion key generated from the Observe Dashboard under **API Keys**. | Required in production                     |
| `OBSERVE_APP_SECRET` | Ingestion secret matching the App Key.                                 | Required in production                     |
| `OBSERVE_SERVICE_ID` | Service identifier mapping to OpenTelemetry `service.name`.            | `kosume-api` (prod) / `kosume-local` (dev) |

> [!TIP]
> If `OBSERVE_APP_KEY` and `OBSERVE_APP_SECRET` are left empty, the Observe module will gracefully remain idle without breaking application startup.

---

## How It Works

### Bootstrap Instrumentation (`main.ts` & `observe.ts`)

NestJS Observe requires early instrumentation to patch incoming and outgoing protocols. This is achieved via `createObserveModule()`:

```typescript
// apps/api/src/observe.ts
import { createObserveModule } from "@nestjs/observe";

export const { ObserveModule, ObserveInstrument } = createObserveModule();
```

In `apps/api/src/main.ts`, `ObserveInstrument` is registered during `NestFactory.create`:

```typescript
import "dotenv/config";
import "./instrument";
import { ObserveInstrument } from "./observe";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    instrument: ObserveInstrument,
  });
  // ...
}
```

### Module Setup (`AppModule`)

`ObserveModule.forRootAsync()` dynamically resolves credentials and service identification from `ConfigService`:

```typescript
ObserveModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService<AllConfigType>) => ({
    appKey: configService.get('observe.appKey', { infer: true }),
    appSecret: configService.get('observe.appSecret', { infer: true }),
    serviceId:
      configService.get('observe.serviceId', { infer: true }) || 'kosume-local',
  }),
}),
```

### Worker Telemetry Pipeline

- Telemetry batches are collected asynchronously via a detached worker thread.
- Metrics are buffered in memory and flushed periodically (every 5 seconds) to minimize overhead on the main Node.js event loop.
- The connection is verified once upon the first successful batch receipt:
  ```text
  [Observe] Observe is connected: the collector accepted this app's first batch.
  ```

---

## Dashboard Features

Navigate to [observe.nestjs.com](https://observe.nestjs.com) to access the live dashboard:

- **Overview Dashboard**: Active requests/sec, error rates, average duration, and p95 latency.
- **Operations List**: Breakdown by route (`/api/v1/white-labels/active`, `/health`, `/api/v1/setup/status`, etc.).
- **Trace Inspector**: Detailed timeline, status code, protocol, and duration of individual HTTP requests.
- **Application Switcher**: Toggle between distinct services sharing the telemetry project.

---

## Local Development & Verification

1. Set your credentials in `apps/api/.env`:
   ```env
   OBSERVE_APP_KEY=your_key
   OBSERVE_APP_SECRET=your_secret
   OBSERVE_SERVICE_ID=kosume-local
   ```
2. Start the API:
   ```bash
   pnpm --filter api dev
   ```
3. Trigger sample requests:
   ```bash
   curl http://localhost:8000/health
   ```
4. Check the console:
   ```text
   [ObserveAgentWorker] Observe agent worker initialized.
   [ObserveAgentWorker] Observe is connected: the collector accepted this app's first batch.
   ```

---

## Production Deployment (VPS)

When deploying with Docker Compose on your production server:

1. Add your production keys to `/var/www/crodic-framework/apps/api/.env`:
   ```env
   OBSERVE_APP_KEY=your_prod_key
   OBSERVE_APP_SECRET=your_prod_secret
   OBSERVE_SERVICE_ID=kosume-api
   ```
2. Recreate the API container to pick up the updated `.env` file:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --force-recreate api
   ```
3. Verify environment variables inside the running container:
   ```bash
   docker exec crodic_api env | grep OBSERVE
   ```
