# FEAT-02 — Mục kiến thức

- Module: `LIB` (backend: module `Library`, schema `library`).
- Vòng: 1 (2026-11-08 → 2026-11-21). Phụ thuộc FEAT-01 (phiên đăng nhập, `UserId`).
- Trạng thái: **Thiết kế — chờ chủ dự án duyệt để đạt DoR**. Chưa có code nghiệp vụ.
- Nguồn:
  - [Tổng quan](../../product/overview.md) §4.1.
  - [PRD](../../product/prd.md) FEAT-02.
  - [MVP](../../product/mvp-scope.md).
  - [ERD](../../architecture/erd.md) §3.2.
  - [Brainstorm](../../product/brainstorms/personal-english-knowledge.md) `Q-02`, `Q-03`.
  - [Design system](../../architecture/design-system.md).

## Phạm vi

**Có trong vòng này:**

- Tạo mục kiến thức: bắt buộc nội dung tiếng Anh, nghĩa và loại; không bắt buộc ghi chú, nguồn, ví dụ.
- Gợi ý mục trùng khi tạo; người dùng tự quyết bổ sung vào mục cũ hay tạo mục riêng.
- Danh sách mục, mới nhất trước, có phân trang.
- Xem chi tiết, sửa (phát hiện xung đột khi hai nơi cùng sửa), xóa có xác nhận.
- Chỉ chủ sở hữu thấy và thao tác được.

**Không có trong vòng này:**

- Bộ sưu tập, thẻ, dòng thời gian, tìm kiếm: Vòng 2.
- AI tự điền nghĩa, phát âm, ảnh, phục hồi sau xóa.

## Giả định đang dùng (chưa được chủ dự án trả lời)

- `Q-02`: một form chung cho mọi loại nội dung; trường "Nội dung tiếng Anh" và "Nghĩa / giải thích" dùng chung cho cả từ, cụm từ, cấu trúc, câu trích dẫn.
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
| Business rules và mã lỗi | Có, chờ duyệt |
| Màn hình đã duyệt, đủ trạng thái | Wireframe ASCII đã có; Figma BLOCKED (`DES-01`), chờ duyệt |
| API contract và ERD liên quan | Có; ERD §3.2 đã duyệt (chưa dùng cột `SearchText` cho tới Vòng 2) |
| Test case truy vết về AC | Có |
