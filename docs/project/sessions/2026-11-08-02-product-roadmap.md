# Phiên 2026-11-08 · 02 · Lộ trình phát triển

- Ngày / múi giờ: 2026-11-08, UTC.
- Mục tiêu do người dùng yêu cầu: tạo roadmap phát triển sản phẩm, triển khai theo hai quy trình thiết kế (tài liệu BA, giao diện Figma) và develop.
- Nhánh và commit nền đã kiểm tra: `claude/friendly-brahmagupta-yzqxik` tại `f59c4af` (trùng `origin/main`).
- Status: PARTIAL. Đã soạn lộ trình; còn chờ chủ dự án duyệt.

## Kết quả và file liên quan

- Tạo `docs/product/roadmap.md` theo skill OpenBA `roadmap`, template `_templates/02-roadmap.md`. Nội dung gồm:
  - Hai quy trình: Thiết kế D0–D5, Phát triển V0–V10.
  - Cổng DoR và DoD.
  - Danh mục FEAT-01 → FEAT-08 xếp Now/Next/Later.
  - Mốc M0–M4, rủi ro và phụ thuộc.
- Cập nhật `docs/product/README.md`, `docs/project/STATUS.md` (thêm ROAD-01, DES-01) và mục lục phiên.

## Quyết định và giả định

- Toàn bộ thứ tự ưu tiên và phạm vi MVP trong lộ trình là **đề xuất**, chưa được duyệt.
- Đề xuất để FEAT-06 (AI nhận xét câu) ở Next vì nhà cung cấp và chi phí chưa chốt.
- Không ghi ngày mục tiêu vì chưa biết nguồn lực.

## Kiểm tra

Kiểm tra thủ công liên kết tương đối `overview.md` và `../project/STATUS.md`. Không có build/test ứng dụng.

## Database/API/UI

Không áp dụng.

## Security checks

Không có secret hoặc dữ liệu người học thật.

## Việc còn lại và vướng mắc

- ROAD-01: chờ chủ dự án duyệt lộ trình.
- DES-01: việc vẽ Figma bị chặn vì phiên chưa có quyền truy cập Figma.
- DOC-01: vẫn thiếu brainstorm và discovery.

## Bàn giao

- Việc tiếp theo: ROAD-01 → D0 (DOC-01) → D1 (PRD, MVP).
- Công cụ/biến môi trường: không cần.
- Trạng thái lưu Git: đi cùng commit phiên này.
- Trạng thái đồng bộ: push lên `claude/friendly-brahmagupta-yzqxik`; chưa gộp vào `main`.
