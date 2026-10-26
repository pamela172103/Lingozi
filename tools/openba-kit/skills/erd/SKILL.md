---
name: erd
description: "Sơ đồ quan hệ dữ liệu (Mermaid)"
metadata:
  phase: 03-diagrams
  category: business-analysis
  version: 1.0.0
  is_core: true
---

# /erd — Sơ đồ Quan hệ Dữ liệu (Mermaid ERD) 🌟 [CORE WORKFLOW]

Sơ đồ quan hệ dữ liệu (Mermaid)

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/erd`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/09-data-dictionary-standard.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/20-erd-mermaid.md`

## Vị trí lưu tệp mặc định
- `docs/{feature}/srs/erd.md`

## Workflow thực hiện
1. Liệt kê các bảng / entities cốt lõi của tính năng.
2. Vẽ sơ đồ Mermaid `erDiagram` với mối quan hệ `||--o{`, `||--||`.
3. Liệt kê đầy đủ thuộc tính, kiểu dữ liệu, khóa PK/FK.
4. Lập bảng từ điển dữ liệu (Data Dictionary) chi tiết theo Rule 09.
5. Ghi vào `docs/{feature}/srs/erd.md`.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
