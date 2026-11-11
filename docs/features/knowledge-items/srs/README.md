# SRS — FEAT-02 Mục kiến thức

- Phiên bản 0.3 (2026-11-09). Trạng thái: **chờ duyệt**.
- Cách viết: SRS của tính năng này **tách theo từng user story**. File này là danh mục chung (yêu cầu, quy tắc, mã lỗi, NFR, quy ước API); mỗi story có file riêng với luồng, wireframe, API và acceptance criteria.
- Theo `rules/05` (IEEE 830): mục 1 giới thiệu, mục 2 tổ chức tài liệu, mục 3 mô tả tổng quan, mục 4 yêu cầu chi tiết, mục 5 ghi chú, mục 6 phụ lục.

## 1. Giới thiệu

- **Mục đích:** đặc tả hành vi của FEAT-02 ở mức đủ để thiết kế, code và kiểm thử.
- **Phạm vi:** xem [README của tính năng](../README.md).
- **Tham chiếu:** [user stories](../requirements/user-stories.md), [test cases](../testing/test-cases.md), [PRD](../../../product/prd.md), [ERD](../../../architecture/erd.md), [design system](../../../architecture/design-system.md), [ADR](../../../decisions/README.md).

## 2. Tổ chức SRS theo user story

| Story | Tên | File SRS |
| --- | --- | --- |
| `US-LIB-01` | Chọn loại và lưu mục kiến thức | [US-LIB-01-choose-type-and-save.md](US-LIB-01-choose-type-and-save.md) |
| `US-LIB-02` | Được gợi ý khi lưu mục tương tự | [US-LIB-02-similar-item-hint.md](US-LIB-02-similar-item-hint.md) |
| `US-LIB-03` | Xem danh sách thư viện | [US-LIB-03-list-items.md](US-LIB-03-list-items.md) |
| `US-LIB-04` | Xem chi tiết một mục | [US-LIB-04-view-item.md](US-LIB-04-view-item.md) |
| `US-LIB-05` | Sửa mục | [US-LIB-05-edit-item.md](US-LIB-05-edit-item.md) |
| `US-LIB-06` | Xóa mục | [US-LIB-06-delete-item.md](US-LIB-06-delete-item.md) |
| `US-LIB-07` | Thư viện riêng tư | [US-LIB-07-private-library.md](US-LIB-07-private-library.md) |
| `US-LIB-08` | Tự điền phiên âm IPA cho từ vựng | [US-LIB-08-auto-ipa.md](US-LIB-08-auto-ipa.md) |
| `US-LIB-09` | Gợi ý nghĩa khi nhập | [US-LIB-09-meaning-suggestions.md](US-LIB-09-meaning-suggestions.md) |

Mỗi file story có các mục: 1 giới thiệu, 2 yêu cầu áp dụng (FR, BR, ERR, NFR), 3 luồng (user flow, sequence, state), 4 wireframe, 5 API, 6 acceptance criteria, 7 truy vết test case, 8 lịch sử.

**Skill OpenBA dùng cho từng loại nội dung** (`tools/openba-kit/skills/`):

| Nội dung | Skill | Ghi chú |
| --- | --- | --- |
| FR, BR, ERR, NFR | `srs` | Mã theo `rules/01`, `02`, `03`, `04`, `11` |
| Luồng người dùng và trạng thái giao diện | `user-flow` | Mermaid `flowchart` |
| Tương tác thành phần | `sequence` | Mermaid `sequenceDiagram`, có `autonumber` |
| Vòng đời đối tượng | `state` | Mermaid `stateDiagram-v2` và ma trận chuyển trạng thái (`rules/12`) |
| Wireframe | `wireframe-ascii` | Figma bị chặn (`DES-01`) |
| API | `api-design` | Theo ADR 0002 (Problem Details), khác mẫu bọc `success/data/error` của `rules/10` |
| Tiêu chí nghiệm thu | `ac` | Gherkin theo `rules/08`; nguồn chính thức ở [user stories](../requirements/user-stories.md) |

**Quy ước đồng bộ:** văn bản Gherkin của AC có ở hai nơi (user story và SRS của story). Sửa ở user story trước, rồi cập nhật SRS. Chạy `python3 tools/feature-docs/check_feature_docs.py` để kiểm tra hai bản khớp nhau và các quy tắc, lỗi được sao chép đúng từ danh mục này.

## 3. Mô tả tổng quan

- **Người dùng:** `PER-01` và `PER-02` ([PRD](../../../product/prd.md) §2). Người dùng phải đăng nhập (FEAT-01). Hệ thống ngoài: nguồn từ điển phiên âm và nghĩa ([ADR 0007](../../../decisions/0007-pronunciation-and-meaning-suggestions.md), điều khoản chưa kiểm chứng xong).
- **Ràng buộc:** Vòng 1 chỉ có hai loại là Từ vựng và Ngữ pháp; xóa cứng, không phục hồi; tối đa 10.000 mục mỗi người; module `Library` dùng schema `library` ([ADR 0001](../../../decisions/0001-system-architecture-and-repo-layout.md), [ERD](../../../architecture/erd.md) §3.2).
- **Giả định:** `Q-03` (mục tương tự theo `NormalizedTerm`) và `ERD-02`, `ERD-03` đang dùng phương án mặc định; phiên âm và gợi ý từ điển chỉ ghi là hoạt động khi ADR 0007 đạt cổng kiểm tra.

## 4. Yêu cầu chi tiết

### 4.1 Danh mục yêu cầu chức năng (FR)

| Mã FR | Tên | Ưu tiên | SRS theo story | BR | ERR |
| --- | --- | --- | --- | --- | --- |
| `FR-LIB-ITEM-001` | Tạo mục kiến thức kèm ví dụ | P0 | [US-LIB-01](US-LIB-01-choose-type-and-save.md) | 001–005, 008, 010, 016 | 400-01, 422-01 |
| `FR-LIB-ITEM-002` | Kiểm tra mục tương tự trước khi tạo | P0 | [US-LIB-02](US-LIB-02-similar-item-hint.md) | 003, 006 | — |
| `FR-LIB-ITEM-003` | Liệt kê mục, mới nhất trước, phân trang | P0 | [US-LIB-03](US-LIB-03-list-items.md) | 006, 011 | 400-01 |
| `FR-LIB-ITEM-004` | Xem chi tiết mục | P0 | [US-LIB-04](US-LIB-04-view-item.md) | 006 | 404-01 |
| `FR-LIB-ITEM-005` | Sửa mục và ví dụ, kiểm tra xung đột | P0 | [US-LIB-05](US-LIB-05-edit-item.md) | 001–004, 006, 007 | 400-01, 404-01, 409-01 |
| `FR-LIB-ITEM-006` | Xóa mục kèm ví dụ | P0 | [US-LIB-06](US-LIB-06-delete-item.md) | 006, 009 | 404-01 |
| `FR-LIB-SEC-001` | Mọi thao tác chỉ trên dữ liệu của người đang đăng nhập | P0 | [US-LIB-07](US-LIB-07-private-library.md) | 006 | 404-01 |
| `FR-LIB-ITEM-007` | Chọn loại trước (Từ vựng, Ngữ pháp), form và nhãn theo loại | P0 | [US-LIB-01](US-LIB-01-choose-type-and-save.md) | 002, 012 | 400-01 |
| `FR-LIB-ITEM-008` | Tự điền và chỉnh sửa phiên âm IPA cho từ vựng (nguồn: API từ điển, ADR 0007) | P0 | [US-LIB-08](US-LIB-08-auto-ipa.md) | 013, 015 | 400-02 |
| `FR-LIB-ITEM-009` | Gợi ý nghĩa từ mục của người dùng và nguồn từ điển | P1 | [US-LIB-09](US-LIB-09-meaning-suggestions.md) | 014, 015 | — |

Mô tả Input, Xử lý, Output của từng FR nằm trong file SRS của story tương ứng (mục 2.1).

### 4.2 Quy tắc nghiệp vụ (BR)

| Mã BR | Quy tắc | KHI | THÌ | NGOẠI LỆ |
| --- | --- | --- | --- | --- |
| `BR-LIB-001` | Trường bắt buộc và độ dài | Tạo hoặc sửa | Sau khi trim: `term` 1–1000 ký tự và bắt buộc với mọi loại; `meaning` bắt buộc với `word` (1–2000); với `grammar` không bắt buộc (rỗng sau trim thì null, có thì 1–2000); `formula` bắt buộc với `grammar` (1–1000), null với `word`; `note` ≤ 4000; mỗi ví dụ `text` 1–1000, `translation` ≤ 1000 ký tự; chuỗi tùy chọn rỗng sau trim được lưu là null | — |
| `BR-LIB-002` | Loại nội dung | Tạo hoặc sửa | `kind` là **bắt buộc**, không có mặc định, và thuộc danh mục mở trong Vòng 1: `word` (Từ vựng) và `grammar` (Ngữ pháp). Database lưu `Kind` = 1 và 5 (ERD, CHECK `Kind IN (1, 5)`). Các loại khác (cụm từ, thành ngữ…) đã có mã dự phòng nhưng **chưa mở**; mở thêm cần đổi đặc tả và migration. Đổi loại khi sửa thì áp dụng quy tắc của loại mới | — |
| `BR-LIB-003` | Chuẩn hóa và mục tương tự | Tạo, sửa, kiểm tra trùng | `NormalizedTerm` = `term` chuyển chữ thường (culture-invariant), trim, gộp mọi chuỗi khoảng trắng thành một dấu cách. Hai mục là "tương tự" khi `NormalizedTerm` bằng nhau và cùng chủ sở hữu. Chỉ **gợi ý**, không chặn và không tự gộp (tổng quan §4.1) | — |
| `BR-LIB-004` | Số ví dụ | Tạo hoặc sửa | Tối đa 20 ví dụ mỗi mục | — |
| `BR-LIB-005` | Giới hạn số mục | Tạo | Tối đa 10.000 mục mỗi người (`ERD-03`) | — |
| `BR-LIB-006` | Chủ sở hữu | Mọi thao tác | `UserId` lấy từ phiên đăng nhập. Mục không thuộc người dùng thì xử lý như không tồn tại (404). Bỏ qua `userId` trong body | — |
| `BR-LIB-007` | Xung đột khi sửa | Sửa | `version` gửi lên phải khớp `RowVersion` hiện tại; không khớp thì trả 409, không ghi | — |
| `BR-LIB-008` | Idempotency khi tạo | Tạo | `clientRequestId` (UUID do client sinh mỗi lần mở form) là duy nhất theo người dùng. Gửi lại cùng mã thì trả lại mục đã tạo, không tạo thêm | Cùng mã nhưng nội dung khác vẫn trả lại mục đã tạo; không coi là lỗi |
| `BR-LIB-009` | Xóa | Xóa | Xóa cứng mục và các ví dụ trong một transaction; không phục hồi được (MVP). Xóa mục không tồn tại thì trả 404 | — |
| `BR-LIB-010` | Thời gian | Tạo hoặc sửa | `CreatedAt` và `UpdatedAt` lưu UTC; hiển thị theo múi giờ `Asia/Ho_Chi_Minh` (MVP) | — |
| `BR-LIB-011` | Phân trang | Liệt kê | `page` ≥ 1 (mặc định 1), `pageSize` 1–50 (mặc định 20; lớn hơn thì giới hạn về 50). Sắp theo `CreatedAt` giảm dần, rồi `Id` giảm dần để thứ tự ổn định | — |
| `BR-LIB-012` | Trường bắt buộc theo loại | Tạo hoặc sửa | `word` (Từ vựng): bắt buộc "Từ" (`term`) và "Nghĩa" (`meaning`). `grammar` (Ngữ pháp): bắt buộc "Tên cấu trúc" (`term`) và "Công thức" (`formula`). Ý nghĩa (ngữ pháp), ví dụ, ghi chú, phiên âm và loại từ không bắt buộc. Form không có trường nguồn | — |
| `BR-LIB-013` | Phiên âm IPA | Tạo hoặc sửa | **Nguồn và giọng:** chỉ tự điền phiên âm có nhãn Anh-Anh, tức là mục phonetics có `audio` kết thúc bằng `-uk.mp3`; không có thì để trống. Không dùng phiên âm không nhãn hoặc nhãn Anh-Mỹ. Khi hiển thị, ghi "Nguồn: Wiktionary, CC BY-SA 3.0" (ghi nguồn bắt buộc theo giấy phép). Chỉ có với `word`; với `grammar` `ipa` phải null. Sau khi trim, 1–200 ký tự; chỉ chứa ký tự IPA (nhóm Unicode IPA Extensions và Spacing Modifier Letters), `/ [ ] ˈ ˌ ː . ‿` và dấu cách; không chứa `<`, `>`, `&` hay ký tự điều khiển. `IpaSource` = 1 (từ điển) khi giá trị khớp đúng gợi ý nhận được lúc lưu, ngược lại = 2 (người dùng); null khi `ipa` null | Khi nguồn không có phiên âm, người dùng tự nhập thì `IpaSource` = 2 |
| `BR-LIB-014` | Gợi ý nghĩa và phiên âm | Gọi gợi ý | Gợi ý chỉ lấy từ (a) mục của **chính người dùng** có cùng `NormalizedTerm`, và (b) nguồn từ điển được cấu hình (ADR 0007). Không bao giờ lấy dữ liệu của người dùng khác. Gợi ý chỉ điền vào form khi người dùng bấm; API không tự ghi gợi ý vào mục | — |
| `BR-LIB-015` | Lỗi nguồn từ điển | Gọi nguồn | Timeout 3 giây. Lỗi hoặc timeout của nguồn **không phải lỗi nghiệp vụ**: API trả 200 với danh sách gợi ý rỗng kèm `sourceAvailable = false`, UI hiện dòng "Không lấy được phiên âm tự động" và cho phép nhập tay. Log ghi tên nguồn và loại lỗi, không ghi từ tra cứu gắn với người dùng | — |
| `BR-LIB-016` | Loại từ | Tạo hoặc sửa | `partOfSpeech` chỉ dùng cho `word`, không bắt buộc. Giá trị thuộc danh sách: Danh từ, Động từ, Tính từ, Trạng từ, Giới từ, Liên từ, Thán từ, Cụm từ, Khác. Giá trị khác bị từ chối với ERR-LIB-400-01 ở trường `partOfSpeech`. Với `grammar` luôn là null | — |

### 4.3 Giao diện ngoài

#### Kiểu dữ liệu

```jsonc
// KnowledgeItemSummary — dùng trong danh sách
{ "id": "uuid", "kind": "word", "term": "give up", "meaning": "từ bỏ", "ipa": null, "createdAt": "2026-11-08T07:00:00Z" }

// KnowledgeItemDetail
{
  "id": "uuid",
  "kind": "word",
  "term": "give up",
  "meaning": "từ bỏ",                         // null nếu không có
  "ipa": null,                                // chỉ có với "word"
  "ipaSource": null,
  "note": "Không dùng với tân ngữ là người", // null nếu không có
  "source": "Friends S01E01",                // null nếu không có
  "examples": [ { "text": "Don't give up.", "translation": "Đừng bỏ cuộc." } ], // theo thứ tự hiển thị
  "createdAt": "2026-11-08T07:00:00Z",
  "updatedAt": "2026-11-08T07:05:00Z",
  "version": "AAAAAAAAB9E="                  // rowversion base64, gửi lại khi sửa
}

// KnowledgeItemInput — dùng cho POST và PUT
{
  "kind": "word",                              // bắt buộc: "word" hoặc "grammar" (BR-LIB-002)
  "term": "give up",                          // bắt buộc (BR-LIB-012)
  "meaning": null,                            // không bắt buộc; null hoặc chuỗi rỗng sau trim → null
  "ipa": null,                                // chỉ khi kind = "word"; còn lại phải null (BR-LIB-013)
  "ipaSource": null,                          // "dictionary" hoặc "user"; null khi ipa là null
  "note": null,
  "source": null,
  "examples": [ { "text": "Don't give up.", "translation": null } ]
}
```

#### Danh mục endpoint

| Method và path | Body | Thành công | Lỗi |
| --- | --- | --- | --- |
| `GET /api/library/item-kinds` | — | `200 { kinds: [{ kind: "word", label: "Từ vựng", termLabel: "Từ", showsIpa: true }, { kind: "grammar", label: "Ngữ pháp", termLabel: "Điểm ngữ pháp", showsIpa: false }] }` (Vòng 1: hai loại theo BR-LIB-002/012) | — |
| `GET /api/library/items?page=1&pageSize=20` | — | `200 { items: Summary[], page, pageSize, totalCount }` | 400-01 |
| `GET /api/library/items/similar?term=` | — | `200 { items: Summary[] (tối đa 5), totalCount }`; `term` rỗng thì danh sách rỗng | 400-01 (`term` > 1000 ký tự) |
| `GET /api/library/suggestions?term=&kind=` | — | `200 { ipa: { value, source: "dictionary" } \| null, sourceAvailable: bool, meanings: [{ text, source: "own" \| "dictionary" }] }` (tối đa 5 nghĩa; `ipa` chỉ khi `kind = word`) | 400-01 |
| `POST /api/library/items` | `Input` + `clientRequestId` (uuid, bắt buộc) | `201 Detail` + `Location`; `200 Detail` nếu `clientRequestId` đã dùng (BR-LIB-008) | 400-01, 400-02, 422-01 |
| `GET /api/library/items/{id}` | — | `200 Detail` | 404-01 |
| `PUT /api/library/items/{id}` | `Input` + `version` (bắt buộc) | `200 Detail` (có `version` mới) | 400-01, 400-02, 404-01, 409-01 kèm `current: Detail` |
| `DELETE /api/library/items/{id}` | — | `204` | 404-01 |

**Quy tắc bổ sung:**

- `kind` khác `word` và `grammar` trả 400-01 ở trường `kind` (Vòng 1).
- `suggestions` không ghi gì vào database. Nguồn lỗi hoặc quá 3 giây trả `sourceAvailable = false`, `ipa = null`, `meanings = [own]`, status vẫn 200 (BR-LIB-015).
- `POST`/`PUT` với `kind` khác `word` mà có `ipa` khác null → 400-01 ở trường `ipa`.
- `ipaSource` do server xác định theo BR-LIB-013: khớp gợi ý đã nhận → `dictionary`, còn lại → `user`. Client không được tự đặt `dictionary` cho giá trị do người dùng sửa.
- `id` không đúng định dạng uuid cũng trả 404-01.

#### Trang web

| Route | Nội dung |
| --- | --- |
| `/library` | Danh sách (`?page=`) |
| `/library/items/new` | Form tạo |
| `/library/items/{id}` | Chi tiết |
| `/library/items/{id}/edit` | Form sửa |

Mọi route nằm trong app shell có sidebar ([design system](../../../architecture/design-system.md) §4) và yêu cầu đăng nhập (FEAT-01 US-AUTH-09). Nút "Lưu kiến thức" trên thanh trên (phím tắt `N`) mở `/library/items/new`.

### 4.4 Yêu cầu phi chức năng (NFR)

| NFR | Yêu cầu áp dụng cho FEAT-02 |
| --- | --- |
| `NFR-PRIV-001` | Integration test truy cập chéo cho mọi endpoint (US-LIB-07); truy cập tài nguyên người khác trả 404. |
| `NFR-PERF-001` | GET danh sách và chi tiết, POST, PUT có P95 ≤ 300 ms với 5.000 mục mỗi người; đo trên staging. Index (`UserId`, `CreatedAt` DESC) và (`UserId`, `NormalizedTerm`) theo ERD. |
| `NFR-A11Y-001` | Form có nhãn hiển thị; thêm và xóa ví dụ bằng bàn phím; xóa ví dụ thì focus chuyển sang ví dụ kế bên; dialog giữ focus bên trong; gợi ý cập nhật có `aria-live="polite"`. |
| `NFR-UX-001` | Form 2 cột ở ≥ 1280 px (trái: nội dung, loại, nghĩa; phải: ví dụ, ghi chú, nguồn); 1 cột ở < 1024 px; không cuộn ngang. |

### 4.5 Ma trận lỗi tổng hợp (ERR)

Theo `rules/03` và `rules/11`. Lỗi trả về dạng `application/problem+json` có trường `code`.

| Mã ERR | HTTP | Điều kiện phát sinh | Khóa i18n | Thông báo người dùng | Mức độ | Hành động trên giao diện | Ghi log (không ghi nội dung người dùng) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ERR-LIB-400-01` | 400 | Thiếu trường bắt buộc, vượt độ dài, `kind` ngoài danh mục, `page` hoặc `pageSize` không hợp lệ | `library.error.400-01` | "Vui lòng kiểm tra lại thông tin đã nhập." kèm lỗi theo từng ô | Medium | Lỗi dưới ô; focus ô lỗi đầu tiên | Validation failed: tên trường |
| `ERR-LIB-400-02` | 400 | `ipa` chứa ký tự ngoài tập IPA cho phép, hoặc dài hơn 200 ký tự | `library.error.400-02` | "Phiên âm chỉ được chứa ký tự IPA." | Medium | Lỗi dưới ô phiên âm | Validation failed: ipa charset |
| `ERR-LIB-404-01` | 404 | Mục không tồn tại, không thuộc người dùng, hoặc `id` sai định dạng | `library.error.404-01` | "Không tìm thấy mục này." | Medium | Màn hình "Không tìm thấy", nút về Thư viện | Item not found for user: itemId |
| `ERR-LIB-409-01` | 409 | `version` không khớp `RowVersion` khi sửa | `library.error.409-01` | "Mục này vừa được sửa ở nơi khác." | High | Giữ nội dung đang nhập; nút "Tải bản mới nhất" | Concurrency conflict: itemId |
| `ERR-LIB-422-01` | 422 | Người dùng đã có 10.000 mục | `library.error.422-01` | "Bạn đã đạt giới hạn 10.000 mục." | High | `InlineAlert` trên form | Item limit reached: userId |

Lỗi xác thực (401, 400-05) theo [FEAT-01](../../accounts/srs/README.md). Nội dung kiến thức của người dùng **không** được ghi vào log.

## 5. Ghi chú kỹ thuật

- Migration của module `Library` tạo `library.KnowledgeItems` và `library.ItemExamples` đúng ERD §3.2: FK ghép (`ItemId`, `UserId`), filtered unique index cho `ClientRequestId`, các index đã nêu.
- FK từ `library.*.UserId` tới `accounts.Users` (NO ACTION) được tạo bằng SQL trong migration, vì `Users` thuộc `DbContext` khác (ERD §1).
- Bảng `Collections`, `Tags`, cột tìm kiếm full-text **chưa tạo** ở Vòng 1. `SearchText` vẫn được tính và lưu để Vòng 2 không phải chạy migration bù dữ liệu.
- Bảng `KnowledgeItems` thêm cột `Ipa` (nvarchar 200, null) và `IpaSource` (tinyint, null); `Meaning` đổi thành null. Đây là thay đổi so với ERD đã duyệt và đã được ghi vào ERD (sửa đổi 2026-11-08). Migration thêm cột, không phá dữ liệu.
- Module `Library` lấy `UserId` qua interface `ICurrentUser` đặt trong `Lingozi.Accounts.Contracts` (ADR 0001), không tham chiếu trực tiếp project `Accounts`.

## 6. Phụ lục

### 6.1 Ma trận truy vết FR → story → test case

| FR | Story | Test case |
| --- | --- | --- |
| `FR-LIB-ITEM-001` | US-LIB-01 | TC-LIB-001 → 006, 034, 035, 051 |
| `FR-LIB-ITEM-002` | US-LIB-02 | TC-LIB-007 → 012 |
| `FR-LIB-ITEM-003` | US-LIB-03 | TC-LIB-013 → 016 |
| `FR-LIB-ITEM-004` | US-LIB-04 | TC-LIB-017, 018 |
| `FR-LIB-ITEM-005` | US-LIB-05 | TC-LIB-019 → 022 |
| `FR-LIB-ITEM-006` | US-LIB-06 | TC-LIB-023 → 025 |
| `FR-LIB-ITEM-007` | US-LIB-01 | TC-LIB-033 → 037, 050 |
| `FR-LIB-ITEM-008` | US-LIB-08 | TC-LIB-038 → 044, 050 |
| `FR-LIB-ITEM-009` | US-LIB-09 | TC-LIB-045 → 049 |
| `FR-LIB-SEC-001` | US-LIB-07 | TC-LIB-018, 022, 026 → 028, 047 |

Mọi FR và mọi AC đều có ít nhất một test case. TC-LIB-029 → 032 kiểm tra NFR.

### 6.2 Lịch sử sửa đổi

| Phiên bản | Ngày | Thay đổi |
| --- | --- | --- |
| 0.3 | 2026-11-09 | Đổi cấu trúc: SRS theo story; `srs.md` thành danh mục chung; nội dung `design/` chuyển vào từng story. |
