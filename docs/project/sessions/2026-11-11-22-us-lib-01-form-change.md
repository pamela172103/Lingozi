# Phiên 2026-11-11 · 22 · US-LIB-01: đổi form theo loại

- Ngày / múi giờ: 2026-11-11, UTC.
- Mục tiêu do chủ dự án yêu cầu: form Từ vựng gồm Từ*, Phiên âm, Nghĩa*, Loại từ, Ví dụ, Ghi chú; form Ngữ pháp gồm Tên cấu trúc*, Công thức*, Ý nghĩa, Ví dụ, Ghi chú. Cập nhật US-LIB-01 theo các chỉnh sửa này.
- Nhánh: `claude/friendly-brahmagupta-yzqxik`.
- Status: PASS (chỉ tài liệu; chưa có code nghiệp vụ cho FEAT-02).

## Đã làm

- **Đặc tả US-LIB-01:** mô tả, quy ước, phạm vi; FR-LIB-ITEM-001 (đầu vào); luồng và trạng thái; API `item-kinds` và ví dụ POST; AC-02, 03, 05, 06, 08; thêm AC-11 (loại từ); bảng AC; truy vết TC; lịch sử 0.4.
- **Quy tắc:** BR-LIB-001 và BR-LIB-012 viết lại; thêm BR-LIB-016 (loại từ). Bản sao trong US-LIB-05 và US-LIB-08 đồng bộ.
- **Wireframe:** vẽ lại W-LIB-08 (từ vựng), W-LIB-09 (ngữ pháp), W-LIB-10 (lỗi), W-LIB-11 (giới hạn số mục). Bản sao W-LIB-08 ở US-LIB-02 và W-LIB-09 ở US-LIB-08 cập nhật giống hệt.
- **Gherkin:** requirements/user-stories.md và SRS khớp nhau.
- **Test case:** sửa TC-LIB-001 đến 006, 034, 035; thêm TC-LIB-051. Lỗi cũ đã sửa: TC-LIB-005 là test idempotency nhưng bị gắn AC-05; nay gắn AC-08.
- **ERD §3.2:** thêm `Formula`, `PartOfSpeech`; `Meaning` bắt buộc với từ vựng; `Source` không dùng ở Vòng 1.
- **README tính năng:** ghi thay đổi trong quyết định và lịch sử v0.4.

## Quyết định và giả định (chờ chủ dự án xác nhận)

1. **Bỏ trường "Nguồn" khỏi form** (theo danh sách của chủ dự án). Cột `Source` trong ERD không còn dùng ở Vòng 1. Nếu cần giữ, báo lại để sửa.
2. **Loại từ là danh sách cố định** (Danh từ, Động từ, Tính từ, Trạng từ, Giới từ, Liên từ, Thán từ, Cụm từ, Khác), không bắt buộc. Đây là giả định của nhóm.
3. **Ràng buộc mới với quyết định 14 (2026-11-08):** từ vựng nay bắt buộc nghĩa. Quyết định 14 từng ghi "nghĩa không bắt buộc" cho mọi loại; nay chỉ đúng với ngữ pháp.
4. **Công thức** dài tối đa 1000 ký tự (giống Từ). Đây là giả định của nhóm.

## Việc còn lại (chưa làm, cần làm tiếp)

- **US-LIB-09 (gợi ý nghĩa)** vẫn ghi "nghĩa không bắt buộc". Cần chủ dự án quyết định: gợi ý có còn cần thiết không khi nghĩa là bắt buộc (vẫn hữu ích để điền nhanh).
- **Màn hình chi tiết và sửa (US-LIB-04, US-LIB-05, W-LIB-14, W-LIB-18, W-LIB-19)** chưa hiện "Công thức" và "Loại từ"; chưa bỏ "Nguồn".
- **US-LIB-02 và US-LIB-08**: chỉ cập nhật phần khung trùng; phần mô tả khác trong hai story còn nhắc trường cũ (cần rà lại khi làm).

## Kiểm tra

| Lệnh | Kết quả |
| --- | --- |
| `python3 -I tools/feature-docs/check_feature_docs.py` | accounts OK, knowledge-items OK |
| Liên kết tương đối trong `docs/` | 0 liên kết hỏng |

Chưa có test ứng dụng vì chưa có code FEAT-02.
