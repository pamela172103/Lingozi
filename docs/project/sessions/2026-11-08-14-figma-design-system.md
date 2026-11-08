# Phiên 2026-11-08 · 14 · Dựng design system nền trong Figma

- Ngày / múi giờ: 2026-11-08, UTC.
- Mục tiêu do người dùng yêu cầu: vẽ giao diện design system nền vào file Lingozi trên Figma.
- Nhánh và commit nền đã kiểm tra: `claude/friendly-brahmagupta-yzqxik` tại `82e8cff`.
- Status: PARTIAL. Biến và trang xem trước đã có; chưa có component, text style, effect style.

## Kết quả

- Kết nối: GitHub (`pamela172103`) và Figma (connector đã bật, gói Free, ghế View ban đầu). File `tIrqU4XF6eEOTraGqv2EpY` ghi được trên gói Free.
- Biến (từ `docs/architecture/design-tokens.json`): hai bộ theme (19 màu mỗi bộ), `Khoảng cách` (11), `Bo góc` (5). Có phạm vi và cú pháp WEB.
- Trang "Design system nền" (node `8:3`): bảng màu, kiểu chữ, nút, ô nhập, trạng thái, khoảng cách, bo góc, toàn bộ gắn với biến.
- Lỗi đã sửa trong phiên:
  - Thử tạo nhiều chế độ trong một bộ biến: lỗi "Limited to 1 modes only" (gói Free). Chuyển sang hai bộ biến.
  - `FILL` đặt trước khi gắn vào frame auto-layout.
  - Tra cứu biến sai tên (thiếu tiền tố `color/`), làm các màu bị đen. Đã sửa và xác nhận bằng ảnh chụp.
  - Frame gốc bị khóa chiều cao sau `resize()`.

## Kiểm tra

- Đọc lại biến: số lượng đúng (19, 19, 11, 5); giá trị khớp hex (ví dụ `#1B1B22`, `#B03A62`); cú pháp mã WEB đúng.
- Ảnh chụp trang xem trước: bố cục đúng, màu đúng, font Be Vietnam Pro hiển thị đủ dấu.
- Không chạy test ứng dụng (không có mã).

## Database/API/UI

- Figma: thêm trang "Design system nền" và 4 bộ biến. Không có thay đổi mã.

## Security checks

- Không có secret. Link Figma đã ghi công khai trong tài liệu design-system.md; file vẫn theo quyền của tài khoản.

## Việc còn lại

- Component thật (nút, ô nhập, thẻ, thông báo) dạng variant.
- Text style và effect style.
- Bóng (`shadow.card`, `shadow.overlay`) chưa dựng.
- Nhãn "Mode" của bộ biến dùng tên tiếng Việt; kiểm tra khi dựng component.

## Bàn giao

- Việc tiếp theo: dựng component cơ bản trong file Lingozi, sau đó text style, rồi viết `figma-spec.md` cho FEAT-02.
- Trạng thái lưu Git: đi cùng commit phiên này.
- Trạng thái đồng bộ: push lên `claude/friendly-brahmagupta-yzqxik`.
