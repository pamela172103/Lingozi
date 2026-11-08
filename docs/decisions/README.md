# Quyết định kỹ thuật (ADR)

Mỗi quyết định quan trọng dùng file `NNNN-short-title.md`, ví dụ `0001-web-framework.md` sau khi thực sự lựa chọn công nghệ.

Nội dung gồm: trạng thái, ngày, bối cảnh, các phương án, quyết định, lý do và hệ quả. Quyết định bị thay thế vẫn được giữ lại và liên kết tới bản thay thế. ## Danh sách

| ADR | Chủ đề | Trạng thái |
| --- | --- | --- |
| [0001](0001-system-architecture-and-repo-layout.md) | Kiến trúc tổng thể (Modular Monolith) và cấu trúc repository | Accepted 2026-11-08 |
| [0002](0002-backend-stack.md) | Backend: .NET 10 LTS, ASP.NET Core Minimal APIs, EF Core 10, SQL Server 2025 | Accepted 2026-11-08 |
| [0003](0003-frontend-stack.md) | Frontend: Next.js 16, React 19, TypeScript strict, Tailwind 4, next-intl | Accepted 2026-11-08 |
| [0004](0004-authentication.md) | Xác thực: ASP.NET Core Identity, cookie cùng site, Google, Facebook (bổ sung 2026-11-08) | Accepted 2026-11-08 |
| [0005](0005-email-delivery.md) | Gửi email giao dịch | Accepted 2026-11-08; nhà cung cấp production chưa chọn |
| [0006](0006-hosting-and-ci.md) | Hosting trên máy chủ riêng + SQL Server, môi trường, CI GitHub Actions | Accepted 2026-11-08; còn HOST-01–05 |

`Proposed` nghĩa là chờ chủ dự án duyệt; khi duyệt đổi thành `Accepted` kèm ngày.
