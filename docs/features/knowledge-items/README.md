# FEAT-02 — Mục kiến thức

- Module: `LIB` (backend: module `Library`, schema `library`).
- Vòng: 1 (2026-11-08 → 2026-11-21). Phụ thuộc FEAT-01 (phiên đăng nhập, `UserId`).
- Trạng thái: **Thiết kế v0.5 (2026-11-11) — chờ chủ dự án duyệt để đạt DoR**. Code: **US-LIB-01 đã làm**, **US-LIB-02 đạt AC-01 đến AC-06**, **US-LIB-03 đạt AC-01 đến AC-04** ([phiên 27](../../project/sessions/2026-11-11-27-code-us-lib-03.md)); **US-LIB-05 đạt AC-01, 02, 04 và AC-03 một phần** ([phiên 28](../../project/sessions/2026-11-11-28-code-us-lib-05.md)); **US-LIB-06 đạt AC-01 đến AC-03** ([phiên 29](../../project/sessions/2026-11-11-29-code-us-lib-06.md)); **US-LIB-08 integration ready** (nguồn ngoài tắt mặc định, ADR 0007 chưa Accepted, chưa ghi là hoạt động); **US-LIB-09 đạt AC-01 đến AC-05** ([phiên 30](../../project/sessions/2026-11-11-30-suggestions-us-lib-08-09.md)) (module `Library`, form hai thư viện, chi tiết và danh sách tối thiểu; xem [phiên 25](../../project/sessions/2026-11-11-25-code-us-lib-01.md)); [phiên 26](../../project/sessions/2026-11-11-26-code-us-lib-02.md); các story còn lại chưa code.
- Nguồn:
  - [Tổng quan](../../product/overview.md) §4.1.
  - [PRD](../../product/prd.md) FEAT-02.
  - [MVP](../../product/mvp-scope.md).
  - [ERD](../../architecture/erd.md) §3.2.
  - [Brainstorm](../../product/brainstorms/personal-english-knowledge.md) `Q-02`, `Q-03`.
  - [Design system](../../architecture/design-system.md).

## Phạm vi

**Có trong vòng này:**

- Hai thư viện tách nhau, mỗi thư viện là một mục menu riêng với danh sách, thêm, xem, sửa, xóa riêng: **Từ vựng** (`/library/vocabulary`; bắt buộc "Từ" và "Nghĩa") và **Ngữ pháp** (`/library/grammar`; bắt buộc "Tên cấu trúc" và "Công thức"). Không có bước chọn loại. Các trường còn lại không bắt buộc; không có trường Nguồn trên form. Form một cột, các ô xếp theo đúng thứ tự chủ dự án nêu.
- Từ vựng: phiên âm IPA **Anh-Anh** tự điền từ API từ điển miễn phí (ADR 0007, phương án B đã chọn; chỉ khi nguồn có bản Anh-Anh được gắn nhãn, nếu không ô để trống); ghi nguồn Wiktionary CC BY-SA 3.0; người dùng sửa hoặc tự nhập. **Chưa được ghi là hoạt động** cho tới khi kiểm tra điều khoản và giới hạn gọi của nhà cung cấp.
- Gợi ý nghĩa khi nhập: từ mục của chính người dùng và nguồn từ điển; không lấy dữ liệu người khác. Gợi ý không tự điền, phải bấm.
- Gợi ý mục trùng khi tạo; người dùng tự quyết bổ sung vào mục cũ hay tạo mục riêng.
- Danh sách từng thư viện, mới nhất trước, có phân trang.
- Xem chi tiết, sửa (phát hiện xung đột khi hai nơi cùng sửa), xóa có xác nhận.
- Chỉ chủ sở hữu thấy và thao tác được.

**Không có trong vòng này:**

- Bộ sưu tập, thẻ, dòng thời gian, tìm kiếm: Vòng 2.
- AI tự điền nghĩa, phát âm, ảnh, phục hồi sau xóa.

## Quyết định và giả định

- **Thay đổi (2026-11-11, chủ dự án):** tách thư viện Từ vựng và Ngữ pháp thành hai mục menu riêng; bỏ bước chọn loại. Giả định đi kèm (chưa xác nhận): route `/library/vocabulary` và `/library/grammar` (`/library` chuyển hướng về từ vựng); mục tương tự và gợi ý chỉ tính trong cùng thư viện; không cho đổi loại khi sửa; giới hạn 10.000 mục tính chung; mục mở sai thư viện hiện "Không tìm thấy"; bỏ endpoint `item-kinds`; form một cột.
- **Đã chốt (2026-11-08, quyết định 14 và `Q-02`):** chọn loại trước (đã thay bằng hai thư viện, xem dòng trên); mỗi loại một trường bắt buộc; nghĩa gợi ý và không bắt buộc; từ vựng có IPA tự điền, sửa được. **Thay đổi (2026-11-11, chủ dự án):** từ vựng bắt buộc "Từ" và "Nghĩa"; ngữ pháp bắt buộc "Tên cấu trúc" và "Công thức"; ý nghĩa ngữ pháp không bắt buộc; bỏ trường "Nguồn" khỏi form; thêm "Loại từ" cho từ vựng. Thay thế phần "mỗi loại một trường bắt buộc" và "nghĩa không bắt buộc" của quyết định 14.
- **Giả định còn lại (chưa được chủ dự án trả lời):**
- `Q-03`: mục được coi là "tương tự" khi nội dung tiếng Anh trùng sau khi chuẩn hóa (chữ thường, trim, gộp khoảng trắng).
- `ERD-02`: Term ≤ 1000, Formula ≤ 1000, Meaning ≤ 2000, Note ≤ 4000 ký tự.
- `ERD-03`: tối đa 10.000 mục mỗi người.

## Hồ sơ

| Loại | Tài liệu |
| --- | --- |
| User story và AC | [requirements/user-stories.md](requirements/user-stories.md) |
| SRS: danh mục chung (FR, BR, ERR, NFR, quy ước API) | [srs/README.md](srs/README.md) |
| SRS theo story (luồng, wireframe, API, AC) | [US-LIB-01](srs/US-LIB-01-save-vocabulary-and-grammar.md), [02](srs/US-LIB-02-similar-item-hint.md), [03](srs/US-LIB-03-list-items.md), [04](srs/US-LIB-04-view-item.md), [05](srs/US-LIB-05-edit-item.md), [06](srs/US-LIB-06-delete-item.md), [07](srs/US-LIB-07-private-library.md), [08](srs/US-LIB-08-auto-ipa.md), [09](srs/US-LIB-09-meaning-suggestions.md) |
| Test case và RTM | [testing/test-cases.md](testing/test-cases.md) |

## Definition of Ready

| Điều kiện | Trạng thái |
| --- | --- |
| User story có ID, AC dạng Gherkin | Có, chờ duyệt |
| Business rules và mã lỗi | Có (BR-LIB-001 → 017), chờ duyệt |
| Màn hình đã duyệt, đủ trạng thái | Wireframe SVG (sinh bằng `tools/wireframes/`) đủ mọi màn hình và trạng thái của AC, trong SRS từng story (W-LIB-01 → 35); Figma chưa dựng màn hình của tính năng này (`DES-01`), chờ duyệt |
| Nguồn phiên âm và gợi ý nghĩa | [ADR 0007](../../decisions/0007-pronunciation-and-meaning-suggestions.md): đã chọn API từ điển miễn phí (phương án B). **Cổng chưa đạt:** điều khoản, giấy phép, giới hạn gọi chưa kiểm tra trực tiếp. US-LIB-08/09 đạt DoR ở mức thiết kế; không ghi là hoạt động |
| API contract và ERD liên quan | Có; ERD §3.2 đã duyệt (chưa dùng cột `SearchText` cho tới Vòng 2) |
| Test case truy vết về AC | Có |

## Lịch sử thay đổi

- **v0.2 (2026-11-08):** theo yêu cầu chủ dự án: chọn loại trước, form và nhãn bắt buộc theo loại, nghĩa không bắt buộc và gợi ý, phiên âm IPA cho từ vựng. Thêm US-LIB-08, US-LIB-09, FR-LIB-ITEM-007 → 009, BR-LIB-012 → 015, ERR-LIB-400-02; sửa ERD (`Meaning` null, thêm `Ipa`, `IpaSource`).
- **v0.3 (2026-11-08):** chủ dự án chọn phương án B (API từ điển miễn phí) và chỉ mở hai loại ở Vòng 1: Từ vựng và Ngữ pháp. Sửa US-LIB-01 (AC-01, 04, 05, 08), BR-LIB-002, BR-LIB-012, BR-LIB-013, API item-kinds, luồng, wireframe W-LIB-02a, test case TC-LIB-002, 003, 033, 036, 044, 050; ERD `Kind IN (1, 5)`.
- **v0.4 (2026-11-11):** chủ dự án đổi form theo loại (xem quyết định ở trên). Sửa US-LIB-01 (mô tả, AC-02, 03, 05, 06, 08; thêm AC-11), BR-LIB-001, 012, thêm BR-LIB-016, FR-LIB-ITEM-001, API item-kinds và POST, luồng, wireframe W-LIB-08 đến 11 (cũng sửa bản sao ở US-LIB-02 và US-LIB-08), test case TC-LIB-001 đến 006, 034, 035, thêm TC-LIB-051; ERD `Formula`, `PartOfSpeech`. Cùng ngày, theo quyết định của chủ dự án: giữ gợi ý nghĩa (US-LIB-09, AC-05 sửa); màn hình chi tiết và sửa (US-LIB-04, 05, W-LIB-14, 15, 18, 19) bỏ Nguồn và hiện loại từ, công thức.
- **v0.5 (2026-11-11):** chủ dự án yêu cầu tách thư viện Từ vựng và Ngữ pháp và vẽ lại wireframe. Đổi tên và viết lại US-LIB-01 (AC-01, 04); thêm AC-06 cho US-LIB-02, AC-05 cho US-LIB-03; cập nhật US-LIB-04 → 09; thêm BR-LIB-017, sửa BR-LIB-002, 003, 011; bỏ `item-kinds`; thêm TC-LIB-052 → 054, bỏ TC-LIB-050; số hóa lại W-LIB-01 → 35 bằng SVG.
