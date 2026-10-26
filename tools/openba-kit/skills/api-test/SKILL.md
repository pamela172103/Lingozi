---
name: api-test
description: "Test API kiểu Postman, sinh collection Bruno chạy được"
metadata:
  phase: 06-api-integration
  category: business-analysis
  version: 1.0.0
  is_core: false
---

# /api-test — Sinh Collection Test API (Bruno / Postman) [STANDARD WORKFLOW]

Test API kiểu Postman, sinh collection Bruno chạy được

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/api-test`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/10-api-contract-standards.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/40-api-test-bruno.bru`

## Vị trí lưu tệp mặc định
- `docs/{feature}/api/collection.bru`

## Workflow thực hiện
1. Tạo tệp collection định dạng Bruno (.bru) hoặc Postman Collection v2.1.
2. Tạo các kịch bản test request kèm assertion tự động kiểm tra HTTP status và body schema.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
