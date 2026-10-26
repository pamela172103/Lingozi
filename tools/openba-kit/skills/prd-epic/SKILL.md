---
name: prd-epic
description: "Đặc tả 1 tính năng: capability P0/P1/P2, kế hoạch release"
metadata:
  phase: 02-elicit-spec
  category: business-analysis
  version: 1.0.0
  is_core: false
---

# /prd-epic — Đặc tả 1 tính năng cấp Epic [STANDARD WORKFLOW]

Đặc tả 1 tính năng: capability P0/P1/P2, kế hoạch release

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/prd-epic`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/01-fr-naming-convention.md`\n- `rules/07-invest-user-story.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/07-prd-epic.md`

## Vị trí lưu tệp mặc định
- `docs/{feature}/epic-spec.md`

## Workflow thực hiện
1. Đặt tên Epic và mục tiêu nghiệp vụ độc lập.
2. Phân rã Epic thành các Capabilities/Tính năng con kèm ưu tiên P0/P1/P2.
3. Lập lộ trình release chi tiết cho riêng Epic này.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
