# Phiên 2026-10-26 · 03 · Quy tắc Codex và định hướng stack

- Ngày: 2026-10-26, múi giờ người dùng UTC+7.
- Mục tiêu: tích hợp bộ quy tắc Codex người dùng cung cấp vào repository.
- Nhánh / commit nền đã kiểm tra: `work` / `58bc041`.
- Status: PASS cho cập nhật tài liệu quy trình; không phải PASS của ứng dụng hoặc xác minh stack.

## Kết quả và files changed

- `AGENTS.md`: tích hợp vai trò, ngôn ngữ, quy trình trước thay đổi, chất lượng production, stack, bảo mật, kiểm thử, báo cáo và bàn giao; giữ hướng dẫn OpenBA và checkout hiện có.
- `README.md`, `apps/web/README.md`, `docs/architecture/README.md`: đồng bộ định hướng stack.
- `docs/project/STATUS.md`, `docs/project/session-template.md`, `docs/project/sessions/README.md` và nhật ký này: cập nhật trạng thái, mẫu báo cáo và lịch sử.

## Quyết định và giả định

- Người dùng định hướng Next.js App Router/React/TypeScript strict, ASP.NET Core Web API/.NET 10 LTS, SQL Server/EF Core; ưu tiên Modular Monolith. Chưa kiểm chứng phiên bản và tương thích trong môi trường này.
- Dùng `docs/project/STATUS.md` hiện có làm nguồn chính. `STATUS_STATUS.md` chỉ đọc bổ sung nếu tồn tại; không tạo bản trạng thái trùng lặp.
- Giữ số mục gốc của bộ quy tắc người dùng; bổ sung phần OpenBA riêng. Nhật ký cũ giữ nguyên như lịch sử bối cảnh tại thời điểm viết.

## Database/API/UI

Không áp dụng; không tạo ứng dụng, migrations, database hoặc tích hợp.

## Test evidence

- `git diff --check`: đạt.
- Kiểm tra liên kết Markdown cục bộ của tài liệu dự án bằng Python: đạt.
- Kiểm tra phạm vi thay đổi không chạm bộ OpenBA và các quy tắc tích hợp vẫn hiện diện: đạt.
- Build/test ứng dụng, phiên bản .NET/Next.js/SQL Server và luồng frontend → API → database: chưa kiểm chứng; không thuộc phạm vi cập nhật quy tắc.

## Security checks

Kiểm tra diff: thay đổi chỉ là tài liệu, không thêm giá trị credential, dữ liệu học viên hoặc cấu hình tắt bảo mật. Không thực hiện kiểm thử bảo mật ứng dụng vì chưa có ứng dụng.

## Còn tồn tại và bàn giao

- Thay đổi phiên này chưa commit, chưa push; chỉ có trên checkout hiện tại cho tới khi được lưu và đồng bộ.
- Checkpoint đề xuất: `docs(project): adopt Codex working rules and stack direction`.
- Tiếp theo: làm rõ người học và phạm vi MVP (PLAN-01/PLAN-02), sau đó xác minh phiên bản và thiết kế chi tiết theo định hướng đã ghi.
- Không có dịch vụ hoặc dependency ứng dụng cần khởi động lại.
