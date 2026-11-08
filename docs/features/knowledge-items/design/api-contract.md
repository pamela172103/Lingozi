# API contract — FEAT-02 Mục kiến thức

- Cập nhật: 2026-11-08. Trạng thái: **chờ duyệt**.
- Base path `/api/library/items`.
- Mọi endpoint yêu cầu: phiên đăng nhập, email đã xác thực (FEAT-01). Request thay đổi dữ liệu cần thêm header `X-XSRF-TOKEN`.
- Lỗi dùng `application/problem+json` có trường `code` ([srs.md](../srs/srs.md) §3).

## 1. Kiểu dữ liệu

```jsonc
// KnowledgeItemSummary — dùng trong danh sách
{ "id": "uuid", "kind": "phrasalVerb", "term": "give up", "meaning": "từ bỏ", "createdAt": "2026-11-08T07:00:00Z" }

// KnowledgeItemDetail
{
  "id": "uuid",
  "kind": "phrasalVerb",
  "term": "give up",
  "meaning": "từ bỏ",
  "note": "Không dùng với tân ngữ là người", // null nếu không có
  "source": "Friends S01E01",                // null nếu không có
  "examples": [ { "text": "Don't give up.", "translation": "Đừng bỏ cuộc." } ], // theo thứ tự hiển thị
  "createdAt": "2026-11-08T07:00:00Z",
  "updatedAt": "2026-11-08T07:05:00Z",
  "version": "AAAAAAAAB9E="                  // rowversion base64, gửi lại khi sửa
}

// KnowledgeItemInput — dùng cho POST và PUT
{
  "kind": "phrasalVerb",                      // tùy chọn khi tạo, mặc định "word"
  "term": "give up",
  "meaning": "từ bỏ",
  "note": null,
  "source": null,
  "examples": [ { "text": "Don't give up.", "translation": null } ]
}
```

## 2. Endpoint

| Method và path | Body | Thành công | Lỗi |
| --- | --- | --- | --- |
| `GET /api/library/items?page=1&pageSize=20` | — | `200 { items: Summary[], page, pageSize, totalCount }` | 400-01 |
| `GET /api/library/items/similar?term=` | — | `200 { items: Summary[] (tối đa 5), totalCount }`; `term` rỗng thì trả danh sách rỗng | 400-01 (`term` dài hơn 1000 ký tự) |
| `POST /api/library/items` | `Input` + `clientRequestId` (uuid, bắt buộc) | `201 Detail` + header `Location`; `200 Detail` nếu `clientRequestId` đã dùng (BR-LIB-008) | 400-01, 422-01 |
| `GET /api/library/items/{id}` | — | `200 Detail` | 404-01 |
| `PUT /api/library/items/{id}` | `Input` + `version` (bắt buộc) | `200 Detail` (có `version` mới) | 400-01, 404-01, `409-01` kèm trường `current: Detail` |
| `DELETE /api/library/items/{id}` | — | `204` | 404-01 |

`id` không đúng định dạng uuid cũng trả 404-01, để không phân biệt với mục không tồn tại.

## 3. Trang web

| Route | Nội dung |
| --- | --- |
| `/library` | Danh sách (`?page=`) |
| `/library/items/new` | Form tạo |
| `/library/items/{id}` | Chi tiết |
| `/library/items/{id}/edit` | Form sửa |

Mọi route nằm trong app shell có sidebar ([design system](../../../architecture/design-system.md) §4) và yêu cầu đăng nhập (FEAT-01 US-AUTH-09). Nút "Lưu kiến thức" trên thanh trên (phím tắt `N`) mở `/library/items/new`.
