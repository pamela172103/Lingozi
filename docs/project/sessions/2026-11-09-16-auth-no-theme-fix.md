# Phiên 2026-11-09 · 16 · Sửa: trang xác thực không theo theme

- Ngày / múi giờ: 2026-11-09, UTC.
- Mục tiêu do người dùng yêu cầu: sửa wireframe đăng nhập, đăng ký. Các luồng này không được theo theme; phiên 15 đã thêm theme sai.
- Nhánh và commit nền đã kiểm tra: `claude/friendly-brahmagupta-yzqxik` tại commit `4572b65` (phiên 15).
- Status: PASS (chỉ tài liệu).

## Lỗi của phiên 15

Phiên 15 thêm bộ chọn theme, vùng trang trí theo theme và W-AUTH-01b (Coquette) vào trang xác thực. Yêu cầu của chủ dự án là trang xác thực không theo theme. Phiên 15 đã hiểu sai.

## Sửa

- `docs/features/accounts/design/wireframes.md`: khôi phục từ `859a9b4` (trước khi thêm theme), rồi:
  - Ghi rõ trang xác thực không có sidebar, không theo theme, không có vùng trang trí, không có bộ chọn theme.
  - W-AUTH-01: bỏ cột trái và vùng trang trí; một cột căn giữa.
  - W-AUTH-03: bỏ dòng minh họa phong bì.
  - Bỏ mục "Theme trên trang xác thực" và W-AUTH-01b.
- `docs/features/accounts/testing/test-cases.md`: khôi phục từ `859a9b4`, bỏ TC-AUTH-039.
- Theme chỉ áp dụng sau khi đăng nhập, theo design system §4–§5.

## Kiểm tra

- Tìm trong wireframe: không còn "theme", "decor", "minh họa" ở trang xác thực.
- Không có code, không chạy test.

## Lịch sử

Commit `4572b65` (phiên 15) vẫn còn trong lịch sử. Phiên này không viết lại lịch sử; chỉ thêm commit sửa.

## Bàn giao

- Việc tiếp theo: không có thay đổi theme trong FEAT-01. Tiếp tục theo lộ trình.
- Trạng thái lưu Git: đi cùng commit phiên này.
- Trạng thái đồng bộ: push lên `claude/friendly-brahmagupta-yzqxik`.
