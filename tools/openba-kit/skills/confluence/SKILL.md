---
name: confluence
description: "Đồng bộ 2 chiều tài liệu với Confluence"
metadata:
  phase: 09-handoff-ops
  category: business-analysis
  version: 1.0.0
  is_core: false
---

# /confluence — Đồng bộ Tài liệu lên Confluence [STANDARD WORKFLOW]

Đồng bộ 2 chiều tài liệu với Confluence

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/confluence`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/05-srs-ieee-830.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/08-srs.md`

## Vị trí lưu tệp mặc định
- `docs/confluence-sync-log.md`

## Workflow thực hiện
1. Chuyển đổi định dạng Markdown sang Confluence Storage Format (XHTML).
2. Tự động gắn nhãn (labels), macro bảng và cây phân cấp trang tài liệu trên Confluence.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
