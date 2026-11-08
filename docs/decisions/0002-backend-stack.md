# ADR 0002 — Backend: .NET 10 LTS, ASP.NET Core, EF Core, SQL Server

- **Trạng thái:** Accepted — chủ dự án duyệt ngày 2026-11-08 và xác nhận dùng SQL Server.
- **Ngày:** 2026-11-08.
- **Liên quan:** [ADR 0001](0001-system-architecture-and-repo-layout.md), [PRD §5 NFR](../product/prd.md).

## Bối cảnh

`AGENTS.md` yêu cầu dùng .NET 10 LTS, ASP.NET Core Web API, SQL Server và EF Core migrations, sau khi xác minh phiên bản ổn định tại thời điểm triển khai. Đồng thời không dùng EF Core InMemory thay cho integration test cần kiểm chứng SQL Server thật.

## Xác minh phiên bản (2026-11-08)

| Thành phần | Phiên bản | Bằng chứng |
| --- | --- | --- |
| .NET | **10.0** LTS, bản vá mới nhất 10.0.14; hỗ trợ tới 2028-11-14. Ngoài ra: .NET 8 LTS và .NET 9 STS hết hỗ trợ 2026-11-10; .NET 11 đang ở RC (STS) | Trang chính sách hỗ trợ .NET của Microsoft, cập nhật 2026-10-25 |
| EF Core SQL Server provider | `Microsoft.EntityFrameworkCore.SqlServer` 10.0.14 | NuGet, bản ổn định mới nhất |
| ASP.NET Core Identity | `Microsoft.AspNetCore.Identity.EntityFrameworkCore` 10.0.14 | NuGet |
| SQL Server | **2025** (17.x), GA 2025-11-18; mainstream tới 2031-01-06, extended tới 2036-01-06 | Trang vòng đời SQL Server 2025 của Microsoft |
| Testcontainers | `Testcontainers.MsSql` 4.16.0 | NuGet |

Phiên bản cụ thể được pin trong `Directory.Packages.props` khi dựng khung, và cập nhật bản vá theo lịch hằng tháng.

## Quyết định

- **Runtime:** .NET 10 LTS, ghim SDK bằng `global.json` với `rollForward: latestPatch`. Không chuyển lên .NET 11 (STS) khi chưa có lý do.
- **Web API:** ASP.NET Core **Minimal APIs**, gom endpoint theo module bằng `MapGroup`.
  - OpenAPI dùng `Microsoft.AspNetCore.OpenApi` có sẵn.
  - Validation phía server dùng cơ chế validation tích hợp cho Minimal APIs của .NET 10; chỉ thêm thư viện ngoài nếu không đủ.
  - Lỗi trả về theo định dạng chuẩn `ProblemDetails` (RFC 9457), có mã `ERR-` riêng của Lingozi trong trường mở rộng.
- **Dữ liệu:**
  - EF Core 10 với SQL Server.
  - Mỗi module một `DbContext` và một schema (ADR 0001).
  - Timestamp lưu dạng `datetime2` theo UTC.
  - Kiểm soát ghi đồng thời bằng optimistic concurrency, dùng `rowversion` cho bảng người dùng hay sửa.
  - Migration được review trong PR. Migration có thể làm mất dữ liệu phải được chủ dự án xác nhận trước.
- **Database theo môi trường:**
  - Local và CI: container `mcr.microsoft.com/mssql/server:2025-latest`. Registry này truy cập được từ phiên cloud.
  - Production: SQL Server 2025 cài trên máy chủ riêng của chủ dự án (ADR 0006). Edition chọn theo mục "Còn phải chốt" của ADR 0006.
- **Kiểm thử:**
  - xUnit cho unit test.
  - Integration test dùng `WebApplicationFactory` cộng Testcontainers SQL Server thật. Không dùng EF Core InMemory.
  - Test kiến trúc kiểm tra ranh giới module.
- **Logging:** dùng `ILogger` có sẵn với log có cấu trúc. Không ghi mật khẩu, token hay nội dung thư viện của người dùng vào log. Có health check `/health`.
- **Bảo mật:**
  - Rate limiting bằng middleware có sẵn của ASP.NET Core.
  - Bắt buộc HTTPS, bật HSTS ở production.
  - Secret đọc từ biến môi trường hoặc secret store, không để trong `appsettings.*.json`.

## Phương án bị loại

- **Controllers MVC:** vẫn hợp lệ nhưng phải viết nhiều code khung hơn cho API nhỏ. Có thể chuyển nếu sau này cần.
- **EF Core InMemory/SQLite cho test:** vi phạm `AGENTS.md` §7, vì không phản ánh hành vi thật của SQL Server (collation, index, concurrency).
- **Dapper thay EF Core:** đi ngược định hướng đã duyệt. Chỉ xem xét cho truy vấn tìm kiếm nặng, nếu đo được là cần.

## Hệ quả

- Cần Docker trên máy dev và CI để chạy integration test. GitHub Actions có sẵn Docker trên runner Ubuntu.
- Phiên cloud hiện tại không tải được .NET SDK (host `dot.net` và `builds.dotnet.microsoft.com` bị chặn) và không có Docker daemon. Muốn dựng khung tại đây phải mở các host đó hoặc dựng trên máy local.

## Ghi nhận khi dựng walking skeleton (2026-11-08)

- .NET SDK 10.0.114 (runtime 10.0.14) cài từ kho Ubuntu 24.04. `global.json` cho phép mọi SDK 10.0.x (`rollForward: latestFeature`).
- `dotnet test` dùng **Microsoft.Testing.Platform** (`global.json` → `test.runner`), vì .NET 10 SDK không còn hỗ trợ VSTest cho xUnit v3. Test dùng xUnit v3 4.0.2 và Testcontainers.MsSql 4.16.0.
- `Microsoft.Data.SqlClient` 6.1.7 (kéo theo từ EF Core 10.0.14) phụ thuộc `System.Security.Cryptography.Pkcs` 9.0.11, có lỗ hổng GHSA-846f-f764-76mx (high) và GHSA-2fmv-rv2c-59x7 (moderate). Đã ghim gói này lên **10.0.14** bằng `CentralPackageTransitivePinningEnabled`. Build bật `-warnaserror`, nên lỗ hổng mới trong NuGet audit sẽ làm build fail.
- Migration đầu tiên: `InitialDataProtectionKeys` (schema `accounts`). Factory dùng lúc thiết kế (`AccountsDbContextDesignTimeFactory`) giúp lệnh `dotnet ef` không cần biến môi trường và không mở kết nối.
- Phiên cloud: đã cài .NET SDK và chạy được Docker (môi trường "Lingozi"). Mục Hệ quả ở trên về host bị chặn không còn là vướng mắc.
