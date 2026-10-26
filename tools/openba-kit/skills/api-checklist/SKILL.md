---
name: api-checklist
description: "Checklist cần test gì cho API"
metadata:
  phase: 06-api-integration
  category: business-analysis
  version: 1.0.0
  is_core: false
---

# /api-checklist — Checklist Kiểm thử Nghiệp vụ API [STANDARD WORKFLOW]

Checklist cần test gì cho API

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/api-checklist`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/10-api-contract-standards.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/39-api-checklist.md`

## Vị trí lưu tệp mặc định
- `docs/{feature}/api/test-checklist.md`

## Workflow thực hiện
1. Lập checklist kiểm tra: Authentication, Rate limiting, Invalid payload, Idempotency key, Webhook retry.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
