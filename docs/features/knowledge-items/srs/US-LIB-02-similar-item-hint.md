# SRS US-LIB-02 — Được gợi ý khi lưu mục tương tự

- Tính năng: FEAT-02 Mục kiến thức (`knowledge-items`).
- User story: [US-LIB-02](../requirements/user-stories.md#us-lib-02--được-gợi-ý-khi-lưu-mục-tương-tự).
- Phiên bản 0.4 (2026-11-11). Trạng thái: **chờ duyệt**.
- Tài liệu chung: [README.md](README.md) (danh mục FR, BR, ERR, NFR, quy ước API, ngữ cảnh).
- Test case: [testing/test-cases.md](../testing/test-cases.md).
- Skill OpenBA áp dụng: `srs` (FR, BR, ERR, NFR), `user-flow`, `sequence`, wireframe SVG (`tools/wireframes/`), `api-design`, `ac`.

## 1. Giới thiệu

Là người tự học, tôi muốn biết mình đã lưu nội dung này trong cùng thư viện chưa, để bổ sung vào mục cũ thay vì tạo bản trùng. Mục tương tự chỉ tìm trong cùng thư viện (từ vựng với từ vựng, ngữ pháp với ngữ pháp).

**Trong phạm vi:**

- Gọi kiểm tra mục tương tự khi bấm "Lưu".
- Hộp thoại liệt kê tối đa 5 mục với hai lựa chọn: mở mục cũ để bổ sung hoặc vẫn tạo mục mới.
- Không bao giờ tự gộp.

**Ngoài phạm vi:**

- Tìm kiếm toàn văn (Vòng 2).
- Gộp mục tự động.

## 2. Yêu cầu áp dụng

### 2.1 Yêu cầu chức năng (FR)

**`FR-LIB-ITEM-002` — Kiểm tra mục tương tự cùng thư viện trước khi tạo**

- Input: `kind`, `term`.
- Xử lý: Chuẩn hóa `term` (BR-LIB-003), tìm mục của chính người dùng có cùng `kind` và `NormalizedTerm`. Giao diện gọi trước khi tạo. API tạo **không** tự chặn khi có mục trùng.
- Output: Tối đa 5 mục mới nhất và `totalCount`.

### 2.2 Quy tắc nghiệp vụ (BR)

Phát biểu theo dạng KHI, THÌ, NGOẠI LỆ (`rules/02`). Nội dung chính thức nằm ở [README.md](README.md); bảng dưới là bản sao các quy tắc áp dụng cho story này.

| Mã BR | Quy tắc | KHI | THÌ | NGOẠI LỆ |
| --- | --- | --- | --- | --- |
| `BR-LIB-003` | Chuẩn hóa và mục tương tự | Tạo, sửa, kiểm tra trùng | `NormalizedTerm` = `term` chuyển chữ thường (culture-invariant), trim, gộp mọi chuỗi khoảng trắng thành một dấu cách. Hai mục là "tương tự" khi cùng `kind`, `NormalizedTerm` bằng nhau và cùng chủ sở hữu (từ vựng chỉ so với từ vựng, ngữ pháp chỉ so với ngữ pháp). Chỉ **gợi ý**, không chặn và không tự gộp (tổng quan §4.1) | — |
| `BR-LIB-006` | Chủ sở hữu | Mọi thao tác | `UserId` lấy từ phiên đăng nhập. Mục không thuộc người dùng thì xử lý như không tồn tại (404). Bỏ qua `userId` trong body | — |
| `BR-LIB-017` | Hai thư viện tách nhau | Mở, liệt kê, tạo, xem, sửa, xóa, gợi ý | Từ vựng (`/library/vocabulary`, `kind` = `word`) và Ngữ pháp (`/library/grammar`, `kind` = `grammar`) là hai mục riêng trong menu. Danh sách, form, gợi ý mục tương tự và gợi ý nghĩa chỉ dùng mục cùng loại. Mục mở bằng route của thư viện kia thì web hiện "Không tìm thấy" như ERR-LIB-404-01. Giới hạn 10.000 mục (BR-LIB-005) tính chung cả hai thư viện | — |

### 2.3 Ma trận lỗi (ERR)

Theo `rules/03` và `rules/11`. Nội dung chính thức nằm ở [README.md](README.md); bảng dưới là bản sao các lỗi áp dụng cho story này.

| Mã ERR | HTTP | Điều kiện phát sinh | Khóa i18n | Thông báo người dùng | Mức độ | Hành động trên giao diện | Ghi log (không ghi nội dung người dùng) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ERR-LIB-400-01` | 400 | Thiếu trường bắt buộc, vượt độ dài, `kind` ngoài danh mục, `page` hoặc `pageSize` không hợp lệ | `library.error.400-01` | "Vui lòng kiểm tra lại thông tin đã nhập." kèm lỗi theo từng ô | Medium | Lỗi dưới ô; focus ô lỗi đầu tiên | Validation failed: tên trường |

### 2.4 Yêu cầu phi chức năng (NFR)

- `NFR-A11Y-001`: Form có nhãn hiển thị; thêm và xóa ví dụ bằng bàn phím; xóa ví dụ thì focus chuyển sang ví dụ kế bên; dialog giữ focus bên trong; gợi ý cập nhật có `aria-live="polite"`.
- `NFR-PERF-001`: GET danh sách và chi tiết, POST, PUT có P95 ≤ 300 ms với 5.000 mục mỗi người; đo trên staging. Index (`UserId`, `CreatedAt` DESC) và (`UserId`, `NormalizedTerm`) theo ERD.

## 3. Luồng

### 3.1 User flow

_Skill `user-flow`: màn hình và chuyển đổi, kèm các trạng thái giao diện._

```mermaid
flowchart TD
    A[Mở form thêm của thư viện<br/>client sinh clientRequestId] --> B[Nhập nội dung, nghĩa, ...] --> C[Bấm Lưu]
    C --> V{Hợp lệ ở client?}
    V -- Không --> B1[Lỗi dưới ô] --> B
    V -- Có --> S[GET /similar?kind=&term=]
    S --> D{Có mục tương tự?}
    D -- Không --> P[POST /items]
    D -- Có --> DLG[Dialog 'Bạn đã lưu nội dung tương tự']
    DLG -- Mở mục cũ để bổ sung --> E[/library/vocabulary/id/edit hoặc /library/grammar/id/edit<br/>+ panel 'Nội dung bạn vừa nhập'/]
    DLG -- Vẫn tạo mục mới --> P
    DLG -- Hủy / Esc --> B
    P --> R{Kết quả}
    R -- 201 hoặc 200 --> OK[Chi tiết của thư viện + Toast 'Đã lưu'/]
    R -- 400-01 --> B1
    R -- 422-01 --> L[InlineAlert giới hạn]
    R -- Lỗi mạng --> RT[InlineAlert + nút 'Thử lại'<br/>gửi lại cùng clientRequestId] --> P
```

Panel "Nội dung bạn vừa nhập" chỉ hiển thị để người dùng tự chép sang mục cũ, không tự gộp vào mục cũ (tổng quan §4.1). Dữ liệu panel chỉ nằm trong bộ nhớ của trang. Nếu rời trang thì mất, và trước khi rời có hộp thoại xác nhận.

| Trạng thái | Hiển thị |
| --- | --- |
| Bình thường | Hộp thoại "Bạn đã lưu nội dung tương tự" liệt kê tối đa 5 mục. |
| Đang tải | Nút "Lưu" có spinner trong lúc gọi kiểm tra. |
| Trống | Không có mục tương tự: không hiện hộp thoại, lưu ngay. |
| Lỗi | Lỗi mạng: `InlineAlert` "Thử lại"; không chặn việc lưu. |
| Mất kết nối | Không hỗ trợ ngoại tuyến. Hiện "Mất kết nối" và nút "Thử lại"; không mất dữ liệu đã nhập. |

### 3.2 Sequence

_Skill `sequence`: tương tác giữa các thành phần; nhánh lỗi ghi mã `ERR-xxx`._

```mermaid
sequenceDiagram
    autonumber
    actor U as Người dùng
    participant W as Web (Next.js)
    participant A as API (Library)
    participant DB as SQL Server
    U->>W: Bấm Lưu
    W->>A: GET /api/library/items/similar?kind=word&term=give up
    A->>A: Chuẩn hóa term (BR-LIB-003)
    A->>DB: SELECT TOP 5 WHERE UserId, Kind và NormalizedTerm, mới nhất trước
    A-->>W: 200 {items, totalCount}
    alt Có mục tương tự
        W-->>U: Hộp thoại "Bạn đã lưu nội dung tương tự"
        alt Mở mục cũ để bổ sung
            W-->>U: Form sửa mục cũ (cùng thư viện) + panel nội dung vừa nhập
        else Vẫn tạo mục mới
            W->>A: POST /api/library/items
        else Hủy
            W-->>U: Quay lại form
        end
    else Không có
        W->>A: POST /api/library/items
    end
```

## 4. Acceptance criteria

_Skill `ac`. Văn bản Gherkin trùng với [user story](../requirements/user-stories.md) (nguồn chính thức); sửa ở đó rồi cập nhật lại đây. Script `tools/feature-docs/check_feature_docs.py` kiểm tra hai bản khớp nhau._

```gherkin
Scenario: AC-01 Có mục tương tự
  Given tôi đã có từ vựng "Give up" nghĩa "từ bỏ"
  When tôi thêm từ vựng mới với nội dung "  give   UP " và bấm "Lưu"
  Then mục chưa được lưu
  And hộp thoại "Bạn đã lưu nội dung tương tự" liệt kê mục "Give up" với nghĩa và ngày tạo
  And có hai lựa chọn "Mở mục cũ để bổ sung" và "Vẫn tạo mục mới"

Scenario: AC-02 Mở mục cũ
  When tôi chọn "Mở mục cũ để bổ sung"
  Then tôi tới màn hình sửa mục cũ, và nội dung đang nhập không bị lưu thành mục mới
  And nghĩa, ví dụ, ghi chú tôi đã nhập được giữ lại, hiện bên cạnh để tôi tự chép sang (không tự gộp)

Scenario: AC-03 Vẫn tạo mục mới
  When tôi chọn "Vẫn tạo mục mới"
  Then mục mới được lưu, và mục cũ không thay đổi

Scenario: AC-04 Không gợi ý mục của người khác
  Given người dùng khác có từ vựng "give up"
  And tôi chưa có
  When tôi lưu từ vựng "give up"
  Then không có hộp thoại gợi ý và mục được lưu ngay

Scenario: AC-05 Nhiều mục tương tự
  Given tôi có 7 mục cùng loại và cùng nội dung chuẩn hóa "give up"
  Then hộp thoại hiện 5 mục mới nhất và dòng "và 2 mục khác"

Scenario: AC-06 Không gợi ý mục ở thư viện kia
  Given tôi có mục ngữ pháp tên "give up" nhưng chưa có từ vựng "give up"
  When tôi thêm từ vựng "give up" và bấm "Lưu"
  Then không có hộp thoại gợi ý và từ vựng được lưu ngay
```

| AC | Nội dung | FR | BR | ERR | Wireframe | Test case |
| --- | --- | --- | --- | --- | --- | --- |
| AC-01 | Có mục tương tự | `FR-LIB-ITEM-002` | `BR-LIB-003` | — | W-LIB-13 | TC-LIB-008 |
| AC-02 | Mở mục cũ | `FR-LIB-ITEM-002` | `BR-LIB-003` | — | W-LIB-15 | TC-LIB-009 |
| AC-03 | Vẫn tạo mục mới | `FR-LIB-ITEM-002` | `BR-LIB-003` | — | W-LIB-13, W-LIB-16 | TC-LIB-010 |
| AC-04 | Không gợi ý mục của người khác | `FR-LIB-ITEM-002` | `BR-LIB-006` | — | W-LIB-08, W-LIB-16 | TC-LIB-011 |
| AC-05 | Nhiều mục tương tự | `FR-LIB-ITEM-002` | `BR-LIB-003` | — | W-LIB-14 | TC-LIB-012 |
| AC-06 | Không gợi ý mục ở thư viện kia | `FR-LIB-ITEM-002` | `BR-LIB-003`, `BR-LIB-017` | — | W-LIB-08, W-LIB-16 | TC-LIB-053 |

## 5. Wireframe

_Wireframe mức thấp (khung xám, đúng bố cục màn hình thật) vẽ bằng script `tools/wireframes/` và lưu ở [wireframes/](../wireframes/); sửa script rồi chạy `python3 tools/wireframes/build.py` và `python3 tools/wireframes/sync_docs.py`, không sửa tay file SVG. Quy tắc: vẽ đủ mọi màn hình, hộp thoại và trạng thái mà AC của story nhắc tới._

### W-LIB-08 — Thêm từ vựng: form mặc định (`/library/vocabulary/new`)

![W-LIB-08 Thêm từ vựng: form mặc định](../wireframes/W-LIB-08.svg)

- Mở từ nút "+ Thêm từ vựng" của thư viện Từ vựng; không có bước chọn loại (chọn thư viện đã là chọn loại).
- Thứ tự trường: Từ\*, Phiên âm, Nghĩa\*, Loại từ, Ví dụ, Ghi chú. Dấu \* là bắt buộc (Từ, Nghĩa).
- Phiên âm tự điền từ nguồn từ điển (Anh-Anh) khi rời ô "Từ"; người dùng sửa được. Loại từ là danh sách chọn: Danh từ, Động từ, Tính từ, Trạng từ, Giới từ, Liên từ, Thán từ, Cụm từ, Khác; để trống được.
- Đang lưu: nút "Lưu" có spinner, các ô bị khóa, "Hủy" vẫn dùng được.
- Mỗi lần mở form sinh một `clientRequestId`; bấm Lưu hai lần hoặc gửi lại chỉ tạo một mục.

### W-LIB-13 — Hộp thoại mục tương tự

![W-LIB-13 Hộp thoại mục tương tự](../wireframes/W-LIB-13.svg)

- `role="dialog"`, `aria-modal`; focus vào tiêu đề khi mở; Esc tương đương đóng hộp thoại và trả focus về nút Lưu (mục chưa được lưu).
- Chỉ tìm trong cùng thư viện (từ vựng so với từ vựng, ngữ pháp so với ngữ pháp). Nút "Mở mục cũ để bổ sung" mở mục mới nhất; không bao giờ tự gộp.

### W-LIB-14 — Hộp thoại mục tương tự: nhiều mục

![W-LIB-14 Hộp thoại mục tương tự: nhiều mục](../wireframes/W-LIB-14.svg)

- Liệt kê tối đa 5 mục mới nhất; nhiều hơn thì hiện dòng "và N mục khác" (ví dụ "và 2 mục khác" khi có 7 mục).
- Nút "Mở" trên từng dòng mở đúng mục đó.

### W-LIB-15 — Sửa mục cũ kèm nội dung vừa nhập (từ hộp thoại mục tương tự)

![W-LIB-15 Sửa mục cũ kèm nội dung vừa nhập](../wireframes/W-LIB-15.svg)

- Panel "Nội dung bạn vừa nhập" chỉ để người dùng tự chép sang mục cũ; không tự gộp vào mục cũ.
- Dữ liệu panel chỉ nằm trong bộ nhớ của trang; rời trang thì mất và có hộp thoại xác nhận.

### W-LIB-16 — Chi tiết từ vựng: đầy đủ (`/library/vocabulary/{id}`)

![W-LIB-16 Chi tiết từ vựng: đầy đủ](../wireframes/W-LIB-16.svg)

- Từ cỡ `text.term`; hàng thông tin: loại từ (nếu có), phiên âm (nếu có, kèm nguồn khi do hệ thống điền). Các khối: Nghĩa, Ví dụ theo thứ tự, Ghi chú; ngày tạo và ngày sửa ở cuối.
- Nút "Xóa" kiểu viền, có icon cảnh báo, không dùng nền đặc giống nút chính.
- Toast "Đã lưu" (`role="status"`) chỉ hiện ngay sau khi lưu; sau khi sửa thì toast là "Đã lưu thay đổi".

## 6. API

_Skill `api-design`; lỗi theo Problem Details (RFC 9457) như ADR 0002. Quy ước chung ở [README.md](README.md)._

| Method và path | Body | Thành công | Lỗi |
| --- | --- | --- | --- |
| `GET /api/library/items/similar?kind=&term=` | — | `200 { items: Summary[] (tối đa 5, cùng `kind`), totalCount }`; `term` rỗng thì danh sách rỗng | 400-01 (`term` > 1000 ký tự, thiếu hoặc sai `kind`) |

```http
GET /api/library/items/similar?kind=word&term=give%20up
```

Phản hồi:

```json
{ "items": [ { "id": "1b2c...", "kind": "word", "term": "Give up", "meaning": "từ bỏ", "ipa": null, "createdAt": "2026-11-02T03:00:00Z" } ], "totalCount": 1 }
```

`kind` bắt buộc, chỉ trả mục cùng `kind`. `term` rỗng trả danh sách rỗng; `term` dài hơn 1000 ký tự trả `400 ERR-LIB-400-01`.

## 7. Truy vết test case

| TC | Loại | Bước chính | Kết quả mong đợi |
| --- | --- | --- | --- |
| `TC-LIB-008` | INT + E2E | Có từ vựng "Give up" → thêm từ vựng "  give   UP " | `/similar` trả 1 mục; UI hiện dialog; database chưa có mục mới |
| `TC-LIB-009` | E2E | Chọn "Mở mục cũ để bổ sung" | Tới trang sửa mục cũ; panel hiện nội dung vừa nhập; số mục không đổi |
| `TC-LIB-010` | E2E | Chọn "Vẫn tạo mục mới" | Có 2 mục cùng `NormalizedTerm`; mục cũ không đổi |
| `TC-LIB-011` | INT | User B có "give up", user A gọi `/similar` | A nhận danh sách rỗng |
| `TC-LIB-012` | INT | 7 mục trùng → `/similar` | 5 mục mới nhất; `totalCount = 7` |
| `TC-LIB-053` | INT + E2E | Có ngữ pháp tên "give up"; thêm từ vựng "give up" (và ngược lại) | `/similar?kind=word` trả rỗng; UI không hiện hộp thoại, lưu ngay |

## 8. Lịch sử sửa đổi

| Phiên bản | Ngày | Thay đổi |
| --- | --- | --- |
| 0.3 | 2026-11-09 | Tách từ `srs.md` và `design/` thành file riêng cho story; thêm FR chi tiết, sequence, state, bảng AC → FR/BR/ERR/TC. |
| 0.4 | 2026-11-11 | Mục tương tự chỉ tính trong cùng thư viện (`kind` bắt buộc ở `/similar`); thêm AC-06, TC-LIB-053; thay wireframe ASCII bằng SVG. |
