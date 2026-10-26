---
name: reverse-preview
description: "Trang HTML xem bộ tài liệu tái lập, kèm mức độ tin cậy từng mục"
metadata:
  phase: 09-handoff-ops
  category: business-analysis
  version: 1.0.0
  is_core: false
---

# /reverse-preview — Trang HTML Duyệt Tài liệu Tái lập & Độ tin cậy [STANDARD WORKFLOW]

Trang HTML xem bộ tài liệu tái lập, kèm mức độ tin cậy từng mục

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/reverse-preview`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/18-knowledge-graph-metadata.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/31-wireframe-html.html`

## Vị trí lưu tệp mặc định
- `docs/{feature}/reverse-preview.html`

## Workflow thực hiện
1. Dựng giao diện HTML hiển thị tài liệu thu được từ `/reverse-doc` hoặc `/code-to-srs`.
2. Hiển thị badge màu tương ứng với Confidence Score (Xanh: High >90%, Vàng: Medium 60-90%, Đỏ: Low <60%).

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
