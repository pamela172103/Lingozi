# Phiên 2026-11-09 · 15 · Theme trên trang xác thực

- Ngày / múi giờ: 2026-11-09, UTC.
- Mục tiêu do người dùng yêu cầu: wireframe màn hình đăng nhập, đăng ký ban đầu chưa hiện theme; vẽ lại và commit.
- Nhánh và commit nền đã kiểm tra: `claude/friendly-brahmagupta-yzqxik` (trạng thái sạch trước khi sửa).
- Status: PASS (chỉ tài liệu). Thiết kế chờ duyệt; chưa code.

## Kết quả

- `docs/features/accounts/design/wireframes.md` v0.2:
  - Mục mới "Theme trên trang xác thực": quy tắc chọn theme và bảng token cho Mặc định và Coquette.
  - W-AUTH-01 (theme Mặc định) có bộ chọn theme.
  - W-AUTH-01b mới: đăng nhập theme Coquette.
  - W-AUTH-02 dùng cùng bố cục và bộ chọn theme.
- `docs/features/accounts/testing/test-cases.md`: thêm TC-AUTH-039 (E2E, hai theme, cookie `lz-theme`, axe).
- STATUS và mục lục phiên được cập nhật.

## Quyết định và giả định

- Đề xuất, chờ chủ dự án duyệt:
  - Khách chưa đăng nhập dùng theme Mặc định.
  - Bộ chọn theme nằm trên trang xác thực, lưu trong cookie `lz-theme` (không định danh).
  - Sau khi đăng nhập, theme lấy từ `UserPreferences`; tài khoản thắng cookie.
  - Bộ chọn trên trang xác thực không ghi vào tài khoản.
- Bộ chọn theme là yêu cầu mới, chưa có trong PRD. Nếu bạn không muốn bộ chọn trên trang xác thực, chỉ cần bỏ phần này; theme vẫn áp dụng sau khi đăng nhập.

## Kiểm tra

- Kiểm tra liên kết trong `docs/`: không có liên kết hỏng.
- Không có code, không chạy test.

## Việc còn lại

- Chủ dự án duyệt quy tắc theme trước khi viết FR/BR cho bộ chọn.
- Figma: DES-01 vẫn chờ connector; wireframe ASCII là căn cứ.

## Bàn giao

- Việc tiếp theo: duyệt quy tắc theme; sau đó thêm vào SRS (FR và BR) nếu được duyệt.
- Trạng thái lưu Git: đi cùng commit phiên này.
- Trạng thái đồng bộ: push lên `claude/friendly-brahmagupta-yzqxik`.
