---
name: dbdiagram
description: "Schema database DBML, import dbdiagram.io, xuất SQL"
metadata:
  phase: 03-diagrams
  category: business-analysis
  version: 1.0.0
  is_core: false
---

# /dbdiagram — Schema CSDL DBML (dbdiagram.io) [STANDARD WORKFLOW]

Schema database DBML, import dbdiagram.io, xuất SQL

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/dbdiagram`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/09-data-dictionary-standard.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/24-dbdiagram.dbml`

## Vị trí lưu tệp mặc định
- `docs/{feature}/srs/schema.dbml`

## Workflow thực hiện
1. Viết schema bằng cú pháp DBML (Database Markup Language).
2. Định nghĩa Table, fields, ref relations, default values.
3. File sẵn sàng copy paste vào dbdiagram.io để render và xuất DDL SQL.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
