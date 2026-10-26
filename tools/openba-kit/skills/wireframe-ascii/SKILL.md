---
name: wireframe-ascii
description: "Wireframe dạng ký tự, phác nhanh trong tài liệu"
metadata:
  phase: 05-screen-design
  category: business-analysis
  version: 1.0.0
  is_core: false
---

# /wireframe-ascii — Wireframe dạng Ký tự ASCII [STANDARD WORKFLOW]

Wireframe dạng ký tự, phác nhanh trong tài liệu

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/wireframe-ascii`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/13-wireframe-html-guidelines.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/30-wireframe-ascii.md`

## Vị trí lưu tệp mặc định
- `docs/{feature}/ui/wireframe-ascii.md`

## Workflow thực hiện
1. Vẽ phác thảo bố cục màn hình bằng ký tự Unicode khung bảng (┌─┐, │, └─┘).
2. Thể hiện các trường input, label, button, bảng dữ liệu trực tiếp trong markdown.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
