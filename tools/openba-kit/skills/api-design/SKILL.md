---
name: api-design
description: "Bản thiết kế tích hợp: các hệ thống phối hợp thế nào"
metadata:
  phase: 06-api-integration
  category: business-analysis
  version: 1.0.0
  is_core: true
---

# /api-design — Thiết kế Hợp đồng API Tích hợp 🌟 [CORE WORKFLOW]

Bản thiết kế tích hợp: các hệ thống phối hợp thế nào

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/api-design`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/10-api-contract-standards.md`\n- `rules/03-err-naming-convention.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/37-api-design.md`

## Vị trí lưu tệp mặc định
- `docs/{feature}/api/api-spec.md`

## Workflow thực hiện
1. Thiết kế danh mục Endpoints RESTful theo Rule 10.
2. Đặc tả Request Headers, Request Body, Response 200 OK, Response Error (400, 401, 404, 422, 500).
3. Định nghĩa cơ chế Webhook / Callback và quy tắc xác thực chữ ký (Signature verification).
4. Lưu vào `docs/{feature}/api/api-spec.md`.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
