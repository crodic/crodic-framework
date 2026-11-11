# Giám sát hiệu năng với NestJS Observe (APM & OpenTelemetry)

> [English](../en/OBSERVE.md) | **Tiếng Việt**

Tài liệu này hướng dẫn cách tích hợp và vận hành **NestJS Observe** (nền tảng APM chính thức dành riêng cho NestJS) trong `apps/api` để theo dõi hiệu năng hệ thống theo thời gian thực, đo lường độ trễ API và giám sát tài nguyên máy chủ.

---

## Mục lục

- [Tổng quan](#tổng-quan)
- [Kiến trúc & Các file quan trọng](#kiến-trúc--các-file-quan-trọng)
- [Cấu hình & Biến môi trường](#cấu-hình--biến-môi-trường)
- [Cơ chế hoạt động](#cơ-chế-hoạt-động)
  - [Khởi tạo sớm Instrument (`main.ts` & `observe.ts`)](#khởi-tạo-sớm-instrument-maints--observets)
  - [Đăng ký Module (`AppModule`)](#đăng-ký-module-appmodule)
  - [Tiến trình Worker Telemetry ngầm](#tiến-trình-worker-telemetry-ngầm)
- [Các tính năng trên Dashboard Observe](#các-tính-năng-trên-dashboard-observe)
- [Kiểm tra hoạt động ở môi trường Local](#kiểm-tra-hoạt-động-ở-môi-trường-local)
- [Triển khai trên Production (VPS)](#triển-khai-trên-production-vps)

---

## Tổng quan

[NestJS Observe](https://observe.nestjs.com/) là giải pháp Application Performance Monitoring (APM) chính thức do đội ngũ NestJS phát triển, xây dựng trên nền tảng chuẩn OpenTelemetry:

- **Truy vết Request thời gian thực**: Đo lường chi tiết từng HTTP request (route, thời gian phản hồi ms, p95 latency, mã trạng thái HTTP 2xx/4xx/5xx).
- **Giám sát CPU & RAM**: Worker thread độc lập liên tục lấy mẫu mức tiêu thụ CPU và dung lượng bộ nhớ (Memory heap/RSS) mà không gây nghẽn Event Loop.
- **Phân tách môi trường rõ ràng**: Gắn nhãn môi trường (`Production` vs `Development`) linh hoạt thông qua biến `OBSERVE_SERVICE_ID`.
- **An toàn tuyệt đối (Zero-Crash)**: Các lỗi mạng, hết hạn ngạch (429), hoặc sai key (401) của Observe đều được xử lý ngầm và không bao giờ làm gián đoạn việc phục vụ người dùng.

---

## Kiến trúc & Các file quan trọng

```
apps/api/
├── src/
│   ├── observe.ts                  # Xuất { ObserveModule, ObserveInstrument } từ createObserveModule()
│   ├── main.ts                     # Nạp 'dotenv/config' và truyền instrument: ObserveInstrument vào NestFactory
│   ├── app.module.ts               # Khởi tạo ObserveModule.forRootAsync() đồng bộ cùng ConfigService
│   └── config/
│       ├── observe.config.ts       # Định nghĩa Schema cấu hình & làm sạch chuỗi (loại bỏ dấu nháy thừa)
│       └── config.type.ts          # Đăng ký ObserveConfig vào AllConfigType
├── .env.example                    # Mẫu cấu hình OBSERVE_APP_KEY, OBSERVE_APP_SECRET, OBSERVE_SERVICE_ID
└── .env                            # File biến môi trường thực tế
```

---

## Cấu hình & Biến môi trường

Cấu hình trong file `apps/api/.env`:

```env
# ==============================================================================
# NestJS Observe (APM)
# ==============================================================================
OBSERVE_APP_KEY=your_app_key_here
OBSERVE_APP_SECRET=your_app_secret_here
OBSERVE_SERVICE_ID=kosume-api
```

| Biến môi trường      | Mô tả                                                             | Mẫu / Mặc định                             |
| :------------------- | :---------------------------------------------------------------- | :----------------------------------------- |
| `OBSERVE_APP_KEY`    | Khóa ứng dụng lấy từ mục **API Keys** trên Dashboard Observe.     | Bắt buộc trên Production                   |
| `OBSERVE_APP_SECRET` | Secret tương ứng với App Key.                                     | Bắt buộc trên Production                   |
| `OBSERVE_SERVICE_ID` | Định danh service (tương ứng `service.name` trong OpenTelemetry). | `kosume-api` (prod) / `kosume-local` (dev) |

> [!TIP]
> Nếu để trống `OBSERVE_APP_KEY` và `OBSERVE_APP_SECRET` ở môi trường dev, Observe sẽ tự động chuyển sang chế độ không hoạt động (idle) mà không gây ra bất kỳ lỗi khởi động nào.

---

## Cơ chế hoạt động

### Khởi tạo sớm Instrument (`main.ts` & `observe.ts`)

Để theo dõi toàn diện các request vào/ra mà không bị bỏ sót, Observe yêu cầu instrument ngay từ lúc tạo ứng dụng:

```typescript
// apps/api/src/observe.ts
import { createObserveModule } from "@nestjs/observe";

export const { ObserveModule, ObserveInstrument } = createObserveModule();
```

Trong `apps/api/src/main.ts`:

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

### Đăng ký Module (`AppModule`)

Sử dụng `ObserveModule.forRootAsync()` để nạp cấu hình linh hoạt qua `ConfigService`:

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

### Tiến trình Worker Telemetry ngầm

- Dữ liệu đo lường được gửi thông qua một **Worker Thread tách rời**.
- Dữ liệu được gom lại (batching) và đẩy lên collector mỗi 5 giây/lần nhằm giảm tối đa độ trễ.
- Khi kết nối thành công mẻ dữ liệu đầu tiên, hệ thống sẽ in ra log:
  ```text
  [Observe] Observe is connected: the collector accepted this app's first batch.
  ```

---

## Các tính năng trên Dashboard Observe

Truy cập [observe.nestjs.com](https://observe.nestjs.com) để xem dashboard:

- **Tổng quan Dashboard**: Tần suất gọi API (req/s), tỷ lệ lỗi, thời gian phản hồi trung bình và phân vị P95.
- **Danh sách Operations**: Thống kê chi tiết từng endpoint (`/api/v1/white-labels/active`, `/health`, `/api/v1/setup/status`, v.v.).
- **Chi tiết Trace**: Dòng thời gian chi tiết của từng request, mã trạng thái HTTP, giao thức và thời gian thực thi.
- **Quản lý Service**: Dễ dàng lọc giữa các môi trường (`Production` vs `Development`) trong cùng một dự án.

---

## Kiểm tra hoạt động ở môi trường Local

1. Điền key vào `apps/api/.env`:
   ```env
   OBSERVE_APP_KEY=your_key
   OBSERVE_APP_SECRET=your_secret
   OBSERVE_SERVICE_ID=kosume-local
   ```
2. Khởi chạy API:
   ```bash
   pnpm --filter api dev
   ```
3. Gửi request thử nghiệm:
   ```bash
   curl http://localhost:8000/health
   ```
4. Kiểm tra terminal:
   ```text
   [ObserveAgentWorker] Observe agent worker initialized.
   [ObserveAgentWorker] Observe is connected: the collector accepted this app's first batch.
   ```

---

## Triển khai trên Production (VPS)

Khi chạy bằng Docker Compose trên máy chủ:

1. Thêm key vào file `/var/www/crodic-framework/apps/api/.env`:
   ```env
   OBSERVE_APP_KEY=your_prod_key
   OBSERVE_APP_SECRET=your_prod_secret
   OBSERVE_SERVICE_ID=kosume-api
   ```
2. Recreate container API để Docker nhận cấu hình `.env` mới:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --force-recreate api
   ```
3. Kiểm tra biến môi trường bên trong container:
   ```bash
   docker exec crodic_api env | grep OBSERVE
   ```
