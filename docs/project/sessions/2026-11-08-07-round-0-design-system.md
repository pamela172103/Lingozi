# Phiên 2026-11-08 · 07 · Vòng 0: design system nền

- Ngày / múi giờ: 2026-11-08, UTC.
- Mục tiêu do người dùng yêu cầu: duyệt ERD; làm tiếp design system.
- Nhánh và commit nền đã kiểm tra: `claude/friendly-brahmagupta-yzqxik` tại `bad2c60`.
- Status: PARTIAL. Design system đã viết, chờ duyệt; Figma bị chặn.

## Kết quả và file liên quan

- `docs/architecture/design-system.md`:
  - Nguyên tắc `DS-P1`–`DS-P5`.
  - Kiến trúc token 3 lớp và cách ánh xạ sang CSS `--lz-*` với `data-theme`/`data-decor`.
  - Màu, chữ, khoảng cách, chuyển động.
  - Bố cục desktop-first.
  - Lớp trang trí ở các vùng dành riêng.
  - Danh mục component cho MVP.
  - Hướng dẫn dựng Figma Variables.
  - Điểm mở `DS-01`–`DS-04`.
- `docs/architecture/design-tokens.json`: nguồn token duy nhất, gồm theme `default` và `garden`.
- `tools/design-tokens/check_contrast.py`: kiểm tra tương phản WCAG cho mọi theme; trả exit code 1 khi có cặp không đạt.
- ERD chuyển trạng thái đã duyệt.
- Cập nhật roadmap, architecture README, STATUS và mục lục phiên.

## Quyết định và giả định

**Chủ dự án quyết định:** duyệt ERD (2026-11-08).

**Đề xuất, chưa duyệt:**

- Bảng màu.
- Theme thứ hai là Garden (phương án mặc định cho `Q-09`).
- Font Be Vietnam Pro và Lora (SIL OFL).
- Breakpoint và bố cục sidebar.

## Kiểm tra

- `python3 tools/design-tokens/check_contrast.py docs/architecture/design-tokens.json` → 0 failure, 19 cặp mỗi theme. Cặp sát ngưỡng nhất là `text.muted` trên `bg.subtle` của Garden: 4.90.
- Đã kiểm tra liên kết trong `docs/`.
- Chưa có UI để test bằng axe.

## Database/API/UI

Chỉ có thiết kế UI (token, quy tắc). Chưa có code giao diện.

## Security checks

Không áp dụng. Không có secret.

## Việc còn lại và vướng mắc

- DS-01: duyệt design system, chọn theme thứ hai.
- DES-01: Figma bị chặn.
- HOST-01, MAIL-01: thông tin máy chủ, nhà cung cấp email.
- ENV-01: chưa dựng được walking skeleton trong phiên cloud.

## Bàn giao

- Việc tiếp theo: walking skeleton + CI để hoàn tất Vòng 0.
- Công cụ/biến môi trường: .NET 10 SDK, Docker.
- Trạng thái lưu Git: đi cùng commit phiên này.
- Trạng thái đồng bộ: push lên `claude/friendly-brahmagupta-yzqxik`; chưa gộp vào `main`.
