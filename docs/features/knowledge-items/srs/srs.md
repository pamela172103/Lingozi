# Đặc tả — FEAT-02 Mục kiến thức

- Cập nhật: 2026-11-08. Trạng thái: **chờ duyệt**.
- Liên quan: [user stories](../requirements/user-stories.md), [API contract](../design/api-contract.md), [ERD](../../../architecture/erd.md) §3.2.

## 1. Yêu cầu chức năng

| Mã FR | Tên | Ưu tiên | Story | BR | ERR |
| --- | --- | --- | --- | --- | --- |
| `FR-LIB-ITEM-001` | Tạo mục kiến thức kèm ví dụ | P0 | US-LIB-01 | 001–005, 008, 010 | 400-01, 422-01 |
| `FR-LIB-ITEM-002` | Kiểm tra mục tương tự trước khi tạo | P0 | US-LIB-02 | 003, 006 | — |
| `FR-LIB-ITEM-003` | Liệt kê mục, mới nhất trước, phân trang | P0 | US-LIB-03 | 006, 011 | 400-01 |
| `FR-LIB-ITEM-004` | Xem chi tiết mục | P0 | US-LIB-04 | 006 | 404-01 |
| `FR-LIB-ITEM-005` | Sửa mục và ví dụ, kiểm tra xung đột | P0 | US-LIB-05 | 001–004, 006, 007 | 400-01, 404-01, 409-01 |
| `FR-LIB-ITEM-006` | Xóa mục kèm ví dụ | P0 | US-LIB-06 | 006, 009 | 404-01 |
| `FR-LIB-SEC-001` | Mọi thao tác chỉ trên dữ liệu của người đang đăng nhập | P0 | US-LIB-07 | 006 | 404-01 |

**Mô tả bổ sung:**

- `FR-LIB-ITEM-001`
  - Input: `clientRequestId`, `kind`, `term`, `meaning`, `note?`, `source?`, `examples[] { text, translation? }`.
  - Xử lý: trim các chuỗi; tính `NormalizedTerm` (BR-LIB-003) và `SearchText`, cột này chuẩn bị cho Vòng 2; kiểm tra BR; ghi mục và ví dụ trong một transaction.
  - Output: `201` với mục vừa tạo; `200` nếu `clientRequestId` đã được dùng.
- `FR-LIB-ITEM-002`
  - Input: `term`.
  - Output: tối đa 5 mục mới nhất của người dùng có cùng `NormalizedTerm`, kèm `totalCount`.
  - Giao diện gọi trước khi tạo. API tạo **không** tự chặn khi có mục trùng (BR-LIB-003).
- `FR-LIB-ITEM-005`
  - Thay toàn bộ nội dung mục và danh sách ví dụ bằng dữ liệu gửi lên (PUT). Ví dụ mới hoặc đổi thứ tự được lưu lại theo `sortOrder` mới.
  - Kiểm tra `version` (rowversion dạng base64): không khớp thì trả 409 kèm bản mới nhất.

## 2. Quy tắc nghiệp vụ

| Mã BR | Quy tắc | KHI | THÌ | NGOẠI LỆ |
| --- | --- | --- | --- | --- |
| `BR-LIB-001` | Trường bắt buộc và độ dài | Tạo hoặc sửa | Sau khi trim: `term` 1–1000, `meaning` 1–2000, `note` ≤ 4000, `source` ≤ 300, mỗi ví dụ `text` 1–1000, `translation` ≤ 1000 ký tự. Chuỗi tùy chọn rỗng sau trim được lưu là null | — |
| `BR-LIB-002` | Loại nội dung | Tạo hoặc sửa | `kind` thuộc danh mục: `word` (Từ vựng, mặc định), `phrase` (Cụm từ), `phrasalVerb` (Cụm động từ), `idiom` (Thành ngữ), `grammar` (Ngữ pháp), `sentencePattern` (Cấu trúc câu), `expression` (Mẫu giao tiếp), `quote` (Câu/đoạn trích), `usageNote` (Ghi chú cách dùng). Database lưu tinyint 1–9 (ERD) | — |
| `BR-LIB-003` | Chuẩn hóa và mục tương tự | Tạo, sửa, kiểm tra trùng | `NormalizedTerm` = `term` chuyển chữ thường (culture-invariant), trim, gộp mọi chuỗi khoảng trắng thành một dấu cách. Hai mục là "tương tự" khi `NormalizedTerm` bằng nhau và cùng chủ sở hữu. Chỉ **gợi ý**, không chặn và không tự gộp (tổng quan §4.1) | — |
| `BR-LIB-004` | Số ví dụ | Tạo hoặc sửa | Tối đa 20 ví dụ mỗi mục | — |
| `BR-LIB-005` | Giới hạn số mục | Tạo | Tối đa 10.000 mục mỗi người (`ERD-03`) | — |
| `BR-LIB-006` | Chủ sở hữu | Mọi thao tác | `UserId` lấy từ phiên đăng nhập. Mục không thuộc người dùng thì xử lý như không tồn tại (404). Bỏ qua `userId` trong body | — |
| `BR-LIB-007` | Xung đột khi sửa | Sửa | `version` gửi lên phải khớp `RowVersion` hiện tại; không khớp thì trả 409, không ghi | — |
| `BR-LIB-008` | Idempotency khi tạo | Tạo | `clientRequestId` (UUID do client sinh mỗi lần mở form) là duy nhất theo người dùng. Gửi lại cùng mã thì trả lại mục đã tạo, không tạo thêm | Cùng mã nhưng nội dung khác vẫn trả lại mục đã tạo; không coi là lỗi |
| `BR-LIB-009` | Xóa | Xóa | Xóa cứng mục và các ví dụ trong một transaction; không phục hồi được (MVP). Xóa mục không tồn tại thì trả 404 | — |
| `BR-LIB-010` | Thời gian | Tạo hoặc sửa | `CreatedAt` và `UpdatedAt` lưu UTC; hiển thị theo múi giờ `Asia/Ho_Chi_Minh` (MVP) | — |
| `BR-LIB-011` | Phân trang | Liệt kê | `page` ≥ 1 (mặc định 1), `pageSize` 1–50 (mặc định 20; lớn hơn thì giới hạn về 50). Sắp theo `CreatedAt` giảm dần, rồi `Id` giảm dần để thứ tự ổn định | — |

## 3. Ma trận lỗi

| Mã ERR | HTTP | Thông báo cho người dùng | Ghi log | Xử lý trên giao diện |
| --- | --- | --- | --- | --- |
| `ERR-LIB-400-01` | 400 | "Vui lòng kiểm tra lại thông tin đã nhập." + lỗi theo từng ô | Validation failed: tên trường (không ghi nội dung người dùng) | Lỗi dưới ô; focus ô lỗi đầu tiên |
| `ERR-LIB-404-01` | 404 | "Không tìm thấy mục này." | Item not found for user: itemId | Màn hình "Không tìm thấy", nút về Thư viện |
| `ERR-LIB-409-01` | 409 | "Mục này vừa được sửa ở nơi khác." | Concurrency conflict: itemId | Giữ nội dung đang nhập; nút "Tải bản mới nhất" |
| `ERR-LIB-422-01` | 422 | "Bạn đã đạt giới hạn 10.000 mục." | Item limit reached: userId | `InlineAlert` trên form |

Lỗi xác thực (401, 403, 400-05) theo FEAT-01. Nội dung kiến thức của người dùng **không** được ghi vào log.

## 4. Yêu cầu phi chức năng áp dụng

| NFR | Áp dụng |
| --- | --- |
| NFR-PRIV-001 | Integration test truy cập chéo cho mọi endpoint (US-LIB-07) |
| NFR-PERF-001 | GET danh sách và chi tiết, POST, PUT có P95 ≤ 300 ms với 5.000 mục mỗi người; đo trên staging. Index (`UserId`, `CreatedAt` DESC) và (`UserId`, `NormalizedTerm`) theo ERD |
| NFR-A11Y-001 | Form có nhãn hiển thị; danh sách ví dụ thêm/xóa được bằng bàn phím; khi xóa một ví dụ thì focus chuyển sang ví dụ kế bên; dialog giữ focus bên trong |
| NFR-UX-001 | Form 2 cột ở ≥ 1280 px (cột trái: nội dung, nghĩa, loại; cột phải: ví dụ, ghi chú, nguồn); 1 cột ở < 1024 px |

## 5. Ghi chú kỹ thuật

- Migration của module `Library` tạo `library.KnowledgeItems` và `library.ItemExamples` đúng ERD §3.2: FK ghép (`ItemId`, `UserId`), filtered unique index cho `ClientRequestId`, các index đã nêu.
- FK từ `library.*.UserId` tới `accounts.Users` (NO ACTION) được tạo bằng SQL trong migration, vì `Users` thuộc `DbContext` khác (ERD §1).
- Bảng `Collections`, `Tags`, cột tìm kiếm full-text **chưa tạo** ở Vòng 1. `SearchText` vẫn được tính và lưu để Vòng 2 không phải chạy migration bù dữ liệu.
- Module `Library` lấy `UserId` qua interface `ICurrentUser` đặt trong `Lingozi.Accounts.Contracts` (ADR 0001), không tham chiếu trực tiếp project `Accounts`.
