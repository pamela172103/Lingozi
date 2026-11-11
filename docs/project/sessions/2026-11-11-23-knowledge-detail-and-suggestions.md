# Phiên 2026-11-11 · 23 · Chi tiết, sửa và gợi ý nghĩa theo form mới

- Ngày / múi giờ: 2026-11-11, UTC.
- Mục tiêu do chủ dự án yêu cầu: đồng ý giữ gợi ý nghĩa (US-LIB-09) và cập nhật tiếp màn hình chi tiết và sửa (US-LIB-04, 05) theo form mới (bỏ Nguồn; hiện loại từ và công thức).
- Nhánh: `claude/friendly-brahmagupta-yzqxik`.
- Status: PASS (chỉ tài liệu).

## Đã làm

- **Màn hình chi tiết (W-LIB-14, dùng chung ở US-LIB-01, 02, 04, 05, 06):** bỏ dòng "Nguồn"; hiện loại từ và phiên âm ở từ vựng; ghi chú hiện cuối; ghi chú mô tả khối Công thức và Ý nghĩa cho ngữ pháp.
- **Màn hình chi tiết tối thiểu (W-LIB-15, US-LIB-04):** không còn chữ "Nguồn" trong ghi chú.
- **Form sửa (W-LIB-18, 19, US-LIB-05):** dùng các trường mới (Từ*, Phiên âm, Loại từ, Nghĩa*); nhãn "Nghĩa *" trong xung đột.
- **Gợi ý nghĩa (US-LIB-09):** giữ tính năng; áp dụng cho ô Nghĩa (từ vựng) và Ý nghĩa (ngữ pháp); AC-05 sửa vì nghĩa từ vựng là bắt buộc; nhãn "Nghĩa *" trong W-LIB-27 đến 30.
- **Đặc tả US-LIB-04:** AC-01, AC-03 và luồng theo loại (không còn nguồn).
- **Danh mục và ví dụ JSON:** bỏ `source`, thêm `formula`, `partOfSpeech`; sửa API item-kinds.
- **Lịch sử:** thêm dòng 0.4 vào US-LIB-04, 05, 09; README tính năng cập nhật.

## Quyết định (theo chủ dự án, 2026-11-11)

1. Giữ gợi ý nghĩa.
2. Bỏ trường Nguồn khỏi chi tiết và form sửa.

## Kiểm tra

| Lệnh | Kết quả |
| --- | --- |
| `python3 -I tools/feature-docs/check_feature_docs.py` | accounts OK, knowledge-items OK |
| Liên kết tương đối trong `docs/` | 0 liên kết hỏng |

Chưa có test ứng dụng vì chưa có code FEAT-02. Các chữ "nguồn" còn lại đều là nguồn phiên âm hoặc nguồn gợi ý, không phải trường đã bỏ.

## Việc còn lại

- Cột `Source` trong ERD còn tồn tại nhưng không dùng; quyết định bỏ hẳn cột chờ chủ dự án xác nhận.
- Chưa vẽ riêng màn hình chi tiết của ngữ pháp; hiện mô tả trong ghi chú của W-LIB-14.
