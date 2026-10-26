---
name: api-doc
description: "Đọc tài liệu API đối tác thành bản tóm tắt nghiệp vụ"
metadata:
  phase: 06-api-integration
  category: business-analysis
  version: 1.0.0
  is_core: false
---

# /api-doc — Tóm tắt Nghiệp vụ Tài liệu API [STANDARD WORKFLOW]

Đọc tài liệu API đối tác thành bản tóm tắt nghiệp vụ

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/api-doc`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/10-api-contract-standards.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/36-api-doc.md`

## Vị trí lưu tệp mặc định
- `docs/{feature}/api/api-doc-summary.md`

## Workflow thực hiện
1. Đọc file OpenAPI/Swagger hoặc tài liệu PDF của đối tác.
2. Chuyển ngữ từ góc nhìn kỹ thuật thuần túy sang góc nhìn nghiệp vụ BA: Luồng gọi, dữ liệu cần truyền, điều kiện thành công.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
