# Phiên 2026-11-09 · 19 · Wireframe đủ cho từng user story

- Ngày / múi giờ: 2026-11-09, UTC.
- Mục tiêu do người dùng yêu cầu: vẽ tất cả wireframe liên quan có trong user story; ghi quy tắc ở nơi AI luôn đọc để mỗi lần viết SRS đều vẽ đủ.
- Nhánh: `claude/friendly-brahmagupta-yzqxik`.
- Status: PASS (chỉ tài liệu).

## Đã làm

- Vẽ 74 khung ASCII trong mục `## 4. Wireframe` của 19 file story: FEAT-01 có W-AUTH-01 → 23 (đăng nhập, nhập email, từng lỗi, nhập mã, mã sai, bị khóa, hết hạn, không nhận được mã, Google/Facebook, Cài đặt tài khoản, trang pháp lý, đăng xuất, lỗi phiên); FEAT-02 có W-LIB-01 → 30 (danh sách và 4 trạng thái, chọn loại, form từng loại, lỗi, gợi ý trùng, chi tiết, sửa, xung đột 409, xóa, phiên âm tự động 5 trạng thái, gợi ý nghĩa).
- Bảng AC của mỗi story có cột "Wireframe": mã khung đã vẽ trong file, liên kết tới khung của tính năng khác, hoặc "Không có UI" (AC chỉ có API).
- Màn hình dùng chung vẽ lại giống hệt ở từng story; thông tin điều hướng nằm dưới mục `### Điều hướng và liên kết màn hình`.
- Cột Wireframe cũ (mã W-xx cũ, 5–7 mã mỗi tính năng) được thay bằng bản mới; cách đánh số mới thay cho W-AUTH-01 → 07 và W-LIB-01 → 05 trước đây.

## Đổi thứ tự mục (theo yêu cầu sau đó)

Trong mỗi file story: 4 Acceptance criteria, 5 Wireframe, 6 API (trước đây 4 Wireframe, 5 API, 6 AC). Đã sửa các tham chiếu số mục trong `AGENTS.md`, `docs/features/README.md`, `docs/architecture/design-system.md` và liên kết `#6-api` trong US-AUTH-07.

## Quy tắc cho AI (mới)

- `AGENTS.md` §14 (đọc mỗi phiên) và `docs/features/README.md` (5 bước), nhắc ở `docs/guides/using-openba.md`.
- `tools/feature-docs/check_feature_docs.py` kiểm tra: mọi AC có ô Wireframe; mã W trong ô phải được vẽ trong cùng file (hoặc là liên kết, hoặc "Không có UI"); khung có ```text và mọi dòng cùng độ rộng; story có AC giao diện phải có ít nhất một khung; cùng mã W giống hệt ở mọi file của tính năng.

## Quyết định và giả định

- Đề xuất của nhóm, chờ chủ dự án xác nhận: chỉ vẽ thành phần có trong AC/FR; không thêm UI mới. Bố cục, chữ trong khung là gợi ý cho Figma (`DES-01`), chưa là thiết kế đã duyệt.
- Lưu ý: tài liệu sinh bằng script tạm (không nằm trong repo); chỉnh sửa về sau làm trực tiếp trên file.

## Kiểm tra

- `python3 -I tools/feature-docs/check_feature_docs.py`: OK cho `accounts` và `knowledge-items`.
- Liên kết tương đối trong `docs/`, `README.md`, `AGENTS.md`: 0 liên kết hỏng.
- Chưa render trên GitHub để xem căn lề với phông khác; Mermaid vẫn chưa render. Không có code, không chạy test ứng dụng.

## Việc tiếp theo

- Chủ dự án duyệt wireframe và DoR; dựng màn hình trong Figma (`DES-01`).
- Các mục chờ cũ: Q-01, Q-11, HOST-01–05, MAIL-01, FB-01, cổng pháp lý ADR 0007.
