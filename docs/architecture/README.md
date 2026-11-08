# Kiến trúc

Lưu kiến trúc hệ thống, mô hình dữ liệu, API dùng chung, cấu hình môi trường và phương án triển khai.

## Định hướng do người dùng cung cấp ngày 2026-10-26

- Frontend: Next.js App Router, React, TypeScript strict mode; UI hỗ trợ tiếng Việt và tiếng Anh.
- Backend: ASP.NET Core Web API trên .NET 10 LTS, cần xác minh phiên bản ổn định và tương thích ở thời điểm triển khai.
- Dữ liệu: SQL Server và EF Core migrations; thiết kế ERD trước migration.
- Cấu trúc backend: ưu tiên Modular Monolith; microservices cần lý do và xác nhận riêng.
- Kết nối: frontend gọi HTTP API, SignalR khi cần; không truy cập database trực tiếp.

Nguồn định hướng: quy tắc người dùng cung cấp, đã ghi tại `AGENTS.md`. Đây chưa phải bằng chứng toolchain được cài, ứng dụng đã chạy hoặc thiết kế chi tiết được nghiệm thu.

## Quyết định đã duyệt (2026-11-08)

Chi tiết và phiên bản đã xác minh nằm trong [ADR 0001–0006](../decisions/README.md), trạng thái Accepted. Tóm tắt:

- Trình duyệt → Next.js (`apps/web`) → rewrite `/api/*` → ASP.NET Core Minimal APIs (`apps/api`) → SQL Server.
- Bốn module `Accounts`, `Library`, `Practice`, `Personalization`; mỗi module một schema và một `DbContext`.
- Đăng nhập bằng ASP.NET Core Identity, cookie HttpOnly cùng site, có Google.
- Hosting trên máy chủ riêng của chủ dự án: Docker Compose, reverse proxy HTTPS, SQL Server 2025.

## Tài liệu

- [ERD tổng thể](erd.md): Draft, gồm 4 schema, từ điển dữ liệu cho MVP và phác thảo cho Vòng 4–5.

## Cần làm rõ trước khi triển khai

Duyệt ERD; thông tin máy chủ `HOST-01`–`HOST-05`; nhà cung cấp email production; xác minh TypeScript 7 với Next.js 16 khi dựng khung. Ghi quyết định cùng lý do/đánh đổi trong `docs/decisions/`; không tự đổi định hướng đã được cung cấp. Không khởi tạo backend hoặc database chỉ để cập nhật tài liệu quy trình.
