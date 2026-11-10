# API Lingozi

ASP.NET Core Minimal APIs trên .NET 10 LTS (runtime 10.0.14), EF Core 10.0.14, SQL Server 2025 ([ADR 0002](../../docs/decisions/0002-backend-stack.md)). Modular Monolith theo [ADR 0001](../../docs/decisions/0001-system-architecture-and-repo-layout.md).

| Đường dẫn | Nội dung |
| --- | --- |
| `src/Lingozi.Api/` | Host: cấu hình, health check, OpenAPI (`/openapi/v1.json` ở Development), endpoint |
| `src/Modules/Accounts/Lingozi.Accounts/` | Module Accounts, schema `accounts`: `DataProtectionKeys`, `EmailLoginCodes`, `EmailOutbox` (US-AUTH-01) |
| `tests/Lingozi.Api.IntegrationTests/` | Integration test với SQL Server 2025 thật qua Testcontainers |

| Endpoint | Mục đích |
| --- | --- |
| `GET /health/live` | API đang chạy |
| `GET /health/ready` | API và database sẵn sàng |
| `GET /api/system/status` | Trạng thái API, database, số migration chưa áp dụng (trang kiểm tra của walking skeleton) |
| `GET /api/auth/antiforgery` | Cấp token antiforgery (cookie `XSRF-TOKEN`) |
| `POST /api/auth/email-code/request` | Gửi mã đăng nhập 6 số tới email (US-AUTH-01) |

- Cấu hình: `ConnectionStrings__Lingozi` và `Auth__LoginCodeHmacKey` (base64, ≥ 32 byte) là bắt buộc; `Auth__RequestCodePerIpPer10Minutes` (mặc định 10); `Email__SmtpHost/SmtpPort/SmtpUseTls/SmtpUsername/SmtpPassword/FromAddress` (không có `SmtpHost` thì thư ở lại trạng thái Pending); `Proxy__TrustedProxies__0…` (địa chỉ reverse proxy được tin khi đọc `X-Forwarded-For`; mặc định chỉ loopback); `Database__ApplyMigrationsOnStartup` (mặc định `false`, Development là `true`).
- Phiên bản gói được quản lý tập trung trong `Directory.Packages.props`, có ghim phụ thuộc gián tiếp để vá lỗ hổng.
- Lệnh chạy và kiểm tra: xem [hướng dẫn chạy local](../../docs/guides/local-development.md).
