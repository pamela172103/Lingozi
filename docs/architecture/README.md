# Kiến trúc

Lưu kiến trúc hệ thống, mô hình dữ liệu, API dùng chung, cấu hình môi trường và phương án triển khai.

## Định hướng do người dùng cung cấp ngày 2026-10-26

- Frontend: Next.js App Router, React, TypeScript strict mode; UI hỗ trợ tiếng Việt và tiếng Anh.
- Backend: ASP.NET Core Web API trên .NET 10 LTS, cần xác minh phiên bản ổn định và tương thích ở thời điểm triển khai.
- Dữ liệu: SQL Server và EF Core migrations; thiết kế ERD trước migration.
- Cấu trúc backend: ưu tiên Modular Monolith; microservices cần lý do và xác nhận riêng.
- Kết nối: frontend gọi HTTP API, SignalR khi cần; không truy cập database trực tiếp.

Nguồn định hướng: quy tắc người dùng cung cấp, đã ghi tại `AGENTS.md`. Đây chưa phải bằng chứng toolchain được cài, ứng dụng đã chạy hoặc thiết kế chi tiết được nghiệm thu.

## Cần làm rõ trước khi triển khai

Phạm vi MVP, phiên bản frontend/EF Core/SQL Server và cấu hình tương thích, phương án xác thực, lưu trữ và hạ tầng triển khai. Ghi quyết định cùng lý do/đánh đổi trong `docs/decisions/`; không tự đổi định hướng đã được cung cấp. Không khởi tạo backend hoặc database chỉ để cập nhật tài liệu quy trình.
