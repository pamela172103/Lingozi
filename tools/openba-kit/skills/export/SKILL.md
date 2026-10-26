---
name: export
description: "Xuất gói tài liệu PDF / Word / HTML cho stakeholder"
metadata:
  phase: 09-handoff-ops
  category: business-analysis
  version: 1.0.0
  is_core: false
---

# /export — Đóng gói Xuất bản Bộ Tài liệu [STANDARD WORKFLOW]

Xuất gói tài liệu PDF / Word / HTML cho stakeholder

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/export`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/05-srs-ieee-830.md`\n- `rules/19-document-versioning-rules.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/08-srs.md`

## Vị trí lưu tệp mặc định
- `dist/documentation-bundle.zip`

## Workflow thực hiện
1. Thu thập toàn bộ tài liệu đã được duyệt của dự án.
2. Đóng gói thành bản HTML single-page hoặc chuẩn bị file docx/pdf hoàn chỉnh kèm mục lục tự động.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
