# ADR 0001 — Kiến trúc tổng thể và cấu trúc repository

- **Trạng thái:** Accepted — chủ dự án duyệt ngày 2026-11-08.
- **Ngày:** 2026-11-08.
- **Liên quan:** [PRD](../product/prd.md), [lộ trình](../product/roadmap.md), `AGENTS.md` §7.

## Bối cảnh

Chủ dự án đã chọn sẵn định hướng (`AGENTS.md`, 2026-10-26): frontend Next.js gọi backend ASP.NET Core qua HTTP; SQL Server; ưu tiên Modular Monolith. Mỗi vòng Agile chỉ dài 2 tuần, nên cấu trúc ban đầu phải đủ gọn để dựng nhanh, nhưng vẫn giữ ranh giới giữa các phân hệ Library, Practice và Theme để mở rộng dần.

## Phương án

1. **Modular Monolith, một database, mỗi module một schema SQL**: một tiến trình API, các module tách thành project riêng.
2. Monolith không tách module: dựng nhanh nhất, nhưng ranh giới dễ bị phá khi thêm tính năng.
3. Microservices: không phù hợp với một sản phẩm cá nhân ở giai đoạn đầu; `AGENTS.md` yêu cầu phải có lý do được duyệt.

## Quyết định

Chọn **phương án 1**.

```text
Trình duyệt ──HTTPS──▶ Next.js (apps/web) ──/api/* rewrite──▶ ASP.NET Core API (apps/api) ──▶ SQL Server
                                                                     │
                                                                     ├─▶ Dịch vụ email (ADR 0005)
                                                                     └─▶ Google Identity (ADR 0004)
```

- Trình duyệt chỉ nói chuyện với một origin là web. Next.js chuyển tiếp (rewrite) `/api/*` sang API, để cookie đăng nhập là cookie cùng site (first-party) và không phải mở CORS (ADR 0004).
- Frontend không truy cập database.

**Các module backend:**

| Module | Phạm vi | Schema SQL | Tính năng |
| --- | --- | --- | --- |
| `Accounts` | Tài khoản, đăng nhập, phiên | `accounts` | FEAT-01 |
| `Library` | Mục kiến thức, bộ sưu tập, thẻ, tìm kiếm | `library` | FEAT-02–04 |
| `Practice` | Phiên luyện gõ, sau này là đặt câu AI | `practice` | FEAT-05, FEAT-06 |
| `Personalization` | Theme và tùy chỉnh theo tài khoản | `personalization` | FEAT-07, FEAT-08 |

**Quy tắc ranh giới:**

- Module không tham chiếu project của module khác. Khi cần dữ liệu của nhau, các module gọi qua interface công khai đặt trong `Contracts` của module đó.
- Chỉ liên kết dữ liệu qua `UserId`. Không tạo foreign key chéo schema, trừ khóa tới bảng user.
- Dùng **một `DbContext` cho mỗi module**, cùng chung một database. Mỗi module có bảng lịch sử migration riêng (`__EFMigrationsHistory` đặt trong schema của module).

**Cấu trúc thư mục:**

```text
apps/
  web/                         Next.js (ADR 0003)
  api/
    Lingozi.slnx
    src/
      Lingozi.Api/             Host: cấu hình, auth, OpenAPI, endpoint mapping
      Lingozi.SharedKernel/    Kiểu dùng chung tối thiểu (Result, lỗi, clock)
      Modules/
        Accounts/  Library/  Practice/  Personalization/
          Lingozi.<Module>/            Domain + application + persistence + endpoints
          Lingozi.<Module>.Contracts/  Interface/DTO công khai cho module khác
    tests/
      Lingozi.<Module>.Tests/          Unit + integration (SQL Server thật)
      Lingozi.Architecture.Tests/      Kiểm tra ranh giới module
tests/e2e/                     Playwright (ADR 0003)
compose.yaml                   SQL Server + Mailpit cho môi trường local
```

Mỗi module là **một project** chứa đủ domain, application, persistence và endpoint, chia theo thư mục. Không tách thành 4 project theo layer, vì với quy mô hiện tại việc đó không đem lại giá trị (`AGENTS.md` §7: tránh abstraction thừa). Sẽ tách khi một module phát triển đủ lớn.

## Hệ quả

- Ranh giới module được kiểm tra bằng test kiến trúc trong CI, không chỉ dựa vào quy ước.
- Có thể tách một module thành service riêng sau này, vì dữ liệu đã nằm theo schema.
- Chạy local cần Docker để có SQL Server. Riêng phiên làm việc cloud hiện tại chưa có Docker daemon và .NET SDK, nên chưa dựng được khung ứng dụng end-to-end trong môi trường này (xem [STATUS](../project/STATUS.md)).
