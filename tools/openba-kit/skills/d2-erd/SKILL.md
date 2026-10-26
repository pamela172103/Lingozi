---
name: d2-erd
description: "Sơ đồ quan hệ dữ liệu bản đẹp (D2)"
metadata:
  phase: 03-diagrams
  category: business-analysis
  version: 1.0.0
  is_core: false
---

# /d2-erd — Sơ đồ ERD đồ họa đẹp (D2) [STANDARD WORKFLOW]

Sơ đồ quan hệ dữ liệu bản đẹp (D2)

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/d2-erd`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/09-data-dictionary-standard.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/21-erd-d2.d2`

## Vị trí lưu tệp mặc định
- `docs/{feature}/srs/erd.d2`

## Workflow thực hiện
1. Chuyển đổi cấu trúc entities sang cú pháp D2lang.
2. Định cấu hình styling, container và connections.
3. Xuất file `erd.d2` sẵn sàng render sang SVG.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
