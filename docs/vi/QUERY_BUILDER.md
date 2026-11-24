# Bộ QueryBuilder Cho NestJS & TypeORM

> [English](../en/QUERY_BUILDER.md) | **Tiếng Việt**

Bộ QueryBuilder dạng Fluent API theo cơ chế whitelist an toàn cho NestJS và TypeORM.

Package này cho phép ứng dụng frontend lọc dữ liệu (filter), sắp xếp (sort), nạp quan hệ (include), chỉ định các trường cần lấy (sparse fieldsets), và phân trang (pagination) thông qua định dạng URL query string chuẩn hóa, rõ ràng và an toàn tuyệt đối.

---

## Mục lục

- [Tính năng chính](#tính-năng-chính)
- [Cấu trúc thư mục & Kiến trúc](#cấu-trúc-thư-mục--kiến-trúc)
- [Bắt đầu nhanh (Quick Start)](#bắt-đầu-nhanh-quick-start)
- [Bộ lọc (`allowedFilters`)](#bộ-lọc-allowedfilters)
  - [Khớp chính xác, Mảng IN & Boolean (`exact`)](#khớp-chính-xác-mảng-in--boolean-exact)
  - [Khớp một phần (`partial` / ILIKE)](#khớp-một-phần-partial--ilike)
  - [Khớp tiền tố và hậu tố (`startsWith`, `endsWith`)](#khớp-tiền-tố-và-hậu-tố-startswith-endswith)
  - [Toán tử so sánh tĩnh & động (`operator` / `dynamic`)](#toán-tử-so-sánh-tĩnh--động-operator--dynamic)
  - [Nhóm bộ lọc OR / AND (`groupOr`, `groupAnd`)](#nhóm-bộ-lọc-or--and-groupor-groupand)
  - [Lọc trên quan hệ (`roles.name`)](#lọc-trên-quan-hệ-rolesname)
  - [Xóa mềm (`trashed`)](#xóa-mềm-trashed)
  - [Custom Filters (`AllowedFilter.custom` / `callback`)](#custom-filters-allowedfiltercustom)
- [Sắp xếp (`allowedSorts`)](#sắp-xếp-allowedsorts)
  - [Sắp xếp theo cột & Hướng](#sắp-xếp-theo-cột--hướng)
  - [Sắp xếp theo quan hệ](#sắp-xếp-theo-quan-hệ)
  - [Custom Sort Callback](#custom-sort-callback)
  - [Sắp xếp mặc định (`defaultSort`)](#sắp-xếp-mặc-định-defaultsort)
- [Nạp quan hệ (`allowedIncludes`)](#nạp-quan-hệ-allowedincludes)
  - [Quan hệ trực tiếp](#quan-hệ-trực-tiếp)
  - [Quan hệ lồng nhau (`posts.comments`)](#quan-hệ-lồng-nhau-postscomments)
  - [Đếm số lượng quan hệ (`count`)](#đếm-số-lượng-quan-hệ-count)
  - [Custom Include Callback](#custom-include-callback)
- [Chỉ định trường cần lấy (`allowedFields`)](#chỉ-định-trường-cần-lấy-allowedfields)
- [Phân trang (`paginate`)](#phân-trang-paginate)
- [Cấu hình toàn cục & Tùy biến tham số URL](#cấu-hình-toàn-cục--tùy-biến-tham-số-url)
- [Chế độ nghiêm ngặt & Xử lý lỗi (`Strict Mode`)](#chế-độ-nghiêm-ngặt--xử-lý-lỗi-strict-mode)
- [Tích hợp Swagger OpenAPI (`@ApiQueryBuilderDocs`)](#tích-hợp-swagger-openapi-apiquerybuilderdocs)
- [Bảo mật](#bảo-mật)
- [Query Builder ở Frontend (`@repo/query-builder`)](#query-builder-ở-frontend-repoquery-builder)

---

## Tính năng chính

- **Cơ chế Whitelist tuyệt đối**: Chỉ những filter, sort, include, field được khai báo rõ ràng trong code mới được áp dụng vào SQL.
- **Fluent API**: Gọi nối chuỗi các hàm trực quan (`.allowedFilters(...).allowedSorts(...).paginate()`).
- **Sparse Fieldsets (JSON:API)**: Chọn lọc các cột cần trả về giúp giảm tải I/O database và tối ưu hóa băng thông.
- **Quan hệ lồng nhau (Nested Relations)**: Hỗ trợ nạp quan hệ đa cấp (`posts.comments`) và lọc theo quan hệ (`roles.name`).
- **Hỗ trợ Xóa mềm (Soft Delete)**: Tương thích hoàn toàn với `@DeleteDateColumn()` (`with`, `only`, `without`).
- **Tùy biến tham số (Configuration)**: Cho phép đổi tên tham số query trên URL (ví dụ: dùng `per_page` thay vì `limit`, `filters` thay vì `filter`).
- **Strict Mode**: Hỗ trợ ném lỗi `400 Bad Request` chi tiết khi frontend gửi tham số không hợp lệ, giúp debug dễ dàng.
- **Tích hợp Swagger OpenAPI**: Decorator `@ApiQueryBuilderDocs` tự động tạo tài liệu Swagger UI chi tiết không cần cấu hình thủ công.

---

## Cấu trúc thư mục & Kiến trúc

Toàn bộ mã nguồn nằm tại [`apps/api/src/common/query-builder/`](file:///home/hongphat/Documents/Personal/monorepo/apps/api/src/common/query-builder/):

```
apps/api/src/common/query-builder/
├── allowed-filter.ts         # Định nghĩa các loại filter (exact, partial, startsWith, operator, scope, trashed)
├── allowed-sort.ts           # Định nghĩa các loại sắp xếp (field, custom callback)
├── allowed-include.ts        # Định nghĩa nạp quan hệ và đếm quan hệ (relation count)
├── config.ts                 # Quản lý cấu hình toàn cục và cục bộ
├── exceptions.ts             # Hệ thống Exception cho strict mode (InvalidFilterQueryException,...)
├── query-builder.ts          # Lớp QueryBuilder điều phối chính
├── swagger.decorator.ts      # Swagger OpenAPI decorator tự động (@ApiQueryBuilderDocs)
├── swagger.decorator.spec.ts # Kiểm thử unit test cho Swagger decorator
├── types.ts                  # Định nghĩa interface và kiểu dữ liệu TypeScript
├── index.ts                  # Barrel export
└── query-builder.spec.ts     # 39 Unit tests độc lập bao phủ toàn bộ tính năng
```

---

## Bắt đầu nhanh (Quick Start)

### 1. Tại Controller

```typescript
import { Controller, Get, Query } from "@nestjs/common";
import { QueryParams } from "../common/query-builder";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async index(@Query() query: QueryParams) {
    return this.userService.findAll(query);
  }
}
```

### 2. Tại Service

```typescript
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  QueryBuilder,
  AllowedFilter,
  AllowedSort,
  AllowedInclude,
  QueryParams,
} from "../common/query-builder";
import { UserEntity } from "./entities/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findAll(query: QueryParams) {
    return QueryBuilder.for(this.userRepository, query)
      .allowedFilters([
        "name", // partial match (ILIKE %val%)
        AllowedFilter.exact("status"), // exact match (= hoặc IN)
        AllowedFilter.startsWith("code"), // prefix match (val%)
        AllowedFilter.operator("minAge", ">=", "age"), // comparison (age >= val)
        AllowedFilter.trashed(), // soft deletes (with/only/without)
        AllowedFilter.scope("search", (qb, val, a) => {
          qb.andWhere(`(${a}.name ILIKE :s OR ${a}.email ILIKE :s)`, {
            s: `%${val}%`,
          });
        }),
      ])
      .allowedSorts([
        "createdAt",
        "name",
        AllowedSort.field("role", "roles.name"),
      ])
      .defaultSort("-createdAt")
      .allowedIncludes([
        "roles",
        "profile",
        "posts.comments",
        AllowedInclude.count("comments"),
      ])
      .allowedFields(["id", "name", "email", "roles.id", "roles.name"])
      .paginate();
  }
}
```

---

## Bộ lọc (`allowedFilters`)

### Khớp chính xác, Mảng IN & Boolean (`exact`)

```typescript
AllowedFilter.exact("status");
AllowedFilter.exact("roleId");
AllowedFilter.exact("role", "roleId"); // ánh xạ tên param role sang cột roleId
AllowedFilter.exact("isActive"); // tự động ép kiểu 'true'/'false' sang boolean
AllowedFilter.exact("title").delimiter(null); // tắt tách dấu phẩy riêng cho trường này
```

- **Giá trị đơn**: `GET /users?filter[status]=active` ➔ `WHERE status = 'active'`
- **Mảng phân tách bằng dấu phẩy (Multi-select)**: `GET /users?filter[roles.id]=1,2` hoặc `GET /posts?filter[slug]=genshin,honkai` ➔ `WHERE col IN ('1', '2')`
- **Mảng bracket**: `GET /users?filter[status][]=active&filter[status][]=pending` ➔ `WHERE status IN ('active', 'pending')`
- **Boolean tự động**: `GET /users?filter[isActive]=true` ➔ `WHERE isActive = true`

### Khớp một phần (`partial` / ILIKE)

Khi truyền dạng chuỗi `'name'`, mặc định sẽ là `partial`. Các ký tự wildcard SQL (`%`, `_`, `\`) sẽ tự động được escape an toàn:

```typescript
.allowedFilters(['name', AllowedFilter.partial('title')])
```

- **Giá trị đơn**: `GET /users?filter[name]=john` ➔ `WHERE name ILIKE '%john%'`
- **Mảng giá trị**: `GET /users?filter[name]=john,jane` ➔ `WHERE (name ILIKE '%john%' OR name ILIKE '%jane%')`

### Khớp tiền tố và hậu tố (`startsWith`, `endsWith`)

```typescript
AllowedFilter.startsWith("invoiceNumber", "code"); // ?filter[invoiceNumber]=INV ➔ code ILIKE 'INV%'
AllowedFilter.endsWith("domain", "email"); // ?filter[domain]=.com ➔ email ILIKE '%.com'
```

### Toán tử so sánh tĩnh & động (`operator` / `dynamic`)

Hỗ trợ các toán tử tĩnh (`=`, `!=`, `<>`, `>`, `>=`, `<`, `<=`) và toán tử động (`'dynamic'` chuẩn Spatie v7):

```typescript
// 1. Toán tử tĩnh (cố định ở backend):
AllowedFilter.operator("minPrice", ">=", "price");
AllowedFilter.operator("maxPrice", "<=", "price");

// 2. Toán tử động (client tự truyền toán tử trước giá trị):
AllowedFilter.operator("price", "dynamic");
```

- **Tĩnh**: `GET /products?filter[minPrice]=100&filter[maxPrice]=500` ➔ `WHERE price >= 100 AND price <= 500`
- **Động**: `GET /products?filter[price]=>=100,<=500` ➔ `WHERE price >= 100 AND price <= 500`

### Nhóm bộ lọc OR / AND (`groupOr`, `groupAnd`)

Gom nhiều bộ lọc dưới một tham số URL duy nhất (chuẩn Spatie v7), rất tiện lợi để thay thế cho việc tự viết callback search lặp lại:

```typescript
// Tìm kiếm khớp email HOẶC username HOẶC fullName:
AllowedFilter.groupOr("q", [
  AllowedFilter.partial("email"),
  AllowedFilter.partial("username"),
  AllowedFilter.partial("fullName"),
]);

// Hoặc kết hợp bằng AND:
AllowedFilter.groupAnd("match", [
  AllowedFilter.partial("firstName"),
  AllowedFilter.partial("lastName"),
]);
```

- `GET /users?filter[q]=john` ➔ `WHERE ((user.email ILIKE '%john%') OR (user.username ILIKE '%john%') OR (user.fullName ILIKE '%john%'))`

### Lọc trên quan hệ (`roles.name`)

```typescript
AllowedFilter.exact("roleName", "roles.name");
```

- `GET /users?filter[roleName]=admin` ➔ `WHERE roles.name = 'admin'`

### Xóa mềm (`trashed`)

Dành cho các entity có sử dụng `@DeleteDateColumn()` của TypeORM:

```typescript
AllowedFilter.trashed(); // mặc định tên param 'trashed' và cột 'deletedAt'
```

- `GET /users?filter[trashed]=with` ➔ bao gồm cả bản ghi đã xóa tạm (`withDeleted()`)
- `GET /users?filter[trashed]=only` ➔ chỉ lấy bản ghi đã xóa tạm (`withDeleted()` và `deletedAt IS NOT NULL`)
- `GET /users?filter[trashed]=without` ➔ loại trừ các bản ghi đã xóa (mặc định)

### Custom Filters (`AllowedFilter.custom`)

Hỗ trợ cả hàm closure lẫn class triển khai `FilterInterface`:

#### 1. Dùng hàm Closure

```typescript
AllowedFilter.custom("search", (qb, value, alias) => {
  qb.andWhere(`(${alias}.name ILIKE :s OR ${alias}.email ILIKE :s)`, {
    s: `%${value}%`,
  });
});
```

#### 2. Dùng Class độc lập

```typescript
import { FilterInterface } from "./common/query-builder";
import { SelectQueryBuilder } from "typeorm";

export class FuzzySearchFilter implements FilterInterface {
  apply(qb: SelectQueryBuilder<any>, value: any, alias: string) {
    qb.andWhere(`(${alias}.name ILIKE :s OR ${alias}.email ILIKE :s)`, {
      s: `%${value}%`,
    });
  }
}

AllowedFilter.custom("search", new FuzzySearchFilter());
```

> [!TIP]
> Bạn cũng có thể dùng `AllowedFilter.callback("search", callback)` (chuẩn Spatie Laravel QueryBuilder) hoặc `AllowedFilter.scope("search", callback)` kèm các hàm nối chuỗi `.default()`, `.ignore()`, `.nullable()`:
>
> ```typescript
> AllowedFilter.callback("search", (qb, val, alias, property) => {
>   const keyword = `%${String(val).trim()}%`;
>   qb.andWhere(
>     `(${alias}.name ILIKE :kw OR EXISTS (SELECT 1 FROM tag_aliases ta WHERE ta.tag_id = ${alias}.id AND ta.alias_name ILIKE :kw))`,
>     { kw: keyword },
>   );
> }).ignore("all", ""),
>
> AllowedFilter.exact("status").default("active"),
> AllowedFilter.exact("mergedIntoId").nullable(),
> ```

---

## Sắp xếp (`allowedSorts`)

### Sắp xếp theo cột & Hướng

```typescript
.allowedSorts(['name', 'createdAt'])
```

- **Tăng dần (ASC)**: `GET /users?sort=name` ➔ `ORDER BY user.name ASC`
- **Giảm dần (DESC với dấu `-`)**: `GET /users?sort=-createdAt` ➔ `ORDER BY user.createdAt DESC`
- **Nhiều cột phân tách bằng dấu phẩy**: `GET /users?sort=-createdAt,name` ➔ `ORDER BY user.createdAt DESC, user.name ASC`

### Sắp xếp theo quan hệ

```typescript
AllowedSort.field("role", "roles.name");
```

- `GET /users?sort=-role` ➔ `ORDER BY roles.name DESC`

### Custom Sorts (`AllowedSort.custom`)

Hỗ trợ cả closure lẫn class triển khai `SortInterface`:

```typescript
// Closure:
AllowedSort.custom("popularity", (qb, direction, alias) => {
  qb.addOrderBy(`${alias}.viewCount + ${alias}.likeCount`, direction);
});

// Class-based (Spatie style):
class PopularitySort implements SortInterface {
  apply(qb: SelectQueryBuilder<any>, direction: "ASC" | "DESC", alias: string) {
    qb.addOrderBy(`${alias}.viewCount + ${alias}.likeCount`, direction);
  }
}
AllowedSort.custom("popularity", new PopularitySort());
```

### Sắp xếp mặc định (`defaultSort`)

Được áp dụng khi client không truyền tham số `sort` trên URL:

```typescript
.defaultSort('-createdAt,name')
```

---

## Nạp quan hệ (`allowedIncludes`)

### Quan hệ trực tiếp

```typescript
.allowedIncludes(['roles', 'profile'])
```

- `GET /users?include=roles,profile` ➔ tự động thực hiện `leftJoinAndSelect` cho `user.roles` và `user.profile`.

### Quan hệ lồng nhau (`posts.comments`)

```typescript
.allowedIncludes(['posts.comments'])
```

- `GET /users?include=posts.comments` ➔ tự động join tầng 1 (`user.posts`) sau đó join tầng 2 (`posts.comments`).

### Đếm số lượng quan hệ (`count`)

```typescript
AllowedInclude.count("comments");
```

- `GET /users?include=comments` ➔ nạp số lượng bản ghi quan hệ vào thuộc tính `entity.commentsCount` qua `loadRelationCountAndMap`.

### Custom Includes (`AllowedInclude.custom`)

Hỗ trợ cả closure lẫn class triển khai `IncludeInterface`:

```typescript
// Closure:
AllowedInclude.custom("activeRoles", (qb, alias) => {
  qb.leftJoinAndSelect(`${alias}.roles`, "role", "role.isActive = true");
});

// Class-based (Spatie style):
class ActiveRolesInclude implements IncludeInterface {
  apply(qb: SelectQueryBuilder<any>, alias: string) {
    qb.leftJoinAndSelect(`${alias}.roles`, "role", "role.isActive = true");
  }
}
AllowedInclude.custom("activeRoles", new ActiveRolesInclude());
```

---

## Chỉ định trường cần lấy (`allowedFields`)

Giới hạn danh sách các cột cần truy vấn để tối ưu hiệu năng:

```typescript
.allowedFields(['id', 'name', 'email', 'roles.id', 'roles.title'])
```

Hỗ trợ 2 định dạng:

1. **Dạng phẳng**: `GET /users?fields=id,name,email`
2. **Dạng chuẩn JSON:API**: `GET /users?fields[user]=id,name&fields[roles]=id,title`

---

## Phân trang (`paginate`)

Phân trang theo offset tuân thủ chuẩn **`nestjs-paginate`** (`{ data, meta, links }`), đảm bảo tương thích 100% với frontend React Table (`apps/web`) và Zod validation schemas (`apiMetaSchema` & `apiLinksSchema`):

```typescript
const result = await QueryBuilder.for(this.userRepo, query)
  .allowedSorts(["createdAt", "name"])
  .setLimit(20, 100) // (defaultLimit, maxLimit)
  .paginate({ path: "/api/v1/users" });
```

Cấu trúc JSON trả về:

```json
{
  "data": [...],
  "meta": {
    "itemsPerPage": 20,
    "totalItems": 105,
    "currentPage": 1,
    "totalPages": 6,
    "sortBy": [["createdAt", "DESC"]],
    "search": "john",
    "filter": { "status": "active" }
  },
  "links": {
    "first": "/api/v1/users?page=1&limit=20&sort=-createdAt",
    "previous": null,
    "current": "/api/v1/users?page=1&limit=20&sort=-createdAt",
    "next": "/api/v1/users?page=2&limit=20&sort=-createdAt",
    "last": "/api/v1/users?page=6&limit=20&sort=-createdAt"
  }
}
```

> [!NOTE]
> Nhằm duy trì tính tương thích ngược với các code consumer trước đây, thuộc tính `result.pagination` vẫn được hỗ trợ dưới dạng getter gồm `limit`, `currentPage`, `totalRecords`, `totalPages`, `nextPage`, và `previousPage`.

---

## Cấu hình toàn cục & Tùy biến tham số URL

Bạn có thể cấu hình tên tham số toàn cục trong file `main.ts`:

```typescript
import { QueryBuilder } from "./common/query-builder";

QueryBuilder.configure({
  parameters: {
    filter: "filters", // ví dụ: ?filters[name]=john
    sort: "order", // ví dụ: ?order=-createdAt
    limit: "per_page", // ví dụ: ?per_page=25
    page: "page",
    include: "with", // ví dụ: ?with=roles
    fields: "fields",
  },
  countSuffix: "Count", // hoặc '_count' cho snake_case
  defaultLimit: 20,
  maxLimit: 100,
  maxPage: 10_000, // giới hạn số trang tối đa chống DoS OFFSET
  arrayDelimiter: ",", // ký tự phân tách mảng (mặc định ',' chuẩn Spatie)
  filterValueSplittingEnabled: true, // bật/tắt tách mảng toàn cục
  pathResolver: () =>
    ClsServiceManager.getClsService()?.get(CLS_REQUEST_URL_KEY), // tự động sinh full URL cho links.next/previous (như Laravel Paginator)
  strictMode: false,
});
```

---

## Chế độ nghiêm ngặt & Xử lý lỗi (`Strict Mode`)

Mặc định (`strictMode: false`), hệ thống sẽ **âm thầm bỏ qua** các tham số không nằm trong whitelist để bảo đảm an toàn.

Nếu bật chế độ nghiêm ngặt, hệ thống sẽ ném ngoại lệ `400 Bad Request` rõ ràng:

```typescript
// Cấu hình toàn cục:
QueryBuilder.configure({ strictMode: true });

// Hoặc cấu hình riêng cho từng query:
QueryBuilder.for(this.userRepo, query)
  .allowedFilters(["name", "status"])
  .strict(true)
  .paginate();
```

Khi client truyền tham số không hợp lệ:

- `GET /users?filter[unknownCol]=1` ➔ Lỗi HTTP 400:
  ```json
  {
    "statusCode": 400,
    "message": "Requested filter(s) ['unknownCol'] are not allowed. Allowed filter(s) are: ['name', 'status']."
  }
  ```

---

## Tích hợp Swagger OpenAPI (`@ApiQueryBuilderDocs`)

Bạn có thể tạo tài liệu tự động cho Swagger UI cực kỳ tiện lợi:

### Cách 1: Sử dụng Decorator độc lập

```typescript
import { Controller, Get, Query } from "@nestjs/common";
import {
  ApiQueryBuilderDocs,
  AllowedFilter,
  QueryParams,
} from "../common/query-builder";
import { UserDto } from "./dto/user.dto";

@Controller("users")
export class UserController {
  @Get()
  @ApiQueryBuilderDocs({
    entity: UserDto,
    filters: ["name", AllowedFilter.exact("status"), AllowedFilter.trashed()],
    sorts: ["createdAt", "name"],
    defaultSort: "-createdAt",
    includes: ["roles", "profile"],
    fields: ["id", "name", "email"],
    defaultLimit: 20,
    maxLimit: 100,
  })
  findAll(@Query() query: QueryParams) {
    return this.userService.findAll(query);
  }
}
```

### Cách 2: Tích hợp trực tiếp vào `@ApiPublic` / `@ApiAuth`

```typescript
import { ApiAuth } from '../decorators/http.decorators';

@Get()
@ApiAuth({
  type: UserDto,
  isQueryBuilder: true,
  summary: 'Danh sách người dùng kèm lọc và phân trang',
  queryBuilderOptions: {
    filters: ['name', AllowedFilter.exact('status')],
    sorts: ['createdAt', 'name'],
    includes: ['roles'],
  },
})
findAll(@Query() query: QueryParams) {
  return this.userService.findAll(query);
}
```

---

## Bảo mật

1. **Chống SQL Injection & LIKE Wildcard Injection**: Tất cả giá trị filter đều truyền qua TypeORM parameter binding (`:paramName`). Các bộ lọc `partial`, `startsWith`, `endsWith` tự động escape các ký tự wildcard `%`, `_`, `\`.
2. **Chống Prototype Pollution**: Tự động chặn các khóa nguy hiểm (`__proto__`, `constructor`, `prototype`) khi parse bracket notation trên URL.
3. **Làm sạch giá trị đầu vào (Input Sanitization)**: Tự động loại bỏ mảng rỗng (vd `?filter[id]=,,,`) và object lồng nhau (vd `?filter[id][a]=1`) để tránh lỗi SQL 500 (`IN ()`).
4. **Whitelist bắt buộc**: Client không thể tự ý chèn bất kỳ cột nào ngoài danh sách khai báo tại `allowedFilters`, `allowedSorts`, `allowedIncludes`, `allowedFields`.
5. **Chống DoS & URL Injection**:
   - Luôn ép kiểu nguyên dương và giới hạn bằng `maxLimit` (mặc định `100`) và `maxPage` (mặc định `10,000`).
   - Không tin tưởng tham số `path` từ query string của client khi tạo pagination `links`, và tự động URL-encode các ký tự đặc biệt (`&`, `#`, `=`) trong giá trị filter.

---

## Query Builder ở Frontend (`@repo/query-builder`)

Monorepo cung cấp sẵn package dùng chung [`@repo/query-builder`](file:///packages/query-builder) (có thể import qua `@/lib/query-builder` hoặc `@repo/query-builder` trong cả `apps/web` và `apps/client`).

### 1. `RestQueryBuilder` (Khuyên dùng khi gọi NestJS Backend)

`RestQueryBuilder` tạo ra chuỗi query string chuẩn REST / JSON:API khớp trực tiếp với QueryBuilder của NestJS backend:

```typescript
import { RestQueryBuilder } from "@repo/query-builder";
// hoặc: import { RestQueryBuilder } from "@/lib/query-builder";

const queryString = new RestQueryBuilder()
  .filter("status", "ACTIVE")
  .filter("roles", ["ADMIN", "MANAGER"])
  .sortBy("createdAt", "desc")
  .sortBy("name", "asc")
  .include("profile", "roles")
  .fieldsFor("user", ["id", "name", "email"])
  .search("john")
  .paginate(1, 20)
  .toQueryString();

// Chuỗi query sinh ra:
// filter[status]=ACTIVE&filter[roles]=ADMIN,MANAGER&sort=-createdAt,name&include=profile,roles&fields[user]=id,name,email&q=john&page=1&limit=20
```

### 2. `NestjsPaginateQueryBuilder` (Dành cho API cũ dùng `nestjs-paginate`)

Dành cho các endpoint backend vẫn đang dùng package thư viện `nestjs-paginate`:

```typescript
import { PaginateQueryBuilder } from "@repo/query-builder";

const queryString = new PaginateQueryBuilder()
  .page(1)
  .limit(20)
  .sortBy("createdAt", "DESC")
  .eq("status", "ACTIVE")
  .in("role", ["ADMIN", "USER"])
  .btw("age", [18, 65])
  .search("john")
  .searchBy(["email", "name"])
  .toQueryString();

// Chuỗi query sinh ra:
// page=1&limit=20&sort=createdAt:DESC&filter.status=$eq:ACTIVE&filter.role=$in:ADMIN,USER&filter.age=$btw:18,65&search=john&searchBy=email&searchBy=name
```

### 3. Query Contracts dùng chung (`ResourceQueryContract`)

Nhằm kết nối whitelist của backend với định nghĩa filter/sort ở frontend một cách an toàn và tránh sai lệch kiểu dữ liệu, `@repo/query-builder` xuất bản các helper hợp đồng:

```typescript
import {
  defineQueryContract,
  isAllowedSort,
  isAllowedFilter,
  type ResourceQueryContract,
} from "@repo/query-builder";

export const userQueryContract = defineQueryContract<UserDto>({
  allowedSorts: ["name", "email", "createdAt"],
  allowedFilters: ["name", "email", { name: "status", operator: "eq" }],
  allowedIncludes: ["roles", "profile"],
  defaultSort: "-createdAt",
  defaultLimit: 20,
  maxLimit: 100,
});
```

### 4. Hook Bảng Cao Cấp (`useResourceTable` & `useRestResourceTable`)

`apps/web` cung cấp các hook pipeline khép kín kết nối trực tiếp Query Builder với TanStack Table:

- **`useResourceTable`**: Kết nối `PaginateQueryBuilder` + `PaginateQueryParams` với TanStack Table.
- **`useRestResourceTable`**: Kết nối `RestQueryBuilder` + `RestQueryParams` với TanStack Table.

```typescript
import { useRestResourceTable } from "@/hooks/use-rest-resource-table";

const { table, isFetching } = useRestResourceTable({
  columns,
  allowedSorts: ["name", "createdAt"],
  queryHook: useUsersQuery,
  buildQuery: (builder, filter) => {
    builder.filterIlike("name", filter.name).include("roles");
  },
  getRowId: (row) => row.id,
});
```
