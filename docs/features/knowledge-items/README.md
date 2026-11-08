# FEAT-02 — Mục kiến thức

- Module: `LIB` (backend: module `Library`, schema `library`).
- Vòng: 1 (2026-11-08 → 2026-11-21). Phụ thuộc FEAT-01 (phiên đăng nhập, `UserId`).
- Trạng thái: **Thiết kế v0.2 (2026-11-08) — chờ chủ dự án duyệt để đạt DoR**. Chưa có code nghiệp vụ.
- Nguồn:
  - [Tổng quan](../../product/overview.md) §4.1.
  - [PRD](../../product/prd.md) FEAT-02.
  - [MVP](../../product/mvp-scope.md).
  - [ERD](../../architecture/erd.md) §3.2.
  - [Brainstorm](../../product/brainstorms/personal-english-knowledge.md) `Q-02`, `Q-03`.
  - [Design system](../../architecture/design-system.md).

## Phạm vi

**Có trong vòng này:**

- Chọn loại trước (9 loại), rồi form theo loại. Mỗi loại chỉ bắt buộc một trường: "Từ" (từ vựng), "Điểm ngữ pháp" (ngữ pháp), "Nội dung" (các loại khác). Nghĩa, ví dụ, ghi chú, nguồn đều không bắt buộc.
- Từ vựng: phiên âm IPA tự điền từ nguồn từ điển; người dùng sửa hoặc tự nhập. **Phụ thuộc ADR 0007 (nguồn chưa chọn).**
- Gợi ý nghĩa khi nhập: từ mục của chính người dùng và nguồn từ điển; không lấy dữ liệu người khác. Gợi ý không tự điền, phải bấm.
- Gợi ý mục trùng khi tạo; người dùng tự quyết bổ sung vào mục cũ hay tạo mục riêng.
- Danh sách mục, mới nhất trước, có phân trang.
- Xem chi tiết, sửa (phát hiện xung đột khi hai nơi cùng sửa), xóa có xác nhận.
- Chỉ chủ sở hữu thấy và thao tác được.

**Không có trong vòng này:**

- Bộ sưu tập, thẻ, dòng thời gian, tìm kiếm: Vòng 2.
- AI tự điền nghĩa, phát âm, ảnh, phục hồi sau xóa.

## Quyết định và giả định

- **Đã chốt (2026-11-08, quyết định 14 và `Q-02`):** chọn loại trước; mỗi loại một trường bắt buộc; nghĩa gợi ý và không bắt buộc; từ vựng có IPA tự điền, sửa được.
- **Giả định còn lại (chưa được chủ dự án trả lời):**
- `Q-03`: mục được coi là "tương tự" khi nội dung tiếng Anh trùng sau khi chuẩn hóa (chữ thường, trim, gộp khoảng trắng).
- `ERD-02`: Term ≤ 1000, Meaning ≤ 2000, Note ≤ 4000, Source ≤ 300 ký tự.
- `ERD-03`: tối đa 10.000 mục mỗi người.

## Hồ sơ

| Loại | Tài liệu |
| --- | --- |
| User story + AC | [requirements/user-stories.md](requirements/user-stories.md) |
| Đặc tả: FR, BR, ma trận lỗi | [srs/srs.md](srs/srs.md) |
| API contract | [design/api-contract.md](design/api-contract.md) |
| Luồng | [design/flows.md](design/flows.md) |
| Wireframe | [design/wireframes.md](design/wireframes.md) |
| Test case + RTM | [testing/test-cases.md](testing/test-cases.md) |

## Definition of Ready

| Điều kiện | Trạng thái |
| --- | --- |
| User story có ID, AC dạng Gherkin | Có, chờ duyệt |
| Business rules và mã lỗi | Có (BR-LIB-001 → 015), chờ duyệt |
| Màn hình đã duyệt, đủ trạng thái | Wireframe ASCII (W-LIB-02a chọn loại, W-LIB-02 form theo loại); Figma BLOCKED (`DES-01`), chờ duyệt |
| Nguồn phiên âm và gợi ý nghĩa | **Chưa có** — [ADR 0007](../../decisions/0007-pronunciation-and-meaning-suggestions.md) Proposed. US-LIB-08 và US-LIB-09 vẫn đạt DoR được (có abstraction, provider giả trong test), nhưng không được ghi là hoạt động cho tới khi chọn nguồn |
| API contract và ERD liên quan | Có; ERD §3.2 đã duyệt (chưa dùng cột `SearchText` cho tới Vòng 2) |
| Test case truy vết về AC | Có |

## Lịch sử thay đổi

- **v0.2 (2026-11-08):** theo yêu cầu chủ dự án: chọn loại trước, form và nhãn bắt buộc theo loại, nghĩa không bắt buộc và gợi ý, phiên âm IPA cho từ vựng. Thêm US-LIB-08, US-LIB-09, FR-LIB-ITEM-007 → 009, BR-LIB-012 → 015, ERR-LIB-400-02; sửa ERD (`Meaning` null, thêm `Ipa`, `IpaSource`).
