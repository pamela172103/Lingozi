# Phiên 2026-11-08 · 12 · FEAT-02: chọn loại, phiên âm IPA, gợi ý nghĩa

- Ngày / múi giờ: 2026-11-08, UTC.
- Mục tiêu do người dùng yêu cầu: chọn loại kiến thức trước; mỗi loại có form riêng; chỉ bắt buộc từ hoặc điểm ngữ pháp; nghĩa được gợi ý và không bắt buộc; từ vựng tự điền IPA, sửa hoặc tự thêm được.
- Nhánh và commit nền đã kiểm tra: `claude/friendly-brahmagupta-yzqxik` tại `1d14269`.
- Status: PARTIAL. Thiết kế đã cập nhật, chưa code. Phần phiên âm và gợi ý phụ thuộc nguồn chưa chọn (ADR 0007).

## Kết quả và file liên quan

- `docs/features/knowledge-items/`:
  - `requirements/user-stories.md`: viết lại US-LIB-01 (chọn loại, bắt buộc theo loại, 10 AC); thêm US-LIB-08 (IPA, 8 AC) và US-LIB-09 (gợi ý nghĩa, 5 AC).
  - `srs/srs.md`: sửa BR-LIB-001 và BR-LIB-002; thêm BR-LIB-012 → 015, FR-LIB-ITEM-007 → 009, ERR-LIB-400-02.
  - `design/api-contract.md`: thêm `GET item-kinds`, `GET suggestions`; `ipa`, `ipaSource`; `meaning` null.
  - `design/flows.md`: thêm luồng chọn loại và gợi ý.
  - `design/wireframes.md`: thêm W-LIB-02a (chọn loại); thay W-LIB-02 (form theo loại).
  - `testing/test-cases.md`: sửa TC-LIB-001 → 004, thêm TC-LIB-033 → 050, làm lại RTM.
  - `README.md`: trạng thái v0.2, DoR, lịch sử thay đổi.
- `docs/architecture/erd.md`: có ghi sửa đổi. `Meaning` null; thêm `Ipa`, `IpaSource`; `Kind` không có mặc định.
- `docs/decisions/0007-pronunciation-and-meaning-suggestions.md`: ADR mới, Proposed, chưa chọn nguồn.
- Brainstorm: `Q-02` đã chốt; quyết định 14.

## Quyết định và giả định

- **Chủ dự án quyết định (2026-11-08):** chọn loại trước; mỗi loại một trường bắt buộc; nghĩa gợi ý và không bắt buộc; từ vựng có IPA tự điền, sửa được.
- **Đề xuất trong thiết kế, chờ duyệt:**
  - Phiên âm: 200 ký tự, chỉ ký tự IPA.
  - Gợi ý nghĩa chỉ lấy từ chính người dùng và nguồn từ điển, không lấy của người khác.
  - Timeout nguồn 3 giây; lỗi nguồn không phải lỗi nghiệp vụ.
  - Không có mặc định loại; người dùng phải chọn.
- **Phụ thuộc chưa giải quyết:** ADR 0007 — nguồn phiên âm IPA. Chưa kiểm tra điều khoản của bất kỳ nguồn nào, nên **không khẳng định** tính năng tự điền IPA hoạt động được.

## Kiểm tra

- Script truy vết AC → TC: 45/45 AC của FEAT-02 có test case (50 TC).
- Kiểm tra liên kết trong `docs/`.
- Không có code, nên không chạy build hay test.

## Database/API/UI

- **Database (thiết kế):** `KnowledgeItems` thêm `Ipa`, `IpaSource`; `Meaning` null. Migration chỉ thêm cột.
- **API (thiết kế):** `GET /api/library/item-kinds`, `GET /api/library/suggestions`; `ipa`/`ipaSource` trong POST và PUT.
- **UI (thiết kế):** chọn loại qua radio group; form có nhãn theo loại.

## Security checks

- Gợi ý không lấy dữ liệu người khác (TC-LIB-047 kiểm tra điều kiện `UserId`).
- Gửi tới nguồn từ điển chỉ có từ cần tra, không có danh tính người dùng.
- Phiên âm do người dùng nhập được kiểm tra ký tự, chống chèn HTML (TC-LIB-041).
- Lỗi nguồn không làm lộ thông tin nội bộ.

## Việc còn lại và vướng mắc

- ADR 0007: chủ dự án chọn nguồn (đề xuất A: bộ dữ liệu mở, nạp offline) và xác nhận giấy phép.
- Chủ dự án duyệt FEAT-01 và FEAT-02 để đạt DoR.
- Các câu hỏi cũ `Q-01`, `Q-11`.

## Bàn giao

- Việc tiếp theo: chủ dự án duyệt thiết kế và chọn nguồn phiên âm (ADR 0007). Sau đó code FEAT-01, rồi FEAT-02 (kể cả US-LIB-08/09 nếu đã có nguồn).
- Trạng thái lưu Git: đi cùng commit phiên này.
- Trạng thái đồng bộ: push lên `claude/friendly-brahmagupta-yzqxik`.
