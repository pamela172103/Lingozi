# Phiên 2026-11-08 · 10 · Thêm đăng nhập Facebook

- Ngày / múi giờ: 2026-11-08, UTC.
- Mục tiêu do người dùng yêu cầu: thêm đăng nhập bằng Facebook.
- Nhánh và commit nền đã kiểm tra: `claude/friendly-brahmagupta-yzqxik` tại `730b87d`.
- Status: PASS (chỉ tài liệu; FEAT-01 chưa được code).

## Kết quả và file liên quan

- ADR 0004: thêm mục "Bổ sung: Facebook Login", gồm:
  - Gói `Microsoft.AspNetCore.Authentication.Facebook` 10.0.14.
  - Chỉ xin quyền `public_profile` và `email`.
  - Quy tắc email: không coi là đã xác minh, bắt xác thực, không tự liên kết.
  - Yêu cầu của Meta: App, chính sách quyền riêng tư, cách xóa dữ liệu, chế độ Live.
  - Credential, nút đăng nhập theo hướng dẫn thương hiệu, test dùng handler giả.
- Cập nhật cho khớp:
  - PRD 0.2.0: thêm `ACT-SYS-03`, FEAT-01, giả định, phụ thuộc.
  - `mvp-scope.md`, `roadmap.md` (dòng FEAT-01).
  - Brainstorm: quyết định 12; `Q-04` đã chốt; thêm `Q-12` về xóa dữ liệu.
  - ERD: chú thích; không đổi schema.
  - Design system: thêm `SocialSignInButton`.
  - Sơ đồ ADR 0001, mục lục ADR.
  - STATUS: thêm `FB-01` và danh sách credential.

## Quyết định và giả định

- **Chủ dự án quyết định:** thêm Facebook vào FEAT-01 (MVP, Vòng 1).
- **Đề xuất, chưa duyệt:**
  - Email từ Facebook không được coi là đã xác minh.
  - Không tự liên kết khi email trùng.
  - Phương án mặc định của `Q-12` (trang hướng dẫn và xử lý yêu cầu xóa bằng tay trong 30 ngày).
- **Giả định:** yêu cầu App Review hay xác minh doanh nghiệp của Meta được kiểm tra lúc đăng ký app, không xác định trước.

## Kiểm tra

- Phiên bản gói Facebook 10.0.14 trên NuGet.
- Kiểm tra liên kết trong `docs/`.
- Không có thay đổi code nên không chạy build/test.

## Database/API/UI

- **Database:** không đổi schema; `accounts.UserLogins` đã hỗ trợ nhiều nhà cung cấp.
- **API và UI:** thiết kế ở Vòng 1.

## Security checks

- Phòng chiếm tài khoản: không tự liên kết theo email chưa xác minh.
- Chỉ xin quyền tối thiểu.
- Credential chỉ lưu trong secret store.

## Việc còn lại và vướng mắc

- `FB-01`: chủ dự án tạo Meta App, chuẩn bị URL chính sách quyền riêng tư, chốt `Q-12`.

## Bàn giao

- Việc tiếp theo: duyệt PRD/MVP và design system; trả lời `Q-01`, `Q-02`, `Q-11`, `Q-12`; bắt đầu thiết kế Vòng 1.
- Trạng thái lưu Git: đi cùng commit phiên này.
- Trạng thái đồng bộ: push lên `claude/friendly-brahmagupta-yzqxik`.
