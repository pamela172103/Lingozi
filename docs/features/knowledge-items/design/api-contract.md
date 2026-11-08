# API contract — FEAT-02 Mục kiến thức

- Cập nhật: 2026-11-08 (v0.2). Trạng thái: **chờ duyệt**.
- Base path `/api/library/items`.
- Mọi endpoint yêu cầu: phiên đăng nhập, email đã xác thực (FEAT-01). Request thay đổi dữ liệu cần thêm header `X-XSRF-TOKEN`.
- Lỗi dùng `application/problem+json` có trường `code` ([srs.md](../srs/srs.md) §3).

## 1. Kiểu dữ liệu

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

## 2. Endpoint

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

## 3. Trang web

| Route | Nội dung |
| --- | --- |
| `/library` | Danh sách (`?page=`) |
| `/library/items/new` | Form tạo |
| `/library/items/{id}` | Chi tiết |
| `/library/items/{id}/edit` | Form sửa |

Mọi route nằm trong app shell có sidebar ([design system](../../../architecture/design-system.md) §4) và yêu cầu đăng nhập (FEAT-01 US-AUTH-09). Nút "Lưu kiến thức" trên thanh trên (phím tắt `N`) mở `/library/items/new`.
