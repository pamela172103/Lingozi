# Tiêu chuẩn Thiết kế Hợp đồng API (API Contract Specification)

## 1. Nguyên tắc thiết kế RESTful
- Sử dụng danh từ số nhiều cho resource URL: `/api/v1/orders`, `/api/v1/users/{user_id}`.
- Sử dụng chuẩn HTTP Verbs:
  - `GET`: Truy vấn dữ liệu (Idempotent, Safe).
  - `POST`: Tạo mới tài nguyên.
  - `PUT`: Cập nhật toàn bộ tài nguyên (Idempotent).
  - `PATCH`: Cập nhật một phần trường dữ liệu.
  - `DELETE`: Xóa tài nguyên (Idempotent).

## 2. Chuẩn định dạng Response Body
```json
{
  "success": true,
  "data": {},
  "error": null,
  "meta": { "page": 1, "limit": 20, "total": 150 },
  "timestamp": "2026-10-15T10:30:00Z"
}
```
