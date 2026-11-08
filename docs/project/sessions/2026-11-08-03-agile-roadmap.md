# Phiên 2026-11-08 · 03 · Lộ trình Agile theo vòng

- Ngày / múi giờ: 2026-11-08, UTC.
- Mục tiêu do người dùng yêu cầu: phát triển theo hướng Agile — thiết kế và develop một vài tính năng, rồi lặp lại cho đến khi hoàn thành sản phẩm.
- Nhánh và commit nền đã kiểm tra: `claude/friendly-brahmagupta-yzqxik` tại `0943585`.
- Status: PARTIAL. Đã viết lại lộ trình; chờ chủ dự án duyệt.

## Kết quả và file liên quan

- Viết lại `docs/product/roadmap.md`. Thay mô hình dual-track (thiết kế đi trước một tính năng) bằng các vòng lặp; mỗi vòng gồm lập kế hoạch → thiết kế → phát triển → kiểm thử + demo → review + retro.
- Kế hoạch các vòng:
  - Vòng 0: nền dự án.
  - Vòng 1: FEAT-01, FEAT-02.
  - Vòng 2: FEAT-03, FEAT-04.
  - Vòng 3: FEAT-05, FEAT-07, phát hành MVP.
  - Vòng 4: FEAT-06.
  - Vòng 5: FEAT-08.
  - Vòng 6 trở đi: chọn theo phản hồi.
- Cập nhật `docs/product/README.md`, `docs/project/STATUS.md` và mục lục phiên.

## Quyết định và giả định

- **Đã quyết (chủ dự án, 2026-11-08):** làm Agile theo vòng lặp.
- **Đề xuất, chưa duyệt:**
  - Nhóm tính năng theo vòng.
  - MVP gồm Vòng 1–3.
  - Mỗi vòng dài 2–4 tuần, time-box.
  - Giữ cổng DoR/DoD.

## Kiểm tra

Kiểm tra liên kết tương đối `overview.md` và `../project/STATUS.md`. Không có build/test ứng dụng.

## Database/API/UI

Không áp dụng.

## Security checks

Không có secret hoặc dữ liệu người học thật.

## Việc còn lại và vướng mắc

- ROAD-01: chờ duyệt lộ trình.
- DOC-01: thiếu brainstorm và discovery.
- DES-01: Figma bị chặn do chưa có quyền truy cập.

## Bàn giao

- Việc tiếp theo: ROAD-01 → bắt đầu Vòng 0.
- Công cụ/biến môi trường: không cần.
- Trạng thái lưu Git: đi cùng commit phiên này.
- Trạng thái đồng bộ: push lên `claude/friendly-brahmagupta-yzqxik`; chưa gộp vào `main`.
