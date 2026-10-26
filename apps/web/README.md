# Ứng dụng web Lingozi

Định hướng người dùng đã cung cấp: Next.js App Router, React và TypeScript strict mode; hỗ trợ UI tiếng Việt và tiếng Anh. Frontend gọi ASP.NET Core Web API qua HTTP, dùng SignalR khi có nhu cầu, không kết nối SQL Server trực tiếp.

Hiện chưa có ứng dụng, dependencies hoặc lệnh chạy/build/test. Trước khi khởi tạo: làm rõ MVP, xác minh phiên bản ổn định và tương thích, ghi thiết kế tại `docs/architecture/` và quyết định chi tiết tại `docs/decisions/`. Không tự thay đổi stack đã định hướng khi chưa được xác nhận.

Sau khi khởi tạo, cập nhật README này với phiên bản runtime, cách cài theo lockfile, biến môi trường, lệnh chạy và kiểm thử đã được xác minh. Unit/integration tests đặt theo quy ước stack. Kiểm tra loading, empty, error, success, disabled, responsive và accessibility; UI tĩnh chưa chứng minh chức năng nghiệp vụ hoạt động.
