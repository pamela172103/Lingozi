---
name: code-to-srs
description: "Đọc source code hệ thống cũ, dựng lại bộ SRS kèm trích dẫn dòng code"
metadata:
  phase: 02-elicit-spec
  category: business-analysis
  version: 1.0.0
  is_core: false
---

# /code-to-srs — Đọc source code dựng lại SRS [STANDARD WORKFLOW]

Đọc source code hệ thống cũ, dựng lại bộ SRS kèm trích dẫn dòng code

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/code-to-srs`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/01-fr-naming-convention.md`\n- `rules/05-srs-ieee-830.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/14-code-to-srs.md`

## Vị trí lưu tệp mặc định
- `docs/{feature}/srs/code-derived-spec.md`

## Workflow thực hiện
1. Đọc code controllers, models, validation rules, services của tính năng.
2. Trích xuất logic nghiệp vụ thực tế đang chạy trong code.
3. Ánh xạ thành danh sách FR, BR, ERR kèm trích dẫn file và số dòng code tương ứng.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
